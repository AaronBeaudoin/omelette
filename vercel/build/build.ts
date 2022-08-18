import fileSystem from "fs";
import pathTools from "path";
import dedent from "dedent-js";
import glob from "glob";
import hash from "object-hash";
import esbuild from "esbuild";


const root = pathTools.normalize(__dirname + "/../..");
const output = root + "/.vercel/output/functions";
let prebuildManifest: any = {};


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


async function buildFunctions(config: Config) {
  await Promise.all(glob.sync("functions/**/*.func.{ts,js}").map(async functionPath => {
    functionPath = functionPath.split("/").slice(1).join("/").slice(0, -8);
  
    const module = await import(`${root}/functions/${functionPath}.func.ts`);
    const handlerName = module.builder ? "builder" : "handler";
    const responseType = module.type || "json";
    
    let functionScript = functionTemplate;
    functionScript = functionScript.replaceAll("$handler", handlerName);
    functionScript = functionScript.replaceAll("$path", `${root}/functions/${functionPath}.func`);
    functionScript = functionScript.replaceAll("$type", responseType);
  
    const outputPath = `${output}/_functions/${functionPath}.func`;
    fileSystem.mkdirSync(outputPath, { recursive: true });
    fileSystem.writeFileSync(`${outputPath}/.vc-config.json`, functionConfig);
    fileSystem.writeFileSync(`${outputPath}/index.ts`, functionScript);
    
    if (module.builder) {
      fileSystem.writeFileSync(`${outputPath.slice(0, -5)}.prerender-config.json`, JSON.stringify({
        expiration: Number.isInteger(module.expiration) ? module.expiration : false,
        bypassToken: config.secret
      }));
    }
  
    if (module.prebuild) {
      await Promise.all((await module.prebuild()).map(async (query: FunctionQuery) => {
        const prebuildHash = hash([functionPath, query], { respectType: false });
        const prebuildExpiration = Number.isInteger(module.expiration) ? module.expiration : -1;
        const prebuildManifestKey = `${functionPath}:${prebuildExpiration}:${prebuildHash}`;
        const prebuildOutput = await module.builder(query);
        prebuildManifest[prebuildManifestKey] = prebuildOutput;
      }));
    }
  
    await esbuild.build({
      platform: "node",
      format: "esm",
      bundle: true,
      minify: !config.debug,
      
      entryPoints: [`${outputPath}/index.ts`],
      outfile:`${outputPath}/index.mjs`
    });
  
    if (!config.debug) {
      fileSystem.unlinkSync(`${outputPath}/index.ts`);
    }
  }));
}


async function buildSymlinks(config: Config) {
  fileSystem.mkdirSync(`${output}/_prebuild`);

  Object.keys(prebuildManifest).map(prebuildManifestKey => {
    const [functionPath, prebuildExpiration, prebuildHash] = prebuildManifestKey.split(":");
    const prebuildData = prebuildManifest[prebuildManifestKey];

    const targetPath = `${output}/_functions/${functionPath}.func`;
    const outputPath = `${output}/_prebuild/${prebuildHash}.func`;

    fileSystem.symlinkSync(pathTools.relative(`${output}/_prebuild`, targetPath), outputPath);
    fileSystem.writeFileSync(`${outputPath.slice(0, -5)}.prerender-fallback.json`, JSON.stringify(prebuildData));
    fileSystem.writeFileSync(`${outputPath.slice(0, -5)}.prerender-config.json`, JSON.stringify({
      expiration: Number(prebuildExpiration) > -1 ? Number(prebuildExpiration) : false,
      fallback: `${prebuildHash}.prerender-fallback.json`,
      bypassToken: config.secret
    }));
  });

  // 1. Create prebuild symlinks.
  // 2. Inject prebuild manifest into dispatch.
  // 3. Actually write the dispatch function.
}


async function buildDispatch(config: Config) {
  await esbuild.build({
    platform: "browser",
    target: "es2020",
    format: "esm",
    bundle: true,
    minify: !config.debug,
    
    entryPoints: [`${output}/_dispatch/index.func/index.mjs`],
    outfile: `${output}/_dispatch/index.func/index.mjs`,
    allowOverwrite: true
  });
}


async function buildPages(config: Config) {
  await esbuild.build({
    platform: "browser",
    conditions: ["worker"],
    target: "es2020",
    format: "esm",
    bundle: true,
    minify: !config.debug,
    
    entryPoints: [`${output}/_pages/index.func/index.mjs`],
    outfile: `${output}/_pages/index.func/index.mjs`,
    allowOverwrite: true,
  
    // `vite-plugin-ssr` uses some Node.js APIs that must be polyfilled
    // when bundling for edge functions since they are not available there.
    plugins: [(await import("@esbuild-plugins/node-modules-polyfill")).NodeModulesPolyfillPlugin()],
  
    // Defining these are required when using `esbuild`, otherwise we get runtime errors.
    // https://github.com/vuejs/core/tree/main/packages/vue#bundler-build-feature-flags
    define: { __VUE_OPTIONS_API__: "true", __VUE_PROD_DEVTOOLS__: "false" }
  });
}


type Config = {
  secret: string | undefined,
  debug: boolean
};

(async (config: Config) => {
  await buildFunctions(config);
  await buildSymlinks(config);
  await buildDispatch(config);
  await buildPages(config);

})({
  secret: process.env.FUNCTIONS_SECRET,
  debug: !!process.env.FUNCTIONS_DEBUG
});
