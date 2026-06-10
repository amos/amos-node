# @amos.com/node

## 0.1.9

### Patch Changes

- Handle updated openapi spec

## 0.1.8

### Patch Changes

- Handle updated openapi spec

## 0.1.7

### Patch Changes

- Handle updated openapi spec

## 0.1.6

### Patch Changes

- Use amos.com

## 0.1.5

### Patch Changes

- Handle updated openapi spec

## 0.1.4

### Patch Changes

- Handle updated openapi spec

## 0.1.3

### Patch Changes

- Handle updated openapi spec

## 0.1.2

### Patch Changes

- b93ef77: Handle updated openapi spec

## 0.1.1

### Patch Changes

- 30d52b8: Fix the published tarball so it actually contains a working build.

  `0.1.0` was published from a `package.json` whose `main`/`module`/`types`/`exports` all pointed at `dist/*`, but no `dist/` was ever produced or shipped, so `import "@amos.com/node"` failed at runtime in any consumer. Two underlying issues:

  - The build script was `tsc` against a tsconfig with no `outDir` and a `declarationDir` that didn't match the declared entry points, so even a successful `tsc` run wouldn't have produced `dist/index.js`, `dist/index.mjs`, or `dist/index.d.ts`. `tsc` also never emits `.mjs`, which the package's dual CJS/ESM exports require.
  - There was no `prepack` (or `prepublishOnly`) hook, so a manual `npm publish` skipped the build entirely.

  Switched the build to `tsup`, which produces `dist/index.js` (CJS), `dist/index.mjs` (ESM), and `dist/index.d.ts` (types) — exactly what `package.json` advertises. Added a `prepack` hook so any `npm publish` (manual or via `changeset publish`) guarantees a fresh `dist/`. Decoupled `generate` (schema regeneration, which needs a sibling OpenAPI checkout) from `build` so the latter is portable.
