import { NextResponse } from "next/server";
import { serverConfig } from "@/lib/server-config";
import { siteConfig } from "@/lib/site-config";

// Live status of the founder coupon. Reads the Gumroad offer code server-side
// (seller token never reaches the client) and returns the TRUE remaining uses
// = max_purchase_count - times_used. Cached in-memory per instance for a minute
// so we don't hammer Gumroad's rate limit; the count is allowed to be slightly
// stale (Gumroad enforces the real cap at checkout regardless). Fails closed to
// { active: false } so the founder UI simply doesn't show on any error.

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const OFFER_CODES_ENDPOINT = (productId: string) =>
  `https://api.gumroad.com/v2/products/${encodeURIComponent(productId)}/offer_codes`;

type FounderStatus = {
  active: boolean;
  remaining: number | null; // null = uncapped / hide the count
  percentOff: number;
  price: number;
  code: string;
};

const INACTIVE: FounderStatus = {
  active: false,
  remaining: null,
  percentOff: 0,
  price: 0,
  code: "",
};

const TTL_MS = 60_000;
let cache: { at: number; body: FounderStatus } | null = null;

type GumroadOfferCode = {
  name?: string;
  max_purchase_count?: number | null;
  times_used?: number;
};

export async function GET() {
  const founder = siteConfig.monetization.gumroad.founder;
  const { gumroadAccessToken: token, gumroadProductId: productId } = serverConfig;

  if (!founder.enabled || !token || !productId) {
    return NextResponse.json(INACTIVE);
  }

  if (cache && Date.now() - cache.at < TTL_MS) {
    return NextResponse.json(cache.body);
  }

  let body: FounderStatus = INACTIVE;
  try {
    const res = await fetch(
      `${OFFER_CODES_ENDPOINT(productId)}?access_token=${encodeURIComponent(token)}`,
      { cache: "no-store" },
    );
    const data = (await res.json()) as { success?: boolean; offer_codes?: GumroadOfferCode[] };
    if (data.success && Array.isArray(data.offer_codes)) {
      const target = founder.code.toUpperCase();
      const oc = data.offer_codes.find((c) => (c.name ?? "").toUpperCase() === target);
      if (oc) {
        const cap = typeof oc.max_purchase_count === "number" ? oc.max_purchase_count : null;
        const used = typeof oc.times_used === "number" ? oc.times_used : 0;
        const remaining = cap === null ? null : Math.max(0, cap - used);
        const active = remaining === null ? true : remaining > 0;
        body = {
          active,
          remaining,
          percentOff: founder.percentOff,
          price: founder.price,
          code: founder.code,
        };
      }
    }
  } catch {
    body = INACTIVE;
  }

  cache = { at: Date.now(), body };
  return NextResponse.json(body);
}
