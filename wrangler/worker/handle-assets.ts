import { getAssetFromKV } from "@cloudflare/kv-asset-handler";
import assetManifestString from "__STATIC_CONTENT_MANIFEST";
const assetManifest = JSON.parse(assetManifestString);

export async function handler(
  request: WorkerRequest,
  env: WorkerEnvironment,
  context: WorkerContext
) {
  const event = { request, waitUntil: (_: Promise<any>) => context.waitUntil(_) };
  const config = { ASSET_NAMESPACE: env.__STATIC_CONTENT, ASSET_MANIFEST: assetManifest };

  try { return await getAssetFromKV(event, config); }
  catch { return; }
}
