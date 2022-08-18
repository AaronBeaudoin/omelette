/**
 * @param {Request} request
 * @param {Event} event
 */
export default async function index(request) {
  console.log("hello from middleware");

  const response = new Response();
  response.headers.set("X-Middleware-Rewrite", "/");
  response.headers.set("X-Middleware-Next", "1");
  return response;
}
