export function getParsedUrl(request: Request) {
  const originalUrl = request.url;
  const standardUrl = new URL(request.url);

  // Ensuring the query is sorted allows us to reliably use it later as
  // part of a key for looking up cached function results in Workers KV.
  standardUrl.searchParams.sort();

  return {
    path: standardUrl.pathname.replace(/([^\/])\/$/, "$1"),
    query: Object.fromEntries(standardUrl.searchParams),
    queryString: standardUrl.search,
    _originalUrl: originalUrl,
    _standardUrl: standardUrl
  };
}
