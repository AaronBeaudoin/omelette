// @ts-ignore: Might not exist; built by `build-manifest.ts`.
import functions from "../../dist/omelette/functions";

interface FunctionConfig {
  handler: (request: WorkerRequest) => Promise<Response | undefined>;
  cache: ReturnType<typeof getCacheConfig>;
}

function getCacheConfig(
  request: WorkerRequest,
  env: WorkerEnvironment,
  cache?: number | true
) {
  if (!cache) return;
  const search = new URLSearchParams(request.query);
  const searchString = search.sort() as unknown as false || search.toString();
  const searchSeparator = searchString.length ? "?" + searchString : "";
  const preview = request.query.preview ? request.query.preview === env.SECRET : false;
  const refresh = request.query.refresh ? request.query.refresh === env.SECRET : false;

  return {
    key: request.path + searchSeparator + searchString,
    ttl: typeof cache === "number" && cache >= 60 ? cache : undefined,
    preview: preview || ("DEV" in env && "preview" in request.query),
    refresh: refresh || ("DEV" in env && "refresh" in request.query)
  };
}

async function getCachedResponse(
  env: WorkerEnvironment,
  config: FunctionConfig
) {
  if (!config.cache) throw "CACHE_NONE";
  const result = await env.FUNCTIONS.getWithMetadata<any>(config.cache.key, { type: "stream" });
  if (!result.value || !result.metadata?.status || !result.metadata?.headers) return;

  return new Response(result.value, {
    headers: result.metadata.headers,
    status: result.metadata.status
  });
}


async function cacheResponse(
  env: WorkerEnvironment,
  config: FunctionConfig,
  response: Response,
  body?: string | ReadableStream | ArrayBuffer
) {
  if (!config.cache) throw "CACHE_NONE";
  const cacheHeaders = { "Content-Type": response.headers.get("Content-Type") };

  return await env.FUNCTIONS.put(config.cache.key, body || await response.arrayBuffer(), {
    metadata: { headers: cacheHeaders, status: response.status },
    expirationTtl: config.cache.ttl
  });
}

async function handleFunction(
  request: WorkerRequest,
  env: WorkerEnvironment,
  context: WorkerContext,
  config: FunctionConfig
) {

  // 1. Refresh cache if applicable.
  if (request.method === "POST" && config.cache && config.cache.refresh) {
    const refreshCache = async (env: WorkerEnvironment, config: FunctionConfig) => {
      const response = await config.handler(request);
      if (response) await cacheResponse(env, config, response);
    };
  
    context.waitUntil(refreshCache(env, config));
    return new Response(null, { status: 200 });
  }

  // 2. Get cached response if applicable.
  if (request.method === "GET" && config.cache && !config.cache.preview) {
    const response = await getCachedResponse(env, config);

    if (response) {
      const headers = new Headers(response.headers);
      headers.set("X-Function-Cache", "HIT");
      headers.set("Cache-Control", "no-cache");

      return new Response(response.body, {
        headers: headers,
        status: response.status
      });
    }
  }

  // 3. Run function handler.
  const response = await config.handler(request);
  if (!response) return;
  let body = response.body;

  // 5. Cache response if applicable.
  if (request.method === "GET" && config.cache && !config.cache.preview) {
    const streams = response.body ? response.body.tee() : [null, null];
    body = streams[1];

    // https://github.com/cloudflare/miniflare/issues/375
    const cached = "DEV" in env ? await new Response(streams[0]).arrayBuffer() : streams[0];
    const promise = cacheResponse(env, config, response, cached || "");
    context.waitUntil(promise);
  }
  
  // 6. Add custom headers.
  const headers = new Headers(response.headers);
  const cache = !config.cache ? "NONE" : (!config.cache.preview ? "MISS": "PREVIEW");
  headers.set("X-Function-Cache", cache);
  headers.set("Cache-Control", "no-cache");

  // 7. Return response.
  return new Response(body, {
    headers: headers,
    status: response.status
  });
}

export async function handler(
  request: WorkerRequest,
  env: WorkerEnvironment,
  context: WorkerContext
) {
  const routes = functions as { expression: RegExp, module: any }[];
  for (let route of routes) {

    const { cache, ...methods } = route.module;
    if (!(request.method in methods)) continue;

    const result = request.path.match(route.expression);
    if (!result) continue;

    request.params = result.groups || {};
    return await handleFunction(request, env, context, {
      handler: methods[request.method] as FunctionConfig["handler"],
      cache: getCacheConfig(request, env, cache)
    });
  }
};
