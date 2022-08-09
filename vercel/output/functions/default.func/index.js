import { renderPage } from "./depends/vite-plugin-ssr";

/**
 * @param {Request} request
 * @param {Event} event
 */
export default async function index(request) {
  console.log("[edge]");
  console.log(request.url);
  console.log(Array.from(request.headers.entries()));
  console.log(await request.text());

  const pageContext = await renderPage({ url: request.url });
  const { httpResponse } = pageContext;

  if (!httpResponse) {
    return new Response(null, { status: 200 });

  } else {
    return new Response(httpResponse.body, {
      status: httpResponse.statusCode,
      headers: { "Content-Type": httpResponse.contentType }
    });
  }
}
