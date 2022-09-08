import { handleFunctionRoute } from "./handle-functions";
import { handleAssetRoute } from "./handle-assets";
import { handlePageRoute } from "./handle-pages";
import { Environment } from "./types";

export default {
  async fetch(request: Request, env: Environment, context: ExecutionContext) {
    let response: Response | null = null;

    // 1. Respond with function output if applicable for the incoming path.
    response = await handleFunctionRoute(request, env, context);
    if (response) return response;

    // 2. Respond with a static asset if applicable for the incoming path.
    response = await handleAssetRoute(request, env, context);
    if (response) return response;
    
    // 3. Respond with a page if applicable for the incoming path.
    response = await handlePageRoute(request);
    if (response) return response;

    // 4. Fallback to a minimal 404 page.
    // This code should never be executed under normal circumstances
    // because the page route handler should always return a response.
    return new Response("END_OF_WORKER", { status: 500 });
  }
};
