// TypeScript 7 ships only the native `tsc` binary. tsup's declaration build and
// openapi-typescript still call the compiler API, so resolve `typescript` to
// the TypeScript 6 API package for those tools.
const Module = require("node:module");
const { registerHooks } = Module;

function usesTypescriptApi(filename) {
  if (!filename) return false;
  const normalized = filename.replaceAll("\\", "/");
  return (
    normalized.includes("/tsup/") || normalized.includes("/openapi-typescript/")
  );
}

registerHooks({
  resolve(specifier, context, nextResolve) {
    if (specifier === "typescript" && usesTypescriptApi(context.parentURL)) {
      return nextResolve("@typescript/typescript6", context);
    }
    return nextResolve(specifier, context);
  },
});

const originalResolveFilename = Module._resolveFilename;

Module._resolveFilename = function resolveTypescriptApi(
  request,
  parent,
  isMain,
  options,
) {
  if (request === "typescript" && usesTypescriptApi(parent?.filename)) {
    return originalResolveFilename.call(
      this,
      "@typescript/typescript6",
      parent,
      isMain,
      options,
    );
  }

  return originalResolveFilename.call(this, request, parent, isMain, options);
};
