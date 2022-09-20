import { handler as assets } from "./handle-assets";
import { handler as pages } from "./handle-pages";
import { handler as functions } from "./handle-functions";
import { extendRequest } from "./helpers";

async function handler(
  request: WorkerRequest,
  env: WorkerEnvironment,
  context: WorkerContext
) {
  extendRequest(request, env, context, handler);
  const handlers = [assets, functions, pages];

  for (let handler of handlers) {
    const response = await handler(request, env, context);
    if (response) return response;
  }
}

export default {
  fetch: handler
};
