# Architecture Notes

## Build System Simplification (2025-11-08)

### Previous Architecture Issues

The original build system had a complex deployment workflow:
- Used Nix flakes for dependency management
- Deployed by checking out a separate `production` branch
- Moved built files between branches using temporary directories
- Complex stash/unstash logic to preserve working state
- High risk of losing work or corrupting the git state

### Current Architecture

**Build Output**: `docs/` directory on current branch

**Build Process** (src/build.ts):
```
1. Generate root index.html → docs/index.html
2. Read source/index.html as entry point
3. Recursively process dependencies:
   - Each file determines its own dependencies
   - Build system tracks seen files to prevent cycles
   - Ignores .git, node_modules, docs directories
4. Output all processed files to docs/source/
```

**File Type Registry** (src/file/index.ts):
- Dynamically loads all file type handlers from src/file/filetype/
- Each handler exports a class with:
  - `static filetypes`: Array of extensions this class handles
  - `static targets`: Array of extensions this can compile to
  - `static create()`: Factory method to instantiate if file exists
  - Instance methods for transformation (e.g., `ts()`, `js()`, `html()`)

### Critical Fix: TypeScript/JavaScript File Type Conflict

**Problem**: Both `JavascriptFile` and `TypeScriptFile` were registering the "js" extension:
- src/file/filetype/js.ts: `static filetypes = ["js"]`
- src/file/filetype/ts.ts: `static filetypes = ["ts", "tsx", "js", "jsx"]`
- Caused "Filetype js already exists" error on build

**Solution** (src/file/filetype/ts.ts:19-20):
```typescript
class TypeScriptFile extends SourceFile {
  static filetypes = ["ts", "tsx"];  // Only register TS extensions
  static targets = ["js"];            // Declare we compile to JS

  // Removed complex logic to find .ts when .js requested
  // Now the compile map handles this automatically
  static create(filePath: Path, cfg: PageSettings) {
    if (filePath.exists()) {
      return new TypeScriptFile(filePath, cfg);
    }
    return null;
  }
}
```

**How it works now**:
- TypeScript files register `.ts` and `.tsx` extensions only
- They declare `targets = ["js"]` to indicate they compile to JS
- The compile map (src/file/index.ts:22) tracks this relationship
- When a `.js` file is requested but not found, the system:
  1. Looks up `compileMap["js"]` → finds `["ts", "tsx"]`
  2. Tries to read `.ts` version of the file
  3. Calls `.js(cfg)` method to transpile TypeScript → JavaScript

### File Type Handler Examples

**TypeScript** (ts.ts):
- Handles: `.ts`, `.tsx`
- Compiles to: `.js`
- Uses TypeScript compiler API for transpilation

**JavaScript** (js.ts):
- Handles: `.js`
- Direct passthrough, but writes both `.js` and no-extension versions
- Supports CommonJS `require()` at build time

**Markdown** (md.ts):
- Handles: `.md`
- Likely compiles to HTML (would need to verify)

**SCSS** (scss.ts):
- Handles: `.scss`
- Compiles to: `.css`

### Dependency Resolution

Each file class implements `dependencies(cfg)` to declare its dependencies.
Example flow for an HTML file:
1. HTML file links to `<script src="/lib.js">`
2. System looks for `/lib.js`
3. Not found → checks compile map
4. Finds `/lib.ts` instead
5. Creates TypeScriptFile for lib.ts
6. Transpiles to JS and writes as lib.js
7. Recursively processes lib.ts's dependencies

### Deployment Workflow

**Old way** (removed):
```
1. Stash current changes
2. Move docs/ to /tmp
3. Checkout production branch
4. Remove all files
5. Move /tmp back to root
6. Commit and push
7. Checkout original branch
8. Unstash
```

**New way** (src/deploy.ts):
```
1. Add all changes (including docs/)
2. Commit on current branch
3. Push current branch
```

Much simpler! Designed for GitHub Pages "publish from /docs folder" option.

### Configuration

All configuration lives in src/main.ts `makeConfig()`:
- `sourceDir`: `.` (current directory)
- `targetDir`: `./docs`
- `ignorePaths`: `.git`, `node_modules`, `docs`
- `resourcesDir`: `./resources`
- `faviconsDir`: `./favicons`

### Known Issues

1. Build tries to process all files, including node_modules
   - Mitigated by adding to ignorePaths
   - Still shows warnings about missing CSS/JS conversions
   - Not breaking, just noisy

2. The build output is verbose with lots of debug logging
   - Every file read is logged
   - Could benefit from log levels

3. Circular dependency tracking is basic
   - Uses simple Set of file paths
   - Works but could be more sophisticated

### Dependencies

- **Bun**: Runtime and package manager
- **TypeScript**: For TS → JS compilation
- **SASS**: For SCSS → CSS compilation
- **mime**: File type detection
- **ohm-js**: Parser generator (likely for custom DSL)
- **tree-sitter-highlight**: Syntax highlighting

No Nix required anymore!
