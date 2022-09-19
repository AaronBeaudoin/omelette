import { Router } from "itty-router";
import { handler as assets } from "./handle-assets";
import { handler as pages } from "./handle-pages";
import { handler as functions } from "./handle-functions";

const router = Router();
router.all("*", assets, functions, pages);

export function getFetch(
  origin: string,
  env: Environment,
  context: ExecutionContext,
  handler: Function
) {
  return async (input: string | Request, options: FetchInit = {}) => {
    if (typeof input !== "string") return await fetch(input, options);
    if (!input.startsWith("/")) return await fetch(input, options);

    let requestUrl = new URL(origin + input);
    if (options.preview) requestUrl.searchParams.append("preview", env.SECRET || "");
    if (options.refresh) requestUrl.searchParams.append("refresh", env.SECRET || "");
    return await handler(new Request(requestUrl, options), env, context);
  };
}

async function handler(request: Request, env: Environment, context: ExecutionContext) {
  const url = new URL(request.url);
  request.origin = url.origin;
  request.path = url.pathname;

  request.fetch = getFetch(url.origin, env, context, handler);
  try { return router.handle(request, env, context); }
  catch (error) { return new Response(null, { status: 500 }); }
}

export default {
  fetch: handler
};
