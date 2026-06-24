// Server-only secrets for the gated Cover Pass-Check tool. NONE of these carry
// the NEXT_PUBLIC_ prefix, so Next never inlines them into the client bundle —
// this module must only ever be imported from route handlers / server
// components.
//
// Set these in Vercel project env (not .env.example, which is committed):
//   GUMROAD_PRODUCT_ID      — the product's unique id (post-2023 products
//                             require product_id, not permalink, to verify).
//   PREFLIGHT_TOKEN_SECRET  — long random string; HMAC key for the unlock cookie.
//   PREFLIGHT_USES_CAP      — max license activations before sharing is blocked.
//   GUMROAD_STUDIO_VARIANTS — comma-separated Gumroad version names that grant
//                             the Studio (batch) tier. Default studio,volume,batch.

const DEFAULT_STUDIO_VARIANTS = ["studio", "volume", "batch"];

function parseStudioVariants(raw: string | undefined): string[] {
  if (!raw) return DEFAULT_STUDIO_VARIANTS;
  const parsed = raw
    .split(",")
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean);
  return parsed.length > 0 ? parsed : DEFAULT_STUDIO_VARIANTS;
}

export const serverConfig = {
  gumroadProductId: process.env.GUMROAD_PRODUCT_ID ?? "",
  preflightTokenSecret: process.env.PREFLIGHT_TOKEN_SECRET ?? "",
  // Seller access token — read-only use: fetch the founder coupon's live
  // remaining-uses count. Never exposed to the client.
  gumroadAccessToken: process.env.GUMROAD_ACCESS_TOKEN ?? "",
  // 5 covers a buyer's own laptop + phone plus the occasional re-unlock after a
  // cleared cookie, without leaving room to seed a sharing group. Tunable.
  preflightUsesCap: Number(process.env.PREFLIGHT_USES_CAP ?? "5"),
  // Gumroad "version" names that map to the Studio (batch) tier. Anything else
  // — including an unparseable variant — falls back to the Author tier.
  studioVariantNames: parseStudioVariants(process.env.GUMROAD_STUDIO_VARIANTS),
} as const;

// True only when the gate can actually function. The verify route returns a
// clear 500 (not a silent pass) when these are missing, so a misconfigured
// deploy fails closed rather than handing out free access.
export function isPreflightConfigured(): boolean {
  return (
    serverConfig.gumroadProductId.length > 0 && serverConfig.preflightTokenSecret.length > 0
  );
}
