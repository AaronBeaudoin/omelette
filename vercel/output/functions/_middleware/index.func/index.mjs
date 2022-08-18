/**
 * @param {Request} request
 * @param {Event} event
 */
export default async function index(request) {
  console.log("hello from middleware");

  const response = new Response();
  response.headers.set("x-middleware-next", "1");
  response.headers.set("x-middleware-rewrite", "/");
  return response;
}
