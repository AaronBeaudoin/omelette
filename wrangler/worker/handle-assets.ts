import { getAssetFromKV, Options as AssetHandlerConfig } from "@cloudflare/kv-asset-handler";
import { Environment } from "./types";

import assetManifestString from "__STATIC_CONTENT_MANIFEST";
const assetManifest = JSON.parse(assetManifestString);

function getFetchEvent(request: Request, context: ExecutionContext) {
  const waitUntil = (_: Promise<any>) => context.waitUntil(_);
  return { request: request, waitUntil: waitUntil } as FetchEvent;
}

function getAssetHandlerConfig(env: Environment): Partial<AssetHandlerConfig> {
  return { ASSET_NAMESPACE: env.__STATIC_CONTENT, ASSET_MANIFEST: assetManifest };
}

export async function handleAssetRoute(
  request: Request,
  env: Environment,
  context: ExecutionContext
) {
  const event = getFetchEvent(request, context);
  const config = getAssetHandlerConfig(env);

  try { return await getAssetFromKV(event, config); }
  catch { return null; }
}
