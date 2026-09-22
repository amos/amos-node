import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["src/index.ts"],
  format: ["esm", "cjs"],
  // tsup's declaration rollup still uses the TypeScript 6 API (loaded via
  // scripts/typescript6-api.cjs). It also injects `baseUrl`, which TypeScript
  // 6 rejects unless this deprecation is ignored.
  dts: {
    compilerOptions: {
      ignoreDeprecations: "6.0",
    },
  },
  clean: true,
  sourcemap: true,
  target: "es2022",
  outDir: "dist",
  // Keep openapi-fetch external so we don't bundle our only runtime dep into
  // dist/. Type-only re-exports from ../openapi/schema are inlined into the
  // generated .d.ts by tsup's dts rollup.
  external: ["openapi-fetch"],
});
