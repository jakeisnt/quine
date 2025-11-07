# AGENTS.md - Quine Codebase Documentation

This document provides a comprehensive overview of the quine codebase for AI agents and developers working on the project.

## Table of Contents
1. [Overview](#overview)
2. [Architecture](#architecture)
3. [File Structure](#file-structure)
4. [Core Systems](#core-systems)
5. [Class Hierarchy](#class-hierarchy)
6. [Build System](#build-system)
7. [Development Workflow](#development-workflow)
8. [Recent Improvements](#recent-improvements)
9. [Known Issues](#known-issues)
10. [Common Patterns](#common-patterns)

---

## Overview

**Quine** is a static site generator written in TypeScript that runs on Bun. It transforms source files (Markdown, TypeScript, SCSS, etc.) into a static HTML website through recursive dependency resolution.

### Key Characteristics
- **Runtime**: Bun (not Node.js)
- **Language**: TypeScript with loose type safety in some areas
- **Architecture**: Dependency graph traversal with recursive building
- **Entry Point**: `src/main.ts`
- **Output**: Static HTML files in `docs/` directory
- **Dev Server**: Built-in hot-reload server on port 4242

---

## Architecture

### High-Level Flow
```
CLI Command → Configuration → Build/Serve/Deploy
                ↓
         File Resolution
                ↓
         Recursive Building
                ↓
         HTML Generation
                ↓
         Static Output
```

### Dependency Resolution Model
The system starts from a root file (typically `index.html`) and recursively builds all dependencies:

1. Read root file
2. Determine file type from extension
3. Parse dependencies (links, imports, etc.)
4. Recursively build each dependency
5. Track visited files to prevent infinite loops
6. Write output to target directory

### Core Design Patterns

**1. Factory Pattern** - `readFile()` function dynamically creates appropriate file type instances
**2. Strategy Pattern** - Each file type implements its own `read()`, `write()`, `dependencies()`, `serve()` methods
**3. Template Method** - Base `File` class provides structure, subclasses implement specifics
**4. Registry Pattern** - File types are auto-discovered from `src/file/filetype/` directory
**5. Builder Pattern** - HTML DSL constructs page syntax trees

---

## File Structure

```
quine/
├── src/
│   ├── main.ts                  # CLI entry point
│   ├── config.ts                # Configuration loader (NEW)
│   ├── build.ts                 # Build orchestration
│   ├── deploy.ts                # GitHub Pages deployment
│   │
│   ├── file/                    # File type system (CORE)
│   │   ├── index.ts            # File type registry & readFile()
│   │   ├── utils.ts            # File utilities (NEW - breaks circular deps)
│   │   ├── classes/
│   │   │   ├── file.ts         # Base File class
│   │   │   ├── binary.ts       # Binary files (images, etc.)
│   │   │   ├── text.ts         # Plain text files
│   │   │   ├── source.ts       # Source code files
│   │   │   └── utils.ts        # wrapFile() for file transformation
│   │   │
│   │   └── filetype/           # 14 file type implementations
│   │       ├── ts.ts           # TypeScript/JavaScript
│   │       ├── md.ts           # Markdown
│   │       ├── html.ts         # HTML
│   │       ├── css.ts          # CSS
│   │       ├── scss.ts         # SCSS/SASS
│   │       ├── directory.ts    # Directory listings
│   │       ├── js.ts           # JavaScript
│   │       ├── act.ts          # Custom .act format
│   │       ├── clj.ts          # Clojure
│   │       ├── nix.ts          # Nix
│   │       └── org.ts          # Org-mode
│   │
│   ├── html/                    # HTML generation system
│   │   ├── dsl.ts              # Hiccup-like HTML DSL (NO GLOBAL STATE)
│   │   ├── builder.ts          # HtmlPage class
│   │   ├── components.ts       # Component loader
│   │   └── parseDSL.ts         # DSL parsing utilities
│   │
│   ├── server/                  # Development server
│   │   ├── createServer.ts     # Bun HTTP server with WebSocket
│   │   ├── directoryServer.ts  # Serves entire directory
│   │   └── singleFileServer.ts # Serves single file with hot reload
│   │
│   ├── pages/                   # Page templates
│   │   └── home.ts             # Homepage template
│   │
│   ├── types/                   # TypeScript types
│   │   ├── site.ts             # PageSettings type
│   │   └── html.ts             # HTML DSL types
│   │
│   └── utils/                   # Utilities
│       ├── path.ts             # Path manipulation class
│       ├── url.ts              # URL handling
│       ├── cmd.ts              # Shell command execution
│       ├── cli.ts              # CLI argument parsing
│       ├── git/                # Git operations
│       │   ├── repo.ts         # Repo class
│       │   ├── repofile.ts     # RepoFile class
│       │   └── commit.ts       # Commit class
│       └── ...
│
├── components/                  # Reusable UI components
│   ├── Header/
│   ├── Sidebar/
│   ├── PrevNextUpButtons/      # Uses getFileDirectory()
│   └── ...
│
├── resources/                   # Static resources
│   ├── dev-server.ts           # Hot reload WebSocket client
│   └── ...
│
├── test/                        # Test suite
│   ├── integration/
│   └── utils/
│
├── quine.config.json            # Site configuration (NEW)
├── package.json
└── tsconfig.json
```

---

## Core Systems

### 1. Configuration System (NEW)

**Location**: `src/config.ts`

```typescript
interface QuineConfig {
  siteName: string;
  url: string;
  port?: number;
  websocketPath?: string;
  sourceDir: string;
  targetDir: string;
  resourcesDir: string;
  faviconsDir: string;
  ignorePaths: string[];
  deploymentBranch?: string;
}
```

**Loading**: `loadConfig(configPath?)` reads from `quine.config.json` or uses defaults

**Usage**: Called once in `src/main.ts`, passed throughout the system as `PageSettings`

### 2. File Type System

**Central Registry**: `src/file/index.ts`

#### Key Functions

**`readFile(pathArg: Path | string, cfg: PageSettings): File | undefined`**
- Entry point for all file reading
- Determines file type from extension
- Returns appropriate File subclass instance
- Handles compilation targets (e.g., .scss → .css)

**`getFiletypeMap(cfg: PageSettings): FiletypeMap`**
- Lazy-loaded registry of extension → File class mappings
- Auto-discovers file types from `src/file/filetype/` directory
- Bootstraps by reading the filetype directory itself
- Caches result on first call

**`getFiletypeClass(path: Path, cfg: PageSettings): typeof File`**
- Maps file extension to File class
- Falls back to TextFile for unknown extensions

#### Compilation Target System

```typescript
// Maps target extensions to source extensions
const compileMap: { [key: string]: string[] } = {}

// Example: If requesting .css file, checks for .scss sources
// TypeScript class defines:
static filetypes = ["scss", "sass"]
static targets = ["css"]
```

### 3. HTML DSL System

**Location**: `src/html/dsl.ts`

**Important**: NO GLOBAL STATE - config is passed through all functions

#### Hiccup-like Syntax
```typescript
["div.className#id", { attr: "value" },
  ["h1", "Hello"],
  ["p", "World"]
]

// Renders to:
<div class="className" id="id" attr="value">
  <h1>Hello</h1>
  <p>World</p>
</div>
```

#### Key Functions
- `htmlPage(syn: PageSyntax, cfg: PageSettings)` - Main entry point
- `build(list: HtmlNode, buffer, dependencies, config)` - Recursive builder
- `buildTag()` - Individual tag builder
- `buildComponent()` - Component renderer

#### Dependency Tracking
The DSL automatically tracks dependencies from `href` and `src` attributes:
```typescript
{ dependsOn: [{ src: "/path/to/resource" }], body: "<html>..." }
```

### 4. Component System

**Location**: `src/html/components.ts` + `components/` directory

Components are TypeScript files that export a function returning:
```typescript
{
  dependsOn: Dependency[],  // Files this component depends on
  body: PageSyntax           // Hiccup-like HTML structure
}
```

**Component Discovery**: Uses `require()` to dynamically load from `components/` directory

**Naming Convention**: PascalCase component names (e.g., `Header`, `Sidebar`)

### 5. Path System

**Location**: `src/utils/path.ts`

**Class**: `Path` - Immutable path representation

**Key Methods**:
- `Path.create(pathArg)` - Factory method (accepts Path or string)
- `.join(relativePath)` - Append to path
- `.parent` - Get parent directory
- `.extension` - Get file extension
- `.replaceExtension(newExt)` - Change extension
- `.relativeTo(basePath, newBase?)` - Get relative path
- `.normalize()` - Normalize path separators
- `.exists()` - Check if path exists on filesystem
- `.readDirectory()` - List directory contents
- `.move(from, to)` - Move file/directory (uses rsync)
- `.writeString(content)` - Write string to file
- `.watch(callback)` - Watch for file changes

**Important**: All paths are normalized to absolute paths internally

### 6. Build System

**Location**: `src/build.ts`

#### Main Function: `buildFromPath(settings: PageSettings)`

**Process**:
1. Write root index.html (generated from homepage template)
2. Read source index.html
3. Initialize set of visited paths (includes ignore paths, target dir)
4. Call `buildSiteFromFile()` recursively

#### Function: `buildSiteFromFile(file, settings, filesSeenSoFar)`

**Process**:
1. Check if already visited (prevent infinite loops)
2. Mark as visited
3. Write file to target directory
4. Get file dependencies
5. Recursively build each dependency

**Error Handling**: (NEW)
- Try-catch around write operation (fails entire build)
- Try-catch around dependency building (continues with others)
- Comprehensive logging at each step

### 7. Development Server

**Location**: `src/server/`

#### Directory Server (`directoryServer.ts`)
- Serves entire source directory
- Hot reloads on file changes
- WebSocket connection at `/__devsocket`
- Port 4242 (configurable in quine.config.json)

#### Single File Server (`singleFileServer.ts`)
- Serves single file with hot reload
- Watches file for changes
- Sends reload messages via WebSocket

#### Hot Reload Client (`resources/dev-server.ts`)
- Injected into served HTML
- Connects to WebSocket
- Reloads page on change events
- Cache-busts JS files with query params

### 8. Deployment System

**Location**: `src/deploy.ts`

**Target**: GitHub Pages (configurable branch via config)

#### Function: `commitFolderToBranch(repo, folderToCommit, targetBranch)`

**Process** (with error handling and recovery):
1. Verify deployment folder exists
2. Stash current changes
3. Move deployment folder to /tmp
4. Fetch deployment branch from remote
5. Checkout deployment branch
6. Remove all untracked files
7. Move /tmp contents to repo root
8. Commit and push
9. Return to original branch
10. Restore deployment folder from /tmp
11. Restore stashed changes

**Error Recovery**: Each step has try-catch with cleanup and instructions

---

## Class Hierarchy

### File Type Class Hierarchy

```
File (abstract base class)
│
├── Properties:
│   ├── path: Path                    # Absolute path to file
│   ├── cachedConfig: PageSettings    # Config used in lifetime
│   └── fakeFileOf?: File            # For wrapped files
│
├── Static Properties:
│   ├── filetypes: string[]          # Extensions this class handles
│   └── targets?: string[]           # Extensions this can compile to
│
├── Methods:
│   ├── static create(path, cfg): File | undefined
│   ├── read(): void
│   ├── write(config): this
│   ├── serve(config): { contents, mimeType }
│   ├── dependencies(config): File[]
│   ├── text(config): string
│   ├── isDirectory(): boolean
│   └── watch(callback): CloseWatcher
│
└── Subclasses:
    │
    ├── BinaryFile
    │   └── For: images, fonts, etc.
    │
    ├── TextFile
    │   ├── For: .txt, unknown text formats
    │   └── read(): reads file as UTF-8 string
    │
    └── SourceFile (extends TextFile)
        ├── For: source code files
        │
        ├── TypeScriptFile (.ts, .tsx, .js, .jsx)
        │   ├── Transpiles TypeScript to JavaScript
        │   ├── .js() returns wrapped JSFile
        │   └── Uses TypeScript compiler API
        │
        ├── MarkdownFile (.md)
        │   ├── Converts to HTML
        │   ├── Syntax highlighting for code blocks
        │   └── .html() returns wrapped HtmlFile
        │
        ├── HtmlFile (.html, .htm, .svg)
        │   ├── Parses HTML for dependencies
        │   ├── Extracts links, scripts, styles
        │   └── Can render inline or as page
        │
        ├── JavascriptFile (.js)
        │   ├── .require() dynamically imports
        │   └── Used for component loading
        │
        ├── CSSFile (.css)
        │   └── Served as-is
        │
        ├── SCSSFile (.scss, .sass)
        │   ├── targets: ["css"]
        │   ├── Compiles to CSS using sass library
        │   └── .css() returns wrapped CSSFile
        │
        ├── ActFile (.act)
        │   └── Custom format for the site
        │
        ├── ClojureFile (.clj)
        │   └── Clojure syntax support
        │
        ├── NixFile (.nix)
        │   └── Nix expression support
        │
        └── OrgFile (.org)
            └── Org-mode format support
```

### Directory Class

**Special Case**: `Directory` extends `File` but represents directories

```typescript
class Directory extends File {
  static filetypes = ["dir"]

  // Caches for performance
  private enumeratedContents?: File[]
  private enumeratedDependencies?: File[]
  private enumeratedHtml?: HtmlPage

  // Methods:
  contents(cfg?, { omitNonJSFiles }): File[]
  tree(cfg): File[]               // Recursive flattened tree
  dependencies(cfg): File[]       // All files in directory
  asHtml(cfg): HtmlPage          // Render directory listing
}
```

**Important**: Directory detection is by checking if path has no extension

### File Wrapping Pattern

**Location**: `src/file/classes/utils.ts`

**Function**: `wrapFile(sourceFile, getText, options)`

Used to create "virtual" files that are transformations of source files:
- TypeScript → JavaScript
- SCSS → CSS
- Markdown → HTML

**Mechanism**:
1. Clone source file
2. Override methods with `Object.defineProperty`
3. Set `fakeFileOf` to point to original
4. Return wrapped file

**Example**:
```typescript
// In TypeScriptFile class:
js(cfg): JSFile {
  return wrapFile(this, (f) => tsToJs(f, cfg), {
    extension: "js",
  }) as JSFile;
}
```

---

## Build System

### Build Process Details

#### 1. Configuration Phase
```typescript
const cfg = loadConfig();  // From quine.config.json or defaults
```

#### 2. Root File Generation
```typescript
// Creates /docs/index.html from homepage template
const rootFile = targetDir.join("/index.html");
rootFile.writeString(homePage(settings).serve(settings).contents);
```

#### 3. Source Index Reading
```typescript
// Reads /index.html as starting point
const dir = readFile(sourceDir.join("/index.html"), cfg);
```

#### 4. Visited Path Tracking
```typescript
const filePathsSeenSoFar = new Set([
  ...ignorePaths,
  targetDir.toString(),
  ".git", ".direnv", "node_modules"
]);
```

#### 5. Recursive Building
```typescript
buildSiteFromFile(dir, cfg, filePathsSeenSoFar);
```

### Dependency Resolution Examples

**HTML File**:
```html
<link rel="stylesheet" href="style.css">
<script src="app.js"></script>
```
Dependencies: `[style.css, app.js]`

**Markdown File**:
```markdown
![Image](image.png)
[Link](page.html)
```
Dependencies: `[image.png, page.html]`

**TypeScript File**:
```typescript
import { foo } from "./module.ts";
```
Dependencies: `[module.ts]` (via AST parsing)

### Target Directory Structure

```
docs/
├── index.html              # Root page (generated)
└── source/                 # Built source files
    ├── index.html         # Source index (built)
    ├── page.html
    ├── style.css          # Compiled from .scss
    ├── app.js             # Transpiled from .ts
    └── subdirectory/
        └── ...
```

---

## Development Workflow

### Common Commands

```bash
# Development server with hot reload
bun run src/main.ts serve

# Build static site
bun run src/main.ts build

# Deploy to GitHub Pages
bun run src/main.ts deploy

# Run tests
bun test
```

### Making Changes

#### Adding a New File Type

1. Create file in `src/file/filetype/yourtype.ts`
2. Extend `SourceFile` (or `TextFile`, `BinaryFile`)
3. Implement required methods:
   ```typescript
   class YourTypeFile extends SourceFile {
     static filetypes = ["yourext"];
     static targets = ["targetext"];  // Optional

     // If compiling to another format:
     targetext(cfg: PageSettings): TargetFile {
       return wrapFile(this, (f) => transform(f), {
         extension: "targetext"
       }) as TargetFile;
     }
   }
   ```
4. Export as default: `export default YourTypeFile`
5. File type is auto-discovered on next run

#### Adding a Component

1. Create directory in `components/YourComponent/`
2. Create `YourComponent.ts`:
   ```typescript
   import type { PageSettings } from "../../src/types/site";

   const YourComponent = (args: PageSettings & { custom?: any }) => ({
     dependsOn: [],
     body: ["div", "Content"]
   });

   export default YourComponent;
   ```
3. Use in HTML DSL: `["YourComponent", { ...props }]`

#### Modifying Configuration

Edit `quine.config.json`:
```json
{
  "siteName": "Your Site",
  "url": "http://localhost:4242",
  "sourceDir": "./",
  "targetDir": "./docs",
  "ignorePaths": [".git", "node_modules", "custom"],
  "deploymentBranch": "production"
}
```

---

## Recent Improvements

### Architecture Refactor (Latest Commit)

**1. Broke Circular Dependencies**
- **Problem**: File → readFile → Directory → File cycle
- **Solution**: Created `src/file/utils.ts` with `getFileDirectory()` utility
- **Impact**: Safer refactoring, clearer dependencies

**2. Externalized Configuration**
- **Problem**: Hardcoded values in main.ts (site name, URLs, branches)
- **Solution**: Created `quine.config.json` and `src/config.ts`
- **Impact**: Reusable for other sites, configurable deployment

**3. Removed Global State**
- **Problem**: Global `config` variable in `src/html/dsl.ts`
- **Solution**: Pass config through all function parameters
- **Impact**: Thread-safe, testable, no hidden dependencies

**4. Enhanced Error Handling**
- **Problem**: Silent failures, unclear error messages
- **Solution**: Try-catch blocks throughout build/deploy with context
- **Impact**: Better debugging, graceful degradation

**5. Completed Deploy Cleanup**
- **Problem**: TODO comments for cleanup operations
- **Solution**: Implemented proper cleanup with error recovery
- **Impact**: Safer deployments, better state management

---

## Known Issues

### Type Safety

**Status**: Many implicit `any` types remain

**Areas**:
- `src/server/createServer.ts` - Bun server types
- `src/file/filetype/scss.ts` - URL parameter type
- `src/utils/` - Various utility functions

**Not Critical**: Code works, but could be improved for better IDE support

### Missing Node Types

**Status**: Some files import Node.js modules without type definitions

**Common Errors**:
- "Cannot find module 'fs'"
- "Cannot find name 'process'"
- "Cannot find name 'require'"

**Solution**: This is expected in Bun environment - types are available at runtime

### File Type Registry Caching

**Current Behavior**: File type map is built once on first `readFile()` call

**Limitation**: New file types added at runtime won't be discovered

**Mitigation**: Restart server/rebuild to pick up new file types

### Deployment Branch Fetching

**Current Behavior**: Attempts `git fetch origin branch:branch`

**Issue**: May fail if remote branch doesn't exist yet

**Mitigation**: Warning logged, continues with checkout (creates new branch)

---

## Common Patterns

### 1. File Reading Pattern

```typescript
import { readFile } from "./file";
import type { PageSettings } from "./types/site";

const file = readFile(Path.create("/path/to/file.ext"), config);
if (!file) {
  // Handle missing file
  return;
}

// Use file
file.write(config);
const deps = file.dependencies(config);
```

### 2. Path Manipulation Pattern

```typescript
import { Path } from "./utils/path";

const path = Path.create("./relative/path");
const absolute = path.toString();  // Always absolute
const parent = path.parent;
const newPath = path.join("subdir/file.txt");
const withNewExt = path.replaceExtension("html");

if (path.exists()) {
  // Do something
}
```

### 3. HTML DSL Pattern

```typescript
import type { PageSyntax } from "./types/html";

const page: PageSyntax = [
  "html",
  { lang: "en" },
  [
    "head",
    ["title", "Page Title"]
  ],
  [
    "body",
    ["Header", { siteName: "My Site" }],  // Component
    ["main",
      ["h1", "Hello"],
      ["p.intro", { id: "first" }, "Content"]  // Class and ID
    ]
  ]
];

const { body, dependsOn } = HtmlPage.create(page, config);
```

### 4. Component Pattern

```typescript
// In components/MyComponent/MyComponent.ts
import type { PageSettings } from "../../src/types/site";
import type { PageSyntax } from "../../src/types/html";

const MyComponent = (args: PageSettings & {
  title?: string;
  children?: any[];
}): { dependsOn: any[], body: PageSyntax } => {
  const { title, children, url, sourceDir } = args;

  return {
    dependsOn: [
      { src: "/path/to/dependency.css" }
    ],
    body: [
      "div.my-component",
      ["h2", title || "Default Title"],
      ["div.content", ...(children || [])]
    ]
  };
};

export default MyComponent;
```

### 5. File Type Implementation Pattern

```typescript
import { SourceFile } from "../classes";
import type { PageSettings } from "../../types/site";
import type { Path } from "../../utils/path";

class MyFileType extends SourceFile {
  static filetypes = ["myext"];
  static targets = ["html"];  // Optional: if compiles to another format

  static create(filePath: Path, cfg: PageSettings) {
    if (!filePath.exists()) {
      return null;
    }
    return new MyFileType(filePath, cfg);
  }

  // If compiling to HTML:
  html(cfg: PageSettings): HtmlFile {
    return wrapFile(this, (f) => {
      const content = f.text(cfg);
      return transformToHtml(content);
    }, {
      extension: "html"
    }) as HtmlFile;
  }

  // Override if needed:
  dependencies(settings: PageSettings): File[] {
    // Parse file and extract dependencies
    return [];
  }
}

export default MyFileType;
```

### 6. Error Handling Pattern

```typescript
try {
  // Attempt operation
  file.write(config);
  console.log(`[module] Successfully wrote ${file.path}`);
} catch (error) {
  console.error(`[module] Failed to write ${file.path}:`, error);
  // Decide: throw, return, or continue
  throw new Error(`Write failed: ${error}`);
}
```

---

## Testing

### Test Structure

```
test/
├── integration/           # Integration tests
│   └── fileResolution.test.ts
├── utils/                # Utility tests
│   ├── path.test.ts
│   ├── array.test.ts
│   └── object.test.ts
├── html.test.ts         # HTML DSL tests
└── readFile.test.ts     # File reading tests
```

### Running Tests

```bash
bun test                  # Run all tests
bun test path/to/file    # Run specific test
```

### Test Framework

Uses Bun's built-in test runner (similar to Jest):
```typescript
import { describe, test, expect } from "bun:test";

describe("Feature", () => {
  test("should do something", () => {
    expect(result).toBe(expected);
  });
});
```

---

## Debugging Tips

### 1. Enable Verbose Logging

Look for `console.log()` statements with prefixes:
- `[readFile]` - File resolution
- `[build]` - Build process
- `[deploy]` - Deployment process
- `[config]` - Configuration loading
- `[directory]` - Directory reading

### 2. Check Visited Files

The build system tracks visited files to prevent infinite loops. If a file isn't being built:
- Check if it's in `ignorePaths` config
- Check if it's in the initial `filePathsSeenSoFar` set
- Verify the file is actually a dependency of something

### 3. File Type Resolution

If a file isn't being processed correctly:
```typescript
// In src/file/index.ts, readFile() logs:
console.log(`[readFile] Trying ${FiletypeClass.name} file type for path ${path}`);
```

Check these logs to see which file type is being used.

### 4. Dependency Tracking

To debug why a file isn't being built as a dependency:
1. Add logging to the parent file's `dependencies()` method
2. Check if the dependency path is being resolved correctly
3. Verify the dependency file exists

### 5. HTML DSL Issues

If HTML isn't rendering correctly:
- Check for proper array nesting
- Verify component names are PascalCase
- Ensure component exports default function
- Check that config is being passed through

---

## Performance Considerations

### 1. File Type Registry Caching

The file type map is built once and cached. Subsequent calls to `readFile()` reuse the cache.

**Impact**: Fast file resolution after initial bootstrap

### 2. Directory Content Caching

`Directory` class caches `contents()` results:
```typescript
private enumeratedContents?: File[]
private enumeratedDependencies?: File[]
private enumeratedHtml?: HtmlPage
```

**Impact**: Multiple calls to same directory don't re-read filesystem

**Trade-off**: Changes to directory during build won't be picked up

### 3. Path Normalization

Paths are normalized once in constructor and stored:
```typescript
constructor(pathString: string) {
  let absolutePath = pathLibrary.resolve(process.cwd(), normalizedPath);
  this.pathString = absolutePath;
}
```

**Impact**: Fast path comparisons and operations

### 4. Visited File Tracking

Uses `Set<string>` for O(1) lookup:
```typescript
const filePathsSeenSoFar = new Set([...ignorePaths, ...]);
if (filesSeenSoFar.has(file.path.toString())) return;
```

**Impact**: Prevents infinite loops efficiently

---

## Future Improvements

### Potential Enhancements

1. **Incremental Builds**
   - Track file modification times
   - Only rebuild changed files and dependents
   - Would require dependency graph analysis

2. **Parallel Building**
   - Build independent branches concurrently
   - Use worker threads or Bun.spawn
   - Track dependencies to determine what can be parallel

3. **Plugin System**
   - Formalize file type interface
   - Allow external plugins
   - Hot-reload plugin changes

4. **Better Type Safety**
   - Add explicit types to utility functions
   - Type the component props system
   - Stricter PageSyntax validation

5. **Dependency Graph Visualization**
   - Build visual graph of file dependencies
   - Help debug circular dependencies
   - Identify unused files

6. **Configuration Validation**
   - JSON schema for quine.config.json
   - Validate paths exist
   - Check for common misconfigurations

7. **Watch Mode for Build**
   - Combine build + serve functionality
   - Auto-rebuild on source changes
   - Keep both dev and built versions in sync

---

## Key Takeaways for Agents

### What You Must Know

1. **File Resolution is Central**: Everything flows through `readFile()` and the file type registry
2. **Config is Explicit**: No global state - pass `PageSettings` everywhere
3. **Paths are Absolute**: All Path objects normalize to absolute paths internally
4. **Recursive Building**: The system traverses dependency graphs recursively
5. **Bun-Specific**: Uses Bun runtime features (Bun.serve, bun:test, etc.)

### What to Watch Out For

1. **Circular Dependencies**: Always check imports don't create cycles
2. **Global State**: Avoid module-level mutable variables
3. **Async/Sync Boundaries**: Most operations are sync; keep it that way
4. **Path String Comparisons**: Always normalize before comparing paths
5. **Component Loading**: Uses `require()` - file must be loadable at runtime

### Quick Start for New Tasks

1. Read relevant sections of this document
2. Find similar code in the codebase as reference
3. Follow established patterns (see Common Patterns section)
4. Test changes with `bun test`
5. Verify build works: `bun run src/main.ts build`
6. Check types: `tsc --noEmit` (some errors are expected)

---

## Version History

**v1.0** (2024-11-07)
- Initial AGENTS.md creation
- Documents architecture after circular dependency fix
- Documents new configuration system
- Documents error handling improvements

---

## Contact & Resources

**Repository**: `/home/user/quine`

**Configuration File**: `quine.config.json`

**Main Entry Point**: `src/main.ts`

**Documentation**:
- This file (AGENTS.md)
- Inline code comments
- Type definitions in `src/types/`

---

*This document is maintained for AI agents working on the quine codebase. Keep it updated as the architecture evolves.*
