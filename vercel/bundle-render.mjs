import esbuild from "esbuild";
import { NodeModulesPolyfillPlugin } from "@esbuild-plugins/node-modules-polyfill";

esbuild.build({
  bundle: true,
  minify: true,
  
  format: "esm",
  target: "es2020",
  platform: "browser",
  conditions: ["worker", "browser"],

  entryPoints: [".vercel/output/functions/render/index.func/index.js"],
  outfile: ".vercel/output/functions/render/index.func/index.js",
  allowOverwrite: true,

  // `vite-plugin-ssr` uses some Node.js APIs that must be polyfilled
  // when bundling for edge functions since they are not available there.
  plugins: [NodeModulesPolyfillPlugin()],

  // Defining these are required when using `esbuild`, otherwise we get runtime errors.
  // https://github.com/vuejs/core/tree/main/packages/vue#bundler-build-feature-flags
  define: { __VUE_OPTIONS_API__: "true", __VUE_PROD_DEVTOOLS__: "false" }
});
