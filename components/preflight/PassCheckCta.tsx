"use client";

import { useState } from "react";
import { ShoppingBag, Bell, ArrowRight, Lock } from "lucide-react";
import { clsx } from "clsx";
import { siteConfig } from "@/lib/site-config";
import { track, type PassCheckSource } from "@/lib/analytics/track";

const gumroad = siteConfig.monetization.gumroad;

type Tier = "author" | "studio";

/** Resolve the buyer-facing checkout URL, or null when the store isn't live yet
 *  (env not configured) so the CTA shows the pre-launch "Notify me" state. */
function checkoutUrl(source: PassCheckSource, tier: Tier): string | null {
  if (!gumroad.enabled || !gumroad.productUrl) return null;
  const base = tier === "studio" && gumroad.studioUrl ? gumroad.studioUrl : gumroad.productUrl;
  try {
    const url = new URL(base);
    url.searchParams.set("wanted", "true");
    url.searchParams.set("utm_source", "kdpcover");
    url.searchParams.set("utm_medium", "site");
    url.searchParams.set("utm_content", source);
    return url.toString();
  } catch {
    return null;
  }
}

type Props = {
  source: PassCheckSource;
  tier?: Tier;
  variant?: "button" | "card";
  size?: "default" | "lg";
  className?: string;
};

export function PassCheckCta({
  source,
  tier = "author",
  variant = "button",
  size = "default",
  className,
}: Props) {
  const [notified, setNotified] = useState(false);
  const url = checkoutUrl(source, tier);
  const price = tier === "studio" ? gumroad.studioPrice : gumroad.price;

  const buyOrNotify = url ? (
    <a
      href={url}
      target="_blank"
      rel="noopener"
      onClick={() => track({ name: "passcheck_buy_click", props: { source, price } })}
      className={clsx(
        "group inline-flex items-center justify-center gap-2 rounded-md bg-(--color-on-bg) font-medium text-(--color-on-accent) shadow-sm transition-colors hover:bg-(--color-accent) focus:outline-none focus:ring-2 focus:ring-warm-300",
        size === "lg" ? "px-5 py-3 text-base" : "px-4 py-2.5 text-sm",
        className,
      )}
    >
      <ShoppingBag className="h-4 w-4" aria-hidden />
      <span>
        Get Pass-Check{tier === "studio" ? " Studio" : ""} ${price}
      </span>
      <ArrowRight
        className="h-4 w-4 opacity-70 transition-transform group-hover:translate-x-0.5"
        aria-hidden
      />
    </a>
  ) : (
    <button
      type="button"
      disabled={notified}
      onClick={() => {
        track({ name: "passcheck_notify_click", props: { source } });
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

  if (variant === "button") return buyOrNotify;

  return (
    <div className="rounded-card border border-sage-200 bg-white p-5">
      <p className="text-xs uppercase tracking-wide text-(--color-accent)">Cover Pass-Check</p>
      <div className="mt-1 flex items-baseline gap-2">
        <span className="font-display text-3xl">${price}</span>
        <span className="text-sm text-sage-700">
          one-time · {tier === "studio" ? "Studio (batch)" : "Author"}
        </span>
      </div>
      <p className="mt-2 text-sm text-sage-800">
        Upload your finished cover and get an instant pass/fail report against KDP&rsquo;s spec and
        your exact book. Includes the 2,500-template bonus pack.
      </p>
      <div className="mt-4">{buyOrNotify}</div>
      <p className="mt-3 inline-flex items-center gap-1.5 text-xs text-sage-700">
        <Lock className="h-3 w-3" aria-hidden />
        Secure checkout via Gumroad · 7-day refund · instant access.
      </p>
    </div>
  );
}
