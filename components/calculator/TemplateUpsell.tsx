"use client";

import { useEffect, useMemo, useRef } from "react";
import Link from "next/link";
import { Sparkles, ArrowRight } from "lucide-react";
import type { CoverInput, CoverCalcOutput } from "@kdp/calc";
import { recommendSkuForCalc, STORE_PATH } from "@/lib/templates/catalog";
import { resolveCheckout } from "@/lib/templates/checkout";
import { BuyButton } from "@/components/templates/BuyButton";
import { track } from "@/lib/analytics/track";

type Props = {
  input: CoverInput;
  output: CoverCalcOutput;
};

export function TemplateUpsell({ input, output }: Props) {
  const sku = useMemo(() => recommendSkuForCalc({ format: input.format }), [input.format]);
  const checkoutUrl = useMemo(() => {
    const r = resolveCheckout(sku);
    return r.status === "ready" ? r.url : null;
  }, [sku]);

  // Fire one impression event per SKU surface (the upsell can swap when
  // user toggles paperback ↔ hardcover).
  const seen = useRef<Set<string>>(new Set());
  useEffect(() => {
    if (seen.current.has(sku.slug)) return;
    seen.current.add(sku.slug);
    track({
      name: "template_upsell_view",
      props: { sku: sku.slug, source: "calculator-cta" },
    });
  }, [sku.slug]);

  return (
    <aside
      aria-label="Skip the layout — buy a ready-made template"
      className="rounded-card border border-warm-300 bg-gradient-to-br from-warm-50 to-white p-5 sm:p-6"
    >
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="max-w-md">
          <p className="inline-flex items-center gap-1.5 text-xs uppercase tracking-wide text-warm-700">
            <Sparkles className="h-3.5 w-3.5" aria-hidden />
            Skip the layout
          </p>
          <h3 className="mt-1 text-lg font-display sm:text-xl">
            Get a print-ready template for {output.fullCoverWidthIn.toFixed(2)}″ × {output.fullCoverHeightIn.toFixed(2)}″
          </h3>
          <p className="mt-1.5 text-sm text-sage-800">
            {sku.hook} Spine, bleed, and barcode area pre-positioned. Open in Affinity, Illustrator,
            Inkscape, Figma, or Canva.
          </p>
        </div>

        <div className="flex flex-col items-stretch gap-2 sm:items-end">
          <div className="flex items-baseline gap-1.5">
            <span className="tabular text-2xl font-display">${sku.priceUsd}</span>
            {sku.compareAtUsd && (
              <span className="tabular text-xs text-sage-600 line-through">${sku.compareAtUsd}</span>
            )}
          </div>
          <BuyButton
            sku={sku}
            checkoutUrl={checkoutUrl}
            source="calculator-cta"
            className="min-w-[140px]"
          />
          <Link
            href={`${STORE_PATH}/${sku.slug}`}
            className="inline-flex items-center gap-1 text-xs text-sage-700 hover:text-warm-500"
          >
            What&rsquo;s inside
            <ArrowRight className="h-3 w-3" aria-hidden />
          </Link>
        </div>
      </div>
    </aside>
  );
}
