# jake.isnt.online

This is the index of my personal website found [here](https://jake.isnt.online).
It can be thought of as a projection of my wiki and github repos!
100% score on the [Lighthouse audit](https://www.foo.software/lighthouse).

## Deprecation
This idea is worth exploring further, but the code - as it stands - isn't useful.
jake.isnt.online was supposed to be adaptive, but statically first; and once the
whole website can be generated statically, as an artifact, then make it more dynamic,
introduce components, make it *move*.

I've since realized (through [https://img.jake.kitchen](img.jake.kitchen) and other product building experiences) that it's far more difficult to make a snapshot move; freezing a living system at a point is much, much easier than constructing a fixed artifact and slowly making it move.

The idea behind this framework -- and the way its build system works, with continuous on-the-fly interpretation and immediate conversion, is still worth exploring -- but the iteration in this repository is not currently up to par.

## Goals
- Personal landing page with links
- No external resources loaded
- SEO Optimized
- Ten packets (to load instantly)

## Why JS?
Javascript is the language of the internet.
Code should run on the client, on the server, at build time, and anywhere in between.
This infrastructure facilitates that.

## Running

Dependencies are managed with Bun. Install [Bun](https://bun.sh) to get started.

```bash
# Install dependencies
bun install

# Build the site (outputs to docs/)
bun run main build

# Serve the site locally
bun run main serve

# Deploy (commits and pushes docs/ on current branch)
bun run main deploy
```

### Build System

The site builds to the `docs/` folder on the current branch. The build process:

1. Reads files from the source directory (current directory)
2. Processes TypeScript/JavaScript files, compiling TS → JS
3. Handles various file types (HTML, CSS, Markdown, images, etc.)
4. Outputs everything to `docs/` directory
5. Ignores: `.git`, `node_modules`, `docs` (to prevent recursion)

### File Type System

The build system uses a dynamic file type registry (src/file/index.ts):
- Each file type registers extensions it handles via `static filetypes = [...]`
- Files can compile to other types via `static targets = [...]`
- TypeScript files (`.ts`, `.tsx`) compile to JavaScript (`.js`)
- The system auto-detects file types and applies appropriate transformations

### Deployment

The `deploy` command (src/deploy.ts):
- Commits all changes in the `docs/` directory
- Pushes to the current branch
- No branch switching - builds stay on the working branch
- Designed for GitHub Pages serving from `docs/` folder

## Other principles
[originally here](https://github.com/jakeisnt/site/issues/71)

- markup-first. any javascript should operate on static markup to augment it. the website should look just fine if viewed as a plain html page without external dependencies.
- transparent. as much of the external build process of data flow should be visualized. any data available about files should be made visible to the end user.
- communicative. all data presented should be beautiful and functional.
- creative and streamlined. the site should express lots of carefully chosen and honed details that make it feel perfect.

visualize information; don't store it. the site should never be the source of truth for data. data should come from markup, from clojure, from postgres, from other data sources, and visualized via this site.

To test file generation: `serve ./docs --config ../.serve.json`
