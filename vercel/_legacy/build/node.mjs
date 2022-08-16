// This file is preserved in case an example is needed for future use.
// It is not currently actually used.

import esbuild from "esbuild";

esbuild.build({
  platform: "node",
  format: "esm",
  bundle: true,
  minify: true,

  entryPoints: [".vercel/output/functions/_data/index.func/index.mjs"],
  outfile: ".vercel/output/functions/_data/index.func/index.mjs",
  allowOverwrite: true
});
