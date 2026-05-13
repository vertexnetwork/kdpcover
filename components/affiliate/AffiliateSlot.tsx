"use client";

import { ExternalLink } from "lucide-react";
import { siteConfig } from "@/lib/site-config";
import { track } from "@/lib/analytics/track";

type Props = {
  /** Where this slot sits in the UI — propagated to analytics. */
  placement: "recommended-page" | "calculator-cta" | "footer";
  className?: string;
};

/**
 * Single-affiliate slot driven by env. Renders nothing unless
 * `NEXT_PUBLIC_AFFILIATE_ENABLED=1` and `NEXT_PUBLIC_AFFILIATE_URL` is set.
 *
 * Per spec §10, every spoke runs at most one affiliate by default. Multi-
 * affiliate is allowed but discouraged.
 */
export function AffiliateSlot({ placement, className }: Props) {
  const affiliate = siteConfig.features.affiliate;
  if (!affiliate.enabled || !affiliate.url) return null;
  return (
    <a
      href={affiliate.url}
      target="_blank"
      rel="noopener sponsored noreferrer"
      onClick={() =>
        track({
          name: "affiliate_click",
          props: { provider: affiliate.provider, placement },
        })
      }
      className={
        "group inline-flex items-center gap-2 rounded-md border border-(--color-border) bg-(--color-surface) px-3 py-2 text-sm text-(--color-on-bg) hover:border-(--color-accent) " +
        (className ?? "")
      }
    >
      <span>{affiliate.label}</span>
      <ExternalLink
        className="h-3.5 w-3.5 opacity-60 transition-opacity group-hover:opacity-100"
        aria-hidden
      />
    </a>
  );
}
