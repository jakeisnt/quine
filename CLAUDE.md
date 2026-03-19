# Quine — Personal Website / Static Site Generator

A self-referential static site generator that builds a browseable website from its own source code.

## Quick Reference

```bash
bun run src/main.ts build   # Build to dist/
bun run src/main.ts serve   # Dev server with hot reload at localhost:4242
```

## Architecture

This is a custom SSG written in TypeScript (Bun runtime). The site builds itself — the source code IS the content. Every file in the repo gets rendered as a browseable HTML page.

### Build Output Structure

```
dist/
  index.html                    # Home page (custom landing page)
  resources/style.css           # Compiled SCSS → CSS assets
  resources/global.css
  components/Sidebar/sidebar.css
  source/                       # Browseable source tree
    index.html                  # Root directory listing
    src/...                     # Source files as HTML pages
    resources/...               # Resource files (raw + compiled)
```

**Key distinction**: Asset files (CSS, JS) are written to `dist/` root so absolute paths like `/resources/style.css` resolve correctly. Source pages go under `dist/source/`.

### File Type System (`src/file/`)

- **Registry** (`src/file/index.ts`): Dynamically discovers file type handlers from `src/file/filetype/`
- **Compile map**: When a `.css` file is requested but only `.scss` exists, the system finds the SCSS handler via `compileMap["css"]` and calls `.css(cfg)` to compile it
- Same pattern for `.ts` → `.js`
- Uses `typeof (file)[extension] === "function"` to check for compile methods (NOT `hasOwnProperty` — methods are on the prototype)

### HTML DSL (`src/html/`)

Hiccup-style DSL: `["div", { class: "foo" }, "content"]` → `<div class="foo">content</div>`

- PascalCase tags are components (e.g., `["Header", {...}]` → loads `components/Header/Header.js`)
- Dependencies tracked via `href` and `src` attributes in rendered HTML
- Components declare `dependsOn` for their CSS/JS assets

### Components (`components/`)

Each component is a directory with a PascalCase entry file matching the directory name (e.g., `Header/Header.ts`). The loader at `src/html/components.ts` does `require(${componentDir}/${name}.js)` where name is PascalCase.

**Gotcha**: Entry files MUST be PascalCase. macOS hides casing bugs because its FS is case-insensitive, but Linux (Cloudflare Pages) fails.

### Build Process (`src/build.ts`)

1. Render home page → `dist/index.html`
2. Build home page asset dependencies (CSS, JS) → `dist/` root
3. Walk source tree recursively from root directory → `dist/source/`

### Dev Server (`src/server/`)

- Bun.serve on port 4242
- Compiles SCSS/TS on the fly per request
- Hot reload via WebSocket

## Conventions

- **Runtime**: Bun only, never Node.js
- **No bundler**: Files are compiled individually (TS→JS, SCSS→CSS), not bundled
- **Dependency tracking**: The HTML DSL auto-discovers dependencies from rendered `href`/`src` attributes
- SCSS files in `resources/` are global styles; component CSS is colocated
- `resources/lib.ts` and `resources/elements.ts` are client-side JS entry points

## Deployment

Cloudflare Pages. Build output is `dist/`.
