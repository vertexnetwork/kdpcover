// Gumroad license verification — split into a pure evaluator (unit-testable
// without network) and a thin fetch wrapper. The verify endpoint needs no
// OAuth: just product_id + license_key.  Docs: gumroad.com/help/article/76.

const VERIFY_ENDPOINT = "https://api.gumroad.com/v2/licenses/verify";

export type PreflightTier = "author" | "studio";

export type GumroadPurchase = {
  refunded?: boolean;
  chargebacked?: boolean;
  disputed?: boolean;
  email?: string;
  // Gumroad surfaces the chosen product "version" under one of these fields,
  // depending on product/account age. We read all of them for tier detection.
  variants?: string;
  tier_name?: string;
  name?: string;
  [key: string]: unknown;
};

export type GumroadVerifyResponse = {
  success?: boolean;
  // Incremented on every verify call (unless increment_uses_count=false). We
  // use it as a cheap sharing signal — past the cap, refuse the unlock.
  uses?: number;
  purchase?: GumroadPurchase;
  message?: string;
};

export type LicenseEvaluation = { ok: true } | { ok: false; reason: string };

// Pure decision: given Gumroad's response and our uses cap, may this buyer in?
// Order matters — a refund/dispute disqualifies regardless of uses count.
export function evaluateLicense(
  data: GumroadVerifyResponse | null | undefined,
  usesCap: number,
): LicenseEvaluation {
  if (!data || !data.success) return { ok: false, reason: "invalid" };
  const p = data.purchase ?? {};
  if (p.refunded) return { ok: false, reason: "refunded" };
  if (p.chargebacked) return { ok: false, reason: "chargebacked" };
  if (p.disputed) return { ok: false, reason: "disputed" };
  if (typeof data.uses === "number" && usesCap > 0 && data.uses > usesCap) {
    return { ok: false, reason: "uses_exceeded" };
  }
  return { ok: true };
}

// Pure tier resolver: which Gumroad "version" did the buyer pick? We scan the
// variant-bearing fields for any of the configured Studio names. Default to
// "author" on any ambiguity — never over-grant the batch tier.
export function extractTier(
  data: GumroadVerifyResponse | null | undefined,
  studioVariantNames: readonly string[],
): PreflightTier {
  const p = data?.purchase ?? {};
  const haystack = [p.variants, p.tier_name, p.name]
    .filter((v): v is string => typeof v === "string")
    .join(" ")
    .toLowerCase();
  if (!haystack) return "author";
  return studioVariantNames.some((name) => haystack.includes(name)) ? "studio" : "author";
}

// Calls Gumroad's verify API. fetchImpl is injectable for tests. Returns null
// on transport/parse failure so the caller can fail closed.
export async function verifyLicenseWithGumroad(
  licenseKey: string,
  productId: string,
  fetchImpl: typeof fetch = fetch,
  // The manual unlock flow increments Gumroad's uses count as a sharing signal.
  // The automatic (Ping) path passes false: it's the buyer's own fresh purchase,
  // so it shouldn't eat into their device budget.
  incrementUses: boolean = true,
): Promise<GumroadVerifyResponse | null> {
  try {
    const res = await fetchImpl(VERIFY_ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        product_id: productId,
        license_key: licenseKey,
        increment_uses_count: incrementUses ? "true" : "false",
      }),
    });
    // Gumroad returns 404 with { success:false } for an unknown key — that's a
    // valid "no" answer, so parse the body regardless of status.
    return (await res.json()) as GumroadVerifyResponse;
  } catch {
    return null;
  }
}
