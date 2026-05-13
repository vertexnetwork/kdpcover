import { siteConfig } from "@/lib/site-config";
import type { Sku } from "./catalog";

/**
 * Resolve the buyer-facing checkout URL for a SKU. Single Lemon Squeezy
 * store, single variant (set via env). Returns `pending` until both are
 * configured so the page can show a "Drops soon" placeholder while SEO
 * compounds.
 */
export type CheckoutResolution =
  | { status: "ready"; url: string }
  | { status: "pending"; reason: "not-configured" };

export function resolveCheckout(_sku: Sku, opts?: { dimsHash?: string }): CheckoutResolution {
  const storeId = siteConfig.monetization.lemonSqueezy.storeId;
  const variant = process.env.NEXT_PUBLIC_LEMON_SQUEEZY_VARIANT;
  if (!storeId || !variant) return { status: "pending", reason: "not-configured" };

  const url = new URL(`https://${storeId}.lemonsqueezy.com/buy/${variant}`);
  if (opts?.dimsHash) {
    url.searchParams.set("checkout[custom][dims]", opts.dimsHash);
  }
  url.searchParams.set("aff_ref", "site");
  return { status: "ready", url: url.toString() };
}
