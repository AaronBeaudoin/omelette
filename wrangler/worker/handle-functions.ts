import { getParsedResource } from "./helpers";

// @ts-ignore: Might not exist; built by `build-manifest.ts`.
import manifest from "../../dist/omelette/manifest";

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

function getFunctionHandler(
  resource: ReturnType<typeof getParsedResource>,
  methods: { [method: string]: Function }
) {
  const func = methods[resource.request.method.toLowerCase()];
  return async (query: Query, fetch: Fetch) => {
    let result = null;

    try { result = await func(query, fetch); }
    catch (error) {
      console.log(error);
      return "FUNCTION_ERROR";
    }

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
  if (typeof result.body === "string") return (_ => [_, _])(result.body);

  let streams = result.body.tee();
  if (!("DEV" in env)) return streams;

  // https://github.com/cloudflare/miniflare/issues/375
  return [await new Response(streams[0]).arrayBuffer(), streams[1]];
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
  return env.FUNCTIONS.put(key, data, {
    expirationTtl: typeof cache === "number" && cache >= 60 ? cache : undefined,
    metadata: { contentType: contentType }
  });
}

async function getStoreValue(env: Environment, key: string) {
  const result = await env.FUNCTIONS.getWithMetadata<any>(key, { type: "stream" });
  if (!result.value || !result.metadata?.contentType) return;

  return {
    contentType: result.metadata.contentType,
    body: result.value
  } as Result;
}

export async function handleFunctionRoute(
  resource: ReturnType<typeof getParsedResource>,
  env: Environment,
  context: ExecutionContext
) {

  // 1. Ensure path is a function route.
  if (!resource.path.startsWith("/fn")) return null;

  // 2. Ensure a function exists at path.
  if (!(resource.path in manifest)) return new Response(null, { status: 404 });

  // 3. Get function config, query, and handler.
  const { cache, methods } = getFunctionConfig(resource.path);
  const { preview, refresh, rest: query } = getFunctionQuery(resource.query, env);
  const handler = getFunctionHandler(resource, methods);

  // 4. Handle refresh if applicable.
  if (cache && refresh) {

    const refresh = async (key: string) => {
      const result = await handler(query, resource.fetch);
      if (typeof result === "string") return;
      await setStoreValue(env, key, result.body, result.contentType, cache);
    };
  
    context.waitUntil(refresh(getStoreKey(resource.path, query)));
    return new Response("FUNCTION_REFRESH", { status: 200 });
  }

  // 5. Try cache if applicable.
  if (cache && !preview) {

    const key = getStoreKey(resource.path, query);
    const result = await getStoreValue(env, key);

    if (result) return new Response(result.body, {
      status: 200,
      headers: {
        "Content-Type": result.contentType,
        "X-Data-Cache": "HIT"
      }
    });
  }

  // 6. Run function handler.
  const result = await handler(query, resource.fetch);
  if (typeof result === "string") return new Response(result, { status: 500 });

  // 7. Split data into two independent streams.
  const resultStreams = await getResultStreams(result, env);

  // 8. Cache result if applicable.
  if (cache && !preview) {
    const key = getStoreKey(resource.path, query);
    context.waitUntil(setStoreValue(env, key, resultStreams[0], result.contentType, cache));
  }

  // 9. Return result.
  return new Response(resultStreams[1], {
    status: 200,
    headers: {
      "Content-Type": result.contentType || "text/plain",
      "X-Data-Cache": !cache ? "NONE" : (!preview ? "MISS": "PREVIEW")
    }
  });
}

async function handleRequest(request: Request, env: Environment, context: ExecutionContext) {
  const resource = getParsedResource(request, env, context, handleRequest);
  let response = await handleFunctionRoute(resource, env, context);
  return response || new Response("FUNCTION_ROUTE", { status: 500 });
}

export default {
  fetch: handleRequest
};
