import { NextResponse, type NextRequest } from "next/server";
import { isPreflightConfigured, serverConfig } from "@/lib/server-config";
import { evaluateLicense, extractTier, verifyLicenseWithGumroad } from "@/lib/gumroad-license";
import { signToken } from "@/lib/preflight-token";
import { putClaim } from "@/lib/claim-store";

// Gumroad Ping (seller notification) — a server-to-server POST on every sale,
// x-www-form-urlencoded. We only act on sales that carry a `claim` nonce (added
// to the checkout URL by our buy button and echoed back under url_params). For
// those we re-verify the license against Gumroad's API — the Ping itself is
// unauthenticated, so this verify IS the anti-spoof check and the product match
// — then mint the same signed unlock token the manual flow uses and stash it
// under the nonce for the buyer's browser to claim. Everything is best-effort
// and fails closed to manual key entry.
//
// Configure at Gumroad → Settings → Advanced → Ping:
//   https://kdpcover.pro/api/gumroad/ping

export const runtime = "nodejs"; // node:crypto in signToken
export const dynamic = "force-dynamic";

const MAX_NONCE_LEN = 128;

export async function POST(req: NextRequest) {
  // Respond 200 to anything we can't or shouldn't act on, so Gumroad treats the
  // ping as delivered and doesn't retry hourly for the next 3 hours.
  if (!isPreflightConfigured()) return NextResponse.json({ ok: true });

  let params: URLSearchParams;
  try {
    params = new URLSearchParams(await req.text());
  } catch {
    return NextResponse.json({ ok: true });
  }

  const nonce = (params.get("url_params[claim]") ?? "").trim();
  const licenseKey = (params.get("license_key") ?? "").trim();
  if (!nonce || nonce.length > MAX_NONCE_LEN || !licenseKey) {
    return NextResponse.json({ ok: true });
  }

  // Authoritative check against our product; don't increment the uses count —
  // this is the buyer's own just-completed purchase, not a device activation.
  const data = await verifyLicenseWithGumroad(
    licenseKey,
    serverConfig.gumroadProductId,
    fetch,
    false,
  );

  // Transport/parse failure: signal non-200 so Gumroad retries (it re-POSTs
  // hourly for ~3h), giving the ping another chance to land.
  if (data === null) {
    return NextResponse.json({ ok: false }, { status: 503 });
  }

  // Invalid / refunded / over cap: nothing to grant, but it's a settled answer.
  if (!evaluateLicense(data, serverConfig.preflightUsesCap).ok) {
    return NextResponse.json({ ok: true });
  }

  const tier = extractTier(data, serverConfig.studioVariantNames);
  await putClaim(nonce, signToken(licenseKey, tier));
  return NextResponse.json({ ok: true });
}
