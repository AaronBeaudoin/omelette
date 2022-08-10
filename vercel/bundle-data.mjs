import esbuild from "esbuild";

esbuild.build({
  bundle: true,
  minify: true,
  
  format: "cjs",
  platform: "node",

  entryPoints: [".vercel/output/functions/data.func/index.js"],
  outfile: ".vercel/output/functions/data.func/index.js",
  allowOverwrite: true
});
