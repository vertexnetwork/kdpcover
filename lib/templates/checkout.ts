import { siteConfig } from "@/lib/site-config";
import type { Sku } from "./catalog";

/**
 * Resolve the buyer-facing checkout URL for the template pack. Single Gumroad
 * product. Returns `pending` until the permalink is configured so the page can
 * show a "Notify me when this drops" placeholder while SEO compounds.
 *
 * Gumroad is Merchant of Record — it collects and remits sales tax / EU VAT,
 * so no tax plumbing is needed on our side.
 */
export type CheckoutResolution =
  | { status: "ready"; url: string }
  | { status: "pending"; reason: "not-configured" };

export function resolveCheckout(_sku: Sku): CheckoutResolution {
  const base = siteConfig.monetization.gumroad.productUrl;
  if (!base) return { status: "pending", reason: "not-configured" };

  let url: URL;
  try {
    url = new URL(base);
  } catch {
    // Misconfigured permalink — fail safe to the pre-launch placeholder
    // rather than rendering a broken buy link.
    return { status: "pending", reason: "not-configured" };
  }

  // Open Gumroad's purchase modal directly instead of the product page.
  url.searchParams.set("wanted", "true");
  return { status: "ready", url: url.toString() };
}
