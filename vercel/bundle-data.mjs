import esbuild from "esbuild";

esbuild.build({
  platform: "browser",
  target: "es2020",
  format: "esm",
  bundle: true,
  minify: true,

  entryPoints: [".vercel/output/functions/_data/index.func/index.mjs"],
  outfile: ".vercel/output/functions/_data/index.func/index.mjs",
  allowOverwrite: true
});
