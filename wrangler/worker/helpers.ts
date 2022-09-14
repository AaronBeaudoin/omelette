export function getFetch(
  origin: string,
  env: Environment,
  context: ExecutionContext,
  handler: Function
) {
  return async (input: string | Request, options: FetchInit = {}) => {
    if (typeof input !== "string") return await fetch(input, options);
    if (!input.startsWith("/")) return await fetch(input, options);

    let requestUrl = new URL(origin + input);
    if (options.preview) requestUrl.searchParams.append("preview", env.SECRET || "");
    if (options.refresh) requestUrl.searchParams.append("refresh", env.SECRET || "");
    return await handler(new Request(requestUrl, options), env, context);
  };
}

export function getParsedResource(
  request: Request,
  env: Environment,
  context: ExecutionContext,
  handler: Function
) {
  const url = new URL(request.url);
  
  // Ensuring the query is sorted allows us to reliably use it later as
  // part of a key for looking up cached function results in Workers KV.
  url.searchParams.sort();

  // Remove trailing slash to ensure path is always the same for a route.
  const path = url.pathname.replace(/([^\/])\/$/, "$1");

  // Get query parameters as a plain object for convenience.
  const query = Object.fromEntries(url.searchParams) as { [key: string]: string };

  // Get a custom `fetch` that allows internal fetching.
  const fetch = getFetch(url.origin, env, context, handler);

  return {
    request: request,
    url: url,
    path: path,
    query: query,
    fetch: fetch
  };
}
