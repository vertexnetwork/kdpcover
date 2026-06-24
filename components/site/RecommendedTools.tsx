"use client";

import { ArrowUpRight } from "lucide-react";
import { siteConfig } from "@/lib/site-config";
import { activeRecommendedTools } from "@/lib/content/recommendations";
import { track, type AffiliateSource } from "@/lib/analytics/track";
import { useImpression } from "@/lib/analytics/use-impression";

type Props = {
  source: AffiliateSource;
  className?: string;
};

/**
 * Secondary affiliate strip — the PartnerStack partners from
 * lib/content/recommendations.ts, rendered as a muted "tools authors use" block.
 * Deliberately understated (sage palette, no warm gradient) so it never competes
 * visually with the primary Cover Pass-Check CTA above it. Renders nothing until
 * at least one partner has a referral URL set, so it's safe to place pre-launch.
 */
export function RecommendedTools({ source, className }: Props) {
  const tools = activeRecommendedTools();

  const viewRef = useImpression<HTMLElement>(() => {
    if (tools.length) track({ name: "affiliate_view", props: { source } });
  });

  if (!tools.length) return null;

  return (
    <aside
      ref={viewRef}
      aria-label="Tools indie authors use"
      className={`rounded-card border border-(--color-border) bg-sage-50/50 p-5 sm:p-6 ${className ?? ""}`}
    >
      <p className="text-xs uppercase tracking-wide text-sage-700">Tools indie authors use</p>
      <h2 className="mt-1 text-lg font-display sm:text-xl">
        Once your cover&rsquo;s sized, here&rsquo;s what comes next
      </h2>

      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        {tools.map((t) => (
          <a
            key={t.id}
            href={t.url}
            target="_blank"
            // rel=sponsored marks the paid relationship for search engines;
            // noopener for the new tab.
            rel="sponsored noopener"
            onClick={() => track({ name: "affiliate_click", props: { partner: t.id, source } })}
            className="group flex flex-col rounded-md border border-(--color-border) bg-(--color-surface) p-4 transition-colors hover:border-(--color-accent)"
          >
            <div className="flex items-center justify-between gap-2">
              <span className="font-medium text-(--color-on-bg)">{t.name}</span>
              <ArrowUpRight
                className="h-4 w-4 text-sage-600 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                aria-hidden
              />
            </div>
            <span className="mt-0.5 text-xs uppercase tracking-wide text-sage-600">{t.tag}</span>
            <span className="mt-1.5 text-sm text-sage-800">{t.blurb}</span>
          </a>
        ))}
      </div>

      <p className="mt-4 text-xs text-sage-700">{siteConfig.features.affiliate.disclosure}</p>
    </aside>
  );
}
