import { getAssetFromKV } from "@cloudflare/kv-asset-handler";
import assetManifestString from "__STATIC_CONTENT_MANIFEST";
const assetManifest = JSON.parse(assetManifestString);

export async function handler(request: Request, env: Environment, context: ExecutionContext) {
  const config = { ASSET_NAMESPACE: env.__STATIC_CONTENT, ASSET_MANIFEST: assetManifest };
  try { return await getAssetFromKV({ request, waitUntil: context.waitUntil }, config); }
  catch { return undefined; }
}
