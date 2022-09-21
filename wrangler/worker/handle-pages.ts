import { renderPage } from "vite-plugin-ssr";

export async function handler(request: WorkerRequest) {
  const initialPageContext = { urlOriginal: request.url, fetch: request.fetch };
  const pageContext = await renderPage(initialPageContext);
  if (!pageContext.httpResponse) return new Response(null, { status: 200 });

  const { readable, writable } = new TransformStream();
  pageContext.httpResponse.pipe(writable);
  return new Response(readable);
}
