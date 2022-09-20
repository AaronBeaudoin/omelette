function getExtendedFetch(
  request: WorkerRequest,
  env: WorkerEnvironment,
  context: WorkerContext,
  handler: Function
) {
  return async (input: string | URL | Request, options?: RequestInit) => {
    if (!options) options = {};

    if (typeof input !== "string") return await fetch(input, options);
    if (!input.startsWith("/")) return await fetch(input, options);

    let requestUrl = new URL(request.origin + input);
    if (options.preview) requestUrl.searchParams.append("preview", env.SECRET || "");
    if (options.refresh) requestUrl.searchParams.append("refresh", env.SECRET || "");
    return await handler(new Request(requestUrl, options), env, context) as Response;
  };
}

export function extendRequest(
  request: WorkerRequest,
  env: WorkerEnvironment,
  context: WorkerContext,
  handler: Function
) {
  const url = new URL(request.url);
  request.origin = url.origin;
  request.path = url.pathname;
  request.query = Object.fromEntries(url.searchParams);
  request.fetch = getExtendedFetch(request, env, context, handler);
}
