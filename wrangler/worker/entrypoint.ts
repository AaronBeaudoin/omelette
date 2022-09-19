import { handler as assets } from "./handle-assets";
import { handler as pages } from "./handle-pages";
import { handler as functions } from "./handle-functions";

function getExtendedFetch(
  request: WorkerRequest,
  env: WorkerEnvironment,
  context: WorkerContext
) {
  return async (input: string | Request, options: FetchInit = {}) => {
    if (typeof input !== "string") return await fetch(input, options);
    if (!input.startsWith("/")) return await fetch(input, options);

    let requestUrl = new URL(request.origin + input);
    if (options.preview) requestUrl.searchParams.append("preview", env.SECRET || "");
    if (options.refresh) requestUrl.searchParams.append("refresh", env.SECRET || "");
    return await handler(new Request(requestUrl, options) as WorkerRequest, env, context);
  };
}

function extendRequest(
  request: WorkerRequest,
  env: WorkerEnvironment,
  context: WorkerContext
) {
  const url = new URL(request.url);
  request.origin = url.origin;
  request.path = url.pathname;
  request.query = Object.fromEntries(url.searchParams);
  request.fetch = getExtendedFetch(request, env, context);
}

async function handler(
  request: WorkerRequest,
  env: WorkerEnvironment,
  context: WorkerContext
) {
  const dispatch = async (...handlers: Function[]) => {
    for (let handler of handlers) {
      const response = await handler(request, env, context);
      if (response) return response;
    }
  };

  extendRequest(request, env, context);
  try { return await dispatch(assets, functions, pages); }
  catch (error) { return new Response("INTERNAL", { status: 500 }); }
}

export default {
  fetch: handler
};
