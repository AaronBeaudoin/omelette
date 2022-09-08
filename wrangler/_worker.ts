import { getAssetFromKV, Options as AssetHandlerConfig } from "@cloudflare/kv-asset-handler";
import { renderPage } from "vite-plugin-ssr";

// @ts-ignore
import functionManifest from "./_manifest";

import assetManifestString from "__STATIC_CONTENT_MANIFEST";
const assetManifest = JSON.parse(assetManifestString);

interface Environment {
  __STATIC_CONTENT: KVNamespace,
  DATA: KVNamespace
}

function getParsedUrl(request: Request) {
  const originalUrl = request.url;
  const standardUrl = new URL(request.url);

  // Ensuring the query is sorted allows us to reliably use it later
  // as part of a key for looking up "cached" data in Workers KV.
  standardUrl.searchParams.sort();

  return {
    path: standardUrl.pathname.replace(/([^\/])\/$/, "$1"),
    query: Object.fromEntries(standardUrl.searchParams),
    queryString: standardUrl.search,
    _originalUrl: originalUrl,
    _standardUrl: standardUrl
  };
}

function getFetchEvent(request: Request, context: ExecutionContext) {
  const waitUntil = (_: Promise<any>) => context.waitUntil(_);
  return { request: request, waitUntil: waitUntil } as FetchEvent;
}

function getAssetHandlerConfig(env: Environment): Partial<AssetHandlerConfig> {
  return { ASSET_NAMESPACE: env.__STATIC_CONTENT, ASSET_MANIFEST: assetManifest };
}

async function handleFunctionRoute(
  request: Request,
  env: Environment,
  context: ExecutionContext
) {
  const url = getParsedUrl(request);
  if (!url.path.startsWith("/fn")) return null;
  if (!(url.path in functionManifest)) return new Response(null, { status: 404 });

  const path = url.path as keyof typeof functionManifest;
  const functionConfig = functionManifest[path] as { [method: string]: Function };
  const functionResult = await functionConfig[request.method.toLowerCase()](url.query);

  return new Response(functionResult?.data, {
    status: 200,
    headers: {
      "Content-Type": functionResult?.contentType || "text/plain",
      "X-Data-Cache": "PREVIEW"
    }
  });
}

async function handleAssetRoute(
  request: Request,
  env: Environment,
  context: ExecutionContext
) {
  const event = getFetchEvent(request, context);
  const config = getAssetHandlerConfig(env);

  try { return await getAssetFromKV(event, config); }
  catch { return null; }
}

async function handlePageRoute(request: Request) {
  const initialPageContext = { urlOriginal: request.url };
  const pageContext = await renderPage(initialPageContext);
  if (!pageContext.httpResponse) return null;

  const { readable, writable } = new TransformStream();
  pageContext.httpResponse.pipe(writable);
  return new Response(readable);
}

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
