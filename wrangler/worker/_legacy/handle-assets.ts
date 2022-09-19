import { getAssetFromKV } from "@cloudflare/kv-asset-handler";
import { getParsedResource } from "./helpers";

import assetManifestString from "__STATIC_CONTENT_MANIFEST";
const assetManifest = JSON.parse(assetManifestString);

export async function handleAssetRoute(
  resource: ReturnType<typeof getParsedResource>,
  env: Environment,
  context: ExecutionContext
) {
  const event = { request: resource.request, waitUntil: (_: Promise<any>) => context.waitUntil(_) };
  const config = { ASSET_NAMESPACE: env.__STATIC_CONTENT, ASSET_MANIFEST: assetManifest };

  try { return await getAssetFromKV(event, config); }
  catch { return null; }
}
