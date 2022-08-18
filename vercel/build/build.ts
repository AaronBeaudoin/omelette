import fileSystem from "fs";
import pathTools from "path";
import dedent from "dedent-js";
import glob from "glob";
import esbuild, { BuildOptions } from "esbuild";
import { NodeModulesPolyfillPlugin } from "@esbuild-plugins/node-modules-polyfill";

const root = pathTools.normalize(__dirname + "/../..");
const output = root + "/.vercel/output/functions";

const functionConfig = JSON.stringify({
  runtime: "nodejs14.x",
  handler: "index.mjs",
  launcherType: "Nodejs",
  shouldAddHelpers: true
});

const functionTemplate = dedent`
  import { VercelRequest, VercelResponse } from "@vercel/node";
  import { $handler as inner } from "$path";

  export default async function handler(request: VercelRequest, response: VercelResponse) {
    try {
      let handlerResult: unknown = await inner(request.query);
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
  
  let functionScript = functionTemplate;
  functionScript = functionScript.replaceAll("$handler", handlerName);
  functionScript = functionScript.replaceAll("$path", `${root}/${functionPath.slice(0, -3)}`);
  functionScript = functionScript.replaceAll("$type", responseType);

  const outputPath = `${output}/_functions/${functionPath.split("/").slice(1).join("/").slice(0, -3)}`;
  fileSystem.mkdirSync(outputPath, { recursive: true });
  fileSystem.writeFileSync(`${outputPath}/.vc-config.json`, functionConfig);
  fileSystem.writeFileSync(`${outputPath}/index.ts`, functionScript);
  
  if (module.builder) {
    fileSystem.writeFileSync(`${outputPath.slice(0, -5)}.prerender-config.json`, JSON.stringify({
      expiration: Number.isInteger(module.expiration) ? module.expiration : false,
      bypassToken: process.env.FUNCTIONS_BYPASS_TOKEN
    }));
  }

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

esbuild.build({
  platform: "browser",
  target: "es2020",
  format: "esm",
  bundle: true,
  minify: true,

  entryPoints: [`${output}/_dispatch/index.func/index.mjs`],
  outfile: `${output}/_dispatch/index.func/index.mjs`,
  allowOverwrite: true
});

esbuild.build({
  platform: "browser",
  conditions: ["worker"],
  target: "es2020",
  format: "esm",
  bundle: true,
  minify: true,

  entryPoints: [`${output}/_pages/index.func/index.mjs`],
  outfile: `${output}/_pages/index.func/index.mjs`,
  allowOverwrite: true,

  // `vite-plugin-ssr` uses some Node.js APIs that must be polyfilled
  // when bundling for edge functions since they are not available there.
  plugins: [NodeModulesPolyfillPlugin()],

  // Defining these are required when using `esbuild`, otherwise we get runtime errors.
  // https://github.com/vuejs/core/tree/main/packages/vue#bundler-build-feature-flags
  define: { __VUE_OPTIONS_API__: "true", __VUE_PROD_DEVTOOLS__: "false" }
});

/*
1. Generate functions.
2. For prebuilt queries, generate output and create prerender function symlinks in a special directory, maybe `output/functions/_prebuilt`?
3. Create a manifest of these prebuilt outputs and prepend an `import manifest from "manifest.json";` (or something like that) line to `.vercel/output/functions/_dispatch/index.func/index.mjs`.
4. Write logic inside of the dispatch function that checks this manifest for prebuilt output and "redirects" queries to it where applicable.
*/
