import { getParsedUrl } from "./helpers";
import { Environment } from "./types";

// @ts-ignore
import manifest from "./_manifest";

type Query = { [key: string]: string };
type Result = { contentType: string, body: string | ReadableStream };

function getFunctionConfig(path: string) {
  const strongPath = path as keyof typeof manifest;
  const { cache, ...methods } = manifest[strongPath] as any;

  return {
    cache: cache as (boolean | number),
    methods: methods as { [method: string]: Function }
  };
}

function getFunctionQuery(query: Query, env: Environment) {
  const preview = query.preview ? query.preview === env.SECRET : false;
  const refresh = query.refresh ? query.refresh === env.SECRET : false;

  let rest = { ...query };
  delete rest.preview;
  delete rest.refresh;

  return {
    preview: preview || ("DEV" in env && "preview" in query),
    refresh: refresh || ("DEV" in env && "refresh" in query),
    rest: rest as Query
  };
}

function getFunctionHandler(func: Function) {
  return async (query: Query) => {
    let result = null;

    try { result = await func(query); }
    catch { return "FUNCTION_ERROR"; }

    if (!result) return "FUNCTION_RESULT";
    if (!result.body) return "FUNCTION_DATA";
    if (!result.contentType) return "FUNCTION_TYPE";

    return {
      contentType: result.contentType,
      body: result.body
    } as Result;
  };
}

async function getResultStreams(result: Result, env: Environment) {
  if (typeof result.body === "string") return [result.body, result.body] as string[];
  if (!("DEV" in env)) return result.body.tee() as ReadableStream[];

  // Fixes a bug with `wrangler dev --local` which occurs when `KV.put` is passed a stream.
  return await (async _ => [await new Response(_[0]).arrayBuffer(), _[1]])(result.body.tee());
}

function getStoreKey(path: string, query: Query) {
  const queryString = new URLSearchParams(query).toString();
  return path + (queryString.length ? "?" + queryString : ""); 
}

function setStoreValue(
  env: Environment,
  key: string,
  data: string | ReadableStream | ArrayBuffer,
  contentType: string,
  cache: boolean | number
) {
  return env.DATA.put(key, data, {
    expirationTtl: typeof cache === "number" && cache >= 60 ? cache : undefined,
    metadata: { contentType: contentType }
  });
}

async function getStoreValue(env: Environment, key: string) {
  const result = await env.DATA.getWithMetadata<any>(key, { type: "stream" });
  if (!result.value || !result.metadata?.contentType) return;

  return {
    contentType: result.metadata.contentType,
    body: result.value
  } as Result;
}

export async function handleFunctionRoute(
  request: Request,
  env: Environment,
  context: ExecutionContext
) {

  // 1. Parse URL.
  const url = getParsedUrl(request);

  // 2. Ensure path is a function route.
  if (!url.path.startsWith("/fn")) return null;
  console.log("test", url.path);

  // 3. Ensure a function exists at path.
  if (!(url.path in manifest)) return new Response(null, { status: 404 });

  // 4. Get function config, query, and handler.
  const { cache, methods } = getFunctionConfig(url.path);
  const { preview, refresh, rest: query } = getFunctionQuery(url.query, env);
  const handler = getFunctionHandler(methods[request.method.toLowerCase()]);

  // 5. Handle refresh if applicable.
  if (cache && refresh) {

    const refresh = async (key: string) => {
      const result = await handler(query);
      if (typeof result === "string") return;
      await setStoreValue(env, key, result.body, result.contentType, cache);
    };
  
    context.waitUntil(refresh(getStoreKey(url.path, query)));
    return new Response("FUNCTION_REFRESH", { status: 200 });
  }

  // 6. Try cache if applicable.
  if (cache && !preview) {

    const key = getStoreKey(url.path, query);
    const result = await getStoreValue(env, key);

    if (result) return new Response(result.body, {
      status: 200,
      headers: {
        "Content-Type": result.contentType,
        "X-Data-Cache": "HIT"
      }
    });
  }

  // 7. Run function handler.
  const result = await handler(query);
  if (typeof result === "string") return new Response(result, { status: 500 });

  // 8. Split data into two independent streams.
  const resultStreams = await getResultStreams(result, env);

  // 9. Cache result if applicable.
  if (cache && !preview) {
    const key = getStoreKey(url.path, query);
    context.waitUntil(setStoreValue(env, key, resultStreams[0], result.contentType, cache));
  }

  // 10. Return result.
  return new Response(resultStreams[1], {
    status: 200,
    headers: {
      "Content-Type": result.contentType || "text/plain",
      "X-Data-Cache": !cache ? "NONE" : (!preview ? "MISS": "PREVIEW")
    }
  });
}

export default {
  async fetch(request: Request, env: Environment, context: ExecutionContext) {
    let response = await handleFunctionRoute(request, env, context);
    if (!response) response = new Response("FUNCTION_ROUTE", { status: 500 });
    return response;
  }
};
