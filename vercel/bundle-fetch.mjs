import esbuild from "esbuild";

esbuild.build({
  bundle: true,
  minify: true,
  
  format: "esm",
  platform: "node",

  entryPoints: [".vercel/output/functions/fetch/index.func/index.mjs"],
  outfile: ".vercel/output/functions/fetch/index.func/index.mjs",
  allowOverwrite: true
});m
