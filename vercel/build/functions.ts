import fileSystem from "fs";
import pathTools from "path";
import dedent from "dedent-js";
import glob from "glob";
import esbuild, { BuildOptions } from "esbuild";

const root = pathTools.normalize(__dirname + "/../..");
const output = root + "/.vercel/output/functions/_functions";

const config = dedent`
  {
    "runtime": "nodejs14.x",
    "handler": "index.mjs",
    "launcherType": "Nodejs",
    "shouldAddHelpers": true
  }
`;

const template = dedent`
  import { VercelRequest, VercelResponse } from "@vercel/node";
  import { $handler as inner } from "$path";

  export default async function handler(request: VercelRequest, response: VercelResponse) {
    // console.log("[test]");
    // console.log(request.method, request.url, request.httpVersion);
    // console.log(JSON.stringify(request.query, null, 2));
    // console.log(JSON.stringify(request.headers, null, 2));
    // console.log(JSON.stringify(request.cookies, null, 2));
    // console.log(request.body);
    // response.send("[test] " + request.url);

    try {
      let handlerResult: unknown = inner(request.query);
      response.statusCode = 200;

      if ("$type" === "json") {
        handlerResult = JSON.stringify(handlerResult);
        response.setHeader("Content-Type", "application/json");
        response.send(handlerResult);
        
      } else {
        response.setHeader("Content-Type", "text/plain");
        response.send(handlerResult);
      }

    }
    catch {
      response.statusCode = 404;
      response.send("404");
    }
  }
`;

glob.sync("functions/**/*.func.{ts,js}").map(async functionPath => {
  const module = await import(`${root}/${functionPath}`);
  const handlerName = module.builder ? "builder" : "handler";
  const responseType = module.type || "json";
  
  let script = template;
  script = script.replaceAll("$handler", handlerName);
  script = script.replaceAll("$path", `${root}/${functionPath.slice(0, -3)}`);
  script = script.replaceAll("$type", responseType);

  const outputPath = `${output}/${functionPath.split("/").slice(1).join("/").slice(0, -3)}`;
  fileSystem.mkdirSync(outputPath, { recursive: true });
  fileSystem.writeFileSync(`${outputPath}/.vc-config.json`, config);
  fileSystem.writeFileSync(`${outputPath}/index.ts`, script);

  const buildConfig: BuildOptions = {
    platform: "node",
    format: "esm",
    bundle: true,
    minify: true,
  
    entryPoints: [`${outputPath}/index.ts`],
    outfile:`${outputPath}/index.mjs`
  };

  await esbuild.build(buildConfig);
  fileSystem.unlinkSync(`${outputPath}/index.ts`);
});

/*
1. Generate functions.
2. For prebuilt queries, generate output and create prerender function symlinks in a special directory, maybe `output/functions/_prebuilt`?
3. Create a manifest of these prebuilt outputs and prepend an `import manifest from "manifest.json";` (or something like that) line to `.vercel/output/functions/_dispatch/index.func/index.mjs`.
4. Write logic inside of the dispatch function that checks this manifest for prebuilt output and "redirects" queries to it where applicable.
*/
