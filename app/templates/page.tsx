import type { Metadata } from "next";
import Link from "next/link";
import { ShieldCheck, Zap, Download } from "lucide-react";
import { CATALOG, STORE_PATH } from "@/lib/templates/catalog";
import { ProductCard } from "@/components/templates/ProductCard";

export const metadata: Metadata = {
  title: "KDP cover templates — print-ready files for every trim",
  description:
    "Ready-to-design KDP cover templates with spine width, bleed, and barcode area pre-marked. SVG + PDF + EPS for Affinity, Illustrator, Inkscape, Figma, Canva.",
  alternates: { canonical: STORE_PATH },
  openGraph: {
    title: "KDP cover templates — pass review on the first try",
    description:
      "Print-ready KDP-spec cover templates. Spine, bleed, barcode, and safe zones pre-marked. Universal vector formats.",
  },
};

export default function TemplatesStorePage() {
  return (
    <article className="mx-auto max-w-6xl px-4 py-10 sm:px-6 sm:py-14">
      <header className="max-w-3xl">
        <p className="text-xs uppercase tracking-wide text-warm-500">Templates</p>
        <h1 className="mt-2 text-3xl leading-tight sm:text-5xl">
          Skip the layout. Ship the cover.
        </h1>
        <p className="mt-4 text-base text-sage-800 sm:text-lg">
          KDP-spec cover files with spine width, bleed, hinge zones, and barcode area already
          positioned. Open in Affinity Publisher, Illustrator, Inkscape, Figma, or Canva Pro and
          design — no measuring, no math, no failed cover review.
        </p>
        <div className="mt-5 flex flex-wrap items-center gap-3 text-xs text-sage-700">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-sage-200 bg-white px-2.5 py-1">
            <ShieldCheck className="h-3.5 w-3.5 text-sage-600" aria-hidden />
            Verified against KDP&rsquo;s template generator
          </span>
          <span className="inline-flex items-center gap-1.5 rounded-full border border-sage-200 bg-white px-2.5 py-1">
            <Zap className="h-3.5 w-3.5 text-sage-600" aria-hidden />
            Instant download — no account, no waiting
          </span>
          <span className="inline-flex items-center gap-1.5 rounded-full border border-sage-200 bg-white px-2.5 py-1">
            <Download className="h-3.5 w-3.5 text-sage-600" aria-hidden />
            SVG + PDF — open anywhere
          </span>
        </div>
      </header>

      <section className="mt-12 grid gap-6 md:grid-cols-3">
        {CATALOG.map((sku) => (
          <ProductCard key={sku.slug} sku={sku} />
        ))}
      </section>

      <section className="mt-16 max-w-3xl">
        <h2 className="text-2xl">Why this exists</h2>
        <p className="mt-3 text-sage-800">
          KDP rejects covers for the wrong spine width every day. Their template generator works
          but is slow, single-shot, and ties you to their browser. These bundles give you the same
          dimensions in universal vector formats, so you can design once and ship to KDP,
          IngramSpark, or Barnes &amp; Noble Press without re-doing the math.
        </p>
      </section>

      <section className="mt-12 max-w-3xl">
        <h2 className="text-2xl">Frequently asked</h2>
        <dl className="mt-4 space-y-6">
          <Faq
            q="Do I get a refund if it doesn't work?"
            a="Yes — 14-day no-questions-asked refund. Email the receipt and we&rsquo;ll process it."
          />
          <Faq
            q="What software do I need?"
            a="Any vector editor — Affinity Publisher (recommended for KDP), Illustrator, Inkscape (free), Figma, or Canva Pro. The files are SVG and PDF, not proprietary."
          />
          <Faq
            q="Will KDP accept covers made from these?"
            a="Yes. Every dimension matches KDP&rsquo;s published spec. The bundle includes a one-page checklist so you can verify before upload."
          />
          <Faq
            q="What about a custom trim that's not in any pack?"
            a="Use the free calculator on the home page to compute exact dimensions, then start from the closest template. Or upgrade to the Mega Pack for full coverage."
          />
        </dl>
        <p className="mt-6 text-sm">
          Still unsure? <Link href="/" className="text-warm-500 hover:text-warm-700">Use the free calculator first</Link> — most people figure out which pack they need within 60 seconds.
        </p>
      </section>
    </article>
  );
}

function Faq({ q, a }: { q: string; a: string }) {
  return (
    <div>
      <dt className="font-medium text-ink">{q}</dt>
      <dd className="mt-1 text-sm text-sage-800">{a}</dd>
    </div>
  );
}
