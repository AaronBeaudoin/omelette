import { handler as functions } from "./handle-functions";
import { extendRequest } from "./helpers";

async function handler(
  request: WorkerRequest,
  env: WorkerEnvironment,
  context: WorkerContext
) {
  extendRequest(request, env, context, handler);
  const response = await functions(request, env, context);

  if (response) {
    const headers = new Headers(response.headers);
    headers.set("X-Function-Proxy", "HIT");
    headers.set("Cache-Control", "no-cache");

    return new Response(response.body, {
      headers: headers,
      status: response.status
    });
  }

  return new Response(null, {
    headers: { "X-Function-Proxy": "MISS" },
    status: 204
  });
}

export default {
  fetch: handler
};
