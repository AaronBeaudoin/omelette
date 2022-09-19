// @ts-ignore: Might not exist; built by `build-manifest.ts`.
import functions from "../../dist/omelette/functions";
import { extendRequest } from "./helpers";

function getCacheConfig(
  request: WorkerRequest,
  env: WorkerEnvironment,
  cache?: number | true
) {
  if (!cache) return;
  const search = new URLSearchParams(request.query);
  const searchString = search.sort() as unknown as false || search.toString();
  const preview = request.query.preview ? request.query.preview === env.SECRET : false;
  const refresh = request.query.refresh ? request.query.refresh === env.SECRET : false;

  return {
    key: request.path + searchString.length ? "?" + searchString : "",
    ttl: typeof cache === "number" && cache >= 60 ? cache : undefined,
    preview: preview || ("DEV" in env && "preview" in request.query),
    refresh: refresh || ("DEV" in env && "refresh" in request.query)
  };
}

async function handleFunction(
  request: WorkerRequest,
  env: WorkerEnvironment,
  context: WorkerContext,
  config: FunctionConfig
) {
  // 1. Handle refresh if applicable.
  if (request.method === "POST" && config.cache && config.cache.refresh) {
    // WIP
  }

  // 2. Get from cache if applicable.
  if (request.method === "GET" && config.cache && !config.cache.preview) {
    // WIP
  }

  // 3. Run function handler.
  const response = await config.handler(request);

  // 4. Tee response body into two streams.
  // WIP

  // 5. Cache response if applicable.
  if (request.method === "GET" && config.cache && !config.cache.preview) {
    // WIP
  }

  // 6. Return response.
  return response;
}

export async function handler(
  request: WorkerRequest,
  env: WorkerEnvironment,
  context: WorkerContext
) {
  const routes = functions as FunctionRoute[];
  for (let route of routes) {
    
    const { cache, ...methods } = route.module;
    if (!(request.method in methods)) continue;
    
    const result = request.path.match(route.expression);
    if (!result) continue;

    request.params = result.groups || {};
    return await handleFunction(request, env, context, {
      handler: methods[request.method],
      cache: getCacheConfig(request, env, cache)
    });
  }
};

export default {
  async fetch(
    request: WorkerRequest,
    env: WorkerEnvironment,
    context: WorkerContext
  ) {
    extendRequest(request, env, context, handler);
    const response = await handler(request, env, context);
    return response || new Response(null, { status: 404 });
  }
};
