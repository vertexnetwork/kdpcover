"use client";

import { useState } from "react";
import { ArrowRight, Bell, Lock, ShoppingBag } from "lucide-react";
import { clsx } from "clsx";
import { track } from "@/lib/analytics/track";
import type { Sku } from "@/lib/templates/catalog";

type Props = {
  sku: Sku;
  /** Pre-resolved checkout URL from server. Null = not configured yet. */
  checkoutUrl: string | null;
  source: "store-card" | "product-page" | "calculator-cta" | "pseo";
  size?: "default" | "lg";
  className?: string;
};

export function BuyButton({ sku, checkoutUrl, source, size = "default", className }: Props) {
  const [notified, setNotified] = useState(false);

  if (!checkoutUrl) {
    return (
      <button
        type="button"
        disabled={notified}
        onClick={() => {
          track({ name: "template_notify_click", props: { source } });
          setNotified(true);
        }}
        className={clsx(
          "inline-flex items-center justify-center gap-2 rounded-md border border-warm-300 bg-warm-50 font-medium text-warm-700 transition-colors hover:border-warm-400 disabled:cursor-default disabled:opacity-70",
          size === "lg" ? "px-5 py-3 text-base" : "px-4 py-2.5 text-sm",
          className,
        )}
        aria-live="polite"
      >
        <Bell className="h-4 w-4" aria-hidden />
        {notified ? "Got it — we'll email you" : "Notify me when this drops"}
      </button>
    );
  }

  return (
    <a
      href={checkoutUrl}
      onClick={() =>
        track({ name: "template_buy_click", props: { source, price: sku.priceUsd } })
      }
      target="_blank"
      rel="noopener"
      data-sku={sku.slug}
      className={clsx(
        "group inline-flex items-center justify-center gap-2 rounded-md bg-(--color-on-bg) font-medium text-(--color-on-accent) shadow-sm transition-colors hover:bg-(--color-accent) focus:outline-none focus:ring-2 focus:ring-warm-300",
        size === "lg" ? "px-5 py-3 text-base" : "px-4 py-2.5 text-sm",
        className,
      )}
    >
      <ShoppingBag className="h-4 w-4" aria-hidden />
      <span>
        Buy ${sku.priceUsd}
        {sku.compareAtUsd && (
          <span className="ml-1.5 text-xs font-normal text-white/60 line-through">
            ${sku.compareAtUsd}
          </span>
        )}
      </span>
      <ArrowRight
        className="h-4 w-4 opacity-70 transition-transform group-hover:translate-x-0.5"
        aria-hidden
      />
    </a>
  );
}

export function CheckoutTrust() {
  return (
    <p className="mt-3 inline-flex items-center gap-1.5 text-xs text-sage-700">
      <Lock className="h-3 w-3" aria-hidden />
      Secure checkout via Gumroad. Card, PayPal, Apple Pay. Instant download.
    </p>
  );
}
