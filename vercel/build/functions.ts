import fileSystem from "fs";
import pathTools from "path";
import glob from "glob";
import dedent from "dedent-js";

const root = pathTools.normalize(__dirname + "/../..");
const output = root + "/.vercel/output/functions/_functions";

const configText = dedent`
  {
    "runtime": "nodejs14.x",
    "handler": "index.mjs",
    "launcherType": "Nodejs",
    "shouldAddHelpers": true
  }
`;

const scriptText = dedent`
  export default async function handler(request, response) {
    response.send(\`[test] \${request.toString()}\`);
  }
`;

glob.sync("functions/**/*.func.{ts,js}").map(async functionPath => {
  const module = await import(`${root}/${functionPath}`);
  const outputPath = `${output}/${functionPath.split("/").slice(1).join("/").slice(0, -3)}`;

  fileSystem.mkdirSync(outputPath, { recursive: true });
  fileSystem.writeFileSync(`${outputPath}/.vc-config.json`, configText);
  fileSystem.writeFileSync(`${outputPath}/index.mjs`, scriptText);
});

/*
1. Generate functions.
2. For prebuilt queries, generate output and create prerender function symlinks in a special directory, maybe `output/functions/_prebuilt`?
3. Create a manifest of these prebuilt outputs and prepend an `import manifest from "manifest.json";` (or something like that) line to `.vercel/output/functions/_dispatch/index.func/index.mjs`.
4. Write logic inside of the dispatch function that checks this manifest for prebuilt output and "redirects" queries to it where applicable.
*/
