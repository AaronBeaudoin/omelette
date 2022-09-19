import { renderPage } from "vite-plugin-ssr";

export async function handler(request: Request) {
  const initialPageContext = { urlOriginal: request.url };
  const pageContext = await renderPage(initialPageContext);
  if (!pageContext.httpResponse) return undefined;

  const { readable, writable } = new TransformStream();
  pageContext.httpResponse.pipe(writable);
  return new Response(readable);
}
