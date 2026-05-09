import type { Sku } from "./catalog";

/**
 * Resolve the buyer-facing checkout URL for a SKU.
 *
 * Lemon Squeezy hosts the checkout, handles tax (incl. EU VAT), processes
 * the card, and delivers the download link by email. We never see PII.
 *
 * If the variant env var isn't set yet (e.g. you're still configuring
 * Lemon Squeezy), this returns null and the BuyButton falls back to a
 * "Drops soon — get notified" placeholder so the SEO surface still ships.
 */
export type CheckoutResolution =
  | { status: "ready"; url: string }
  | { status: "pending"; reason: "not-configured" };

export function resolveCheckout(sku: Sku, opts?: { dimsHash?: string }): CheckoutResolution {
  const raw = readEnv(sku.checkoutEnv);
  if (!raw) return { status: "pending", reason: "not-configured" };

  // Lemon Squeezy supports `?checkout[custom][key]=value` for passing
  // metadata that lands in the order webhook. We forward the calculator
  // dims hash so post-purchase emails can recommend the matching file.
  const url = new URL(raw);
  if (opts?.dimsHash) {
    url.searchParams.set("checkout[custom][dims]", opts.dimsHash);
  }
  url.searchParams.set("aff_ref", "site");
  return { status: "ready", url: url.toString() };
}

function readEnv(name: string): string | undefined {
  // Next.js inlines NEXT_PUBLIC_* at build time. We read by literal name so
  // it works in both server and client components.
  switch (name) {
    case "NEXT_PUBLIC_LS_VARIANT_SINGLE":
      return process.env.NEXT_PUBLIC_LS_VARIANT_SINGLE;
    case "NEXT_PUBLIC_LS_VARIANT_UNIVERSAL":
      return process.env.NEXT_PUBLIC_LS_VARIANT_UNIVERSAL;
    case "NEXT_PUBLIC_LS_VARIANT_MEGA":
      return process.env.NEXT_PUBLIC_LS_VARIANT_MEGA;
    default:
      return undefined;
  }
}
