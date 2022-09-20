import { handler as assets } from "./handle-assets";
import { handler as pages } from "./handle-pages";
import { handler as functions } from "./handle-functions";
import { extendRequest } from "./helpers";

async function handler(
  request: WorkerRequest,
  env: WorkerEnvironment,
  context: WorkerContext
) {
  const dispatch = async (...handlers: Function[]) => {
    for (let handler of handlers) {
      const response = await handler(request, env, context);
      if (response) return response;
    }
  };

  extendRequest(request, env, context, handler);
  return await dispatch(assets, functions, pages);
}

export default {
  fetch: handler
};
