/**
 * @param {Request} request
 * @param {Event} event
 */
 export default async function index(request) {
  const url = new URL(request.url);

  const host = url.origin;
  const path = url.pathname.slice(4);
  console.log(`${host}/_functions/${path}${url.search}`);
  const response = await fetch(`${host}/_functions/${path}${url.search}`);

  return new Response(response.body, {
    headers: response.headers,
    status: response.status
  });
}
