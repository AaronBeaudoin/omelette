import fileSystem from "fs";
import glob from "glob";

glob.sync("functions/**/*.func.{ts,js}").map(functionPath => {
  const functionDirectoryPath = functionPath.split("/").slice(1).join("/").slice(0, -3);
  const outputPath = ".vercel/output/functions/_functions/" + functionDirectoryPath;
  fileSystem.mkdirSync(outputPath, { recursive: true });
  console.log(functionPath, outputPath);
});

/*
1. Generate functions.
2. For prebuilt queries, generate output and create prerender function symlinks in a special directory, maybe `output/functions/_prebuilt`?
3. Create a manifest of these prebuilt outputs and prepend an `import manifest from "manifest.json";` (or something like that) line to `.vercel/output/functions/_dispatch/index.func/index.mjs`.
4. Write logic inside of the dispatch function that checks this manifest for prebuilt output and "redirects" queries to it where applicable.
*/
