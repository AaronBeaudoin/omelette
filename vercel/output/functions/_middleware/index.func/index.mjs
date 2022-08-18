/**
 * @param {Request} request
 * @param {Event} event
 */
export default async function index(request) {
  const url = new URL(request.url);
  url.pathname = "/";
  console.log(url.toString());

  const response = new Response();
  // response.headers.set("x-middleware-next", "1");
  response.headers.set("x-middleware-rewrite", url.toString());
  return response;
}
