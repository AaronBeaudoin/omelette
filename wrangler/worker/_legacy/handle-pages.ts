import { renderPage } from "vite-plugin-ssr";
import { getParsedResource } from "./helpers";

export async function handlePageRoute(
  resource: ReturnType<typeof getParsedResource>,
  env: Environment,
  context: ExecutionContext
) {
  const initialPageContext = { urlOriginal: resource.request.url };
  const pageContext = await renderPage(initialPageContext);
  if (!pageContext.httpResponse) return null;

  const { readable, writable } = new TransformStream();
  pageContext.httpResponse.pipe(writable);
  return new Response(readable);
}
