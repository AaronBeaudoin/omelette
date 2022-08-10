import esbuild from "esbuild";
import { NodeModulesPolyfillPlugin } from "@esbuild-plugins/node-modules-polyfill";

esbuild.build({
  plugins: [NodeModulesPolyfillPlugin()],
  platform: "browser",
  conditions: ["worker", "browser"],
  entryPoints: [".vercel/output/functions/default.func/index.js"],
  outfile: ".vercel/output/functions/default.func/index.js",
  allowOverwrite: true,
  sourcemap: true,
  logLevel: "warning",
  format: "esm",
  target: "es2020",
  bundle: true,
  minify: false,
  define: {
    __VUE_OPTIONS_API__: "true",
    __VUE_PROD_DEVTOOLS__: "false"
  }
});
