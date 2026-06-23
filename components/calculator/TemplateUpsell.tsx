"use client";

import Link from "next/link";
import { ShieldCheck, ArrowRight } from "lucide-react";
import type { CoverInput, CoverCalcOutput } from "@kdp/calc";
import { siteConfig } from "@/lib/site-config";
import { PassCheckCta } from "@/components/preflight/PassCheckCta";
import { track } from "@/lib/analytics/track";
import { useImpression } from "@/lib/analytics/use-impression";

type Props = {
  input: CoverInput;
  output: CoverCalcOutput;
};

// Repositioned from the old template-pack upsell to the Cover Pass-Check pitch:
// the highest-intent moment is right after someone computes their dimensions and
// is about to design/upload. The 2,500-template pack rides along as a bonus.
export function TemplateUpsell({ output }: Props) {
  // Impression denominator: how often the post-calculation upsell is actually
  // seen, vs. the calculator-cta buy clicks it produces.
  const viewRef = useImpression<HTMLElement>(() => {
    track({ name: "template_upsell_view", props: { source: "calculator-cta" } });
  });
  return (
    <aside
      ref={viewRef}
      aria-label="Check your cover will pass KDP review"
      className="rounded-card border border-warm-300 bg-gradient-to-br from-warm-50 to-white p-5 sm:p-6"
    >
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="max-w-md">
          <p className="inline-flex items-center gap-1.5 text-xs uppercase tracking-wide text-warm-700">
            <ShieldCheck className="h-3.5 w-3.5" aria-hidden />
            Before you upload
          </p>
          <h3 className="mt-1 text-lg font-display sm:text-xl">
            Will your {output.fullCoverWidthIn.toFixed(2)}″ × {output.fullCoverHeightIn.toFixed(2)}″
            cover pass KDP review?
          </h3>
          <p className="mt-1.5 text-sm text-sage-800">
            Cover Pass-Check reads your finished file and flags wrong size, missing bleed, low DPI,
            RGB color, and unembedded fonts — before KDP rejects it. Includes the 2,500-template
            bonus pack.
          </p>
        </div>

        <div className="flex flex-col items-stretch gap-2 sm:items-end">
          <PassCheckCta source="calculator-cta" />
          <Link
            href={siteConfig.features.preflight.landing}
            className="inline-flex items-center gap-1 text-xs text-sage-700 hover:text-warm-500"
          >
            See what it checks
            <ArrowRight className="h-3 w-3" aria-hidden />
          </Link>
        </div>
      </div>
    </aside>
  );
}
