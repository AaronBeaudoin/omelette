import { renderPage } from "vite-plugin-ssr";

/**
 * @param {Request} request
 * @param {Event} event
 */
export default async function index(request) {
  const pageContext = await renderPage({ url: request.url });
  if (!pageContext.httpResponse) return new Response(null, { status: 200 });

  return new Response(pageContext.httpResponse.body, {
    headers: { "Content-Type": pageContext.httpResponse.contentType },
    status: pageContext.httpResponse.statusCode
  });
}
