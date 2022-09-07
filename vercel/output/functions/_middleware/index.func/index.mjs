/**
 * @param {Request} request
 * @param {Event} event
 */
export default function middleware(request) {
  const prebuildManifest = PREBUILD_MANIFEST;
  const path = new URL(request.url).pathname;
  const rewrite = `/_functions/${path.split("/").slice(2).join("/")}`;

  const response = new Response();
  response.headers.set("x-middleware-rewrite", rewrite);
  return response;
}
