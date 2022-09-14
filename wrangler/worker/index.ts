import { getParsedResource } from "./helpers";
import { handleFunctionRoute } from "./handle-functions";
import { handleAssetRoute } from "./handle-assets";
import { handlePageRoute } from "./handle-pages";

async function handleRequest(request: Request, env: Environment, context: ExecutionContext) {
  const resource = getParsedResource(request, env, context, handleRequest);
  let response: Response | null = null;

  // 1. Respond with function result if applicable.
  response = await handleFunctionRoute(resource, env, context);
  if (response) return response;

  // 2. Respond with a static asset if applicable.
  response = await handleAssetRoute(resource, env, context);
  if (response) return response;
  
  // 3. Respond with a page if applicable.
  response = await handlePageRoute(resource, env, context);
  if (response) return response;

  // 4. Fallback to a minimal 404 page.
  // This code should never be executed under normal circumstances
  // because the page route handler should always return a response.
  return new Response("END_OF_WORKER", { status: 500 });
}

export default {
  fetch: handleRequest
};
