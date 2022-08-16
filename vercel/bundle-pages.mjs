import esbuild from "esbuild";
import { NodeModulesPolyfillPlugin } from "@esbuild-plugins/node-modules-polyfill";

esbuild.build({
  platform: "browser",
  target: "es2020",
  format: "esm",
  bundle: true,
  minify: true,

  entryPoints: [".vercel/output/functions/_pages/index.func/index.mjs"],
  outfile: ".vercel/output/functions/_pages/index.func/index.mjs",
  allowOverwrite: true,

  // `vite-plugin-ssr` uses some Node.js APIs that must be polyfilled
  // when bundling for edge functions since they are not available there.
  plugins: [NodeModulesPolyfillPlugin()],

  // Defining these are required when using `esbuild`, otherwise we get runtime errors.
  // https://github.com/vuejs/core/tree/main/packages/vue#bundler-build-feature-flags
  define: { __VUE_OPTIONS_API__: "true", __VUE_PROD_DEVTOOLS__: "false" }
});
