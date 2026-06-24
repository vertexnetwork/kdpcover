import Link from "next/link";
import { siteFacts } from "@/lib/content/site-facts";
import { faqJsonLd } from "@/lib/seo/jsonld";
import { siteConfig } from "@/lib/site-config";
import { PassCheckCta } from "@/components/preflight/PassCheckCta";

export const metadata = {
  title: "KDP cover review: a no-rejection checklist",
  description:
    "Everything KDP's automated cover review checks — spine width, bleed, safe zones, barcode placement, file format — in one scannable checklist for self-published authors and cover designers.",
  alternates: { canonical: "/guide" },
};

const REJECTION_REASONS = [
  {
    title: "Spine width is wrong for the page count",
    detail:
      "KDP rejects covers when the spine in your PDF doesn't match the page count × paper multiplier. Use the calculator to compute the exact spine before laying out artwork — not after.",
  },
  {
    title: "Spine text on a sub-79-page book",
    detail:
      "Books under 79 pages have spines too narrow for KDP's reviewer to accept printed text or graphics. Either keep the spine plain or add pages.",
  },
  {
    title: "Bleed missing or wrong",
    detail:
      'Paperback covers need 0.125" bleed on every outside edge. Hardcover (case-laminate) covers do not use traditional bleed; instead they have a 0.51" wrap that folds inside the case. Mixing the two is the most common rejection.',
  },
  {
    title: "Safe-zone violations",
    detail:
      'Keep critical text and graphics 0.125" inside the trim line on paperback, or 0.635" from outside edges on hardcover. Hardcover has an additional 0.4" hinge dead-zone on each side of the spine — nothing prints there.',
  },
  {
    title: "Barcode area covered or off-spec",
    detail:
      'Reserve a 2" × 1.2" white area at the bottom-right of the back cover, with 0.25" clearance from spine and trim edges and 0.76" from the bottom. Anything overlapping this fails review.',
  },
  {
    title: "File too large or wrong format",
    detail:
      "Submit a single flattened PDF — back, spine, and front in one file — with fonts embedded, no crop marks, 300 DPI minimum, CMYK preferred. Recommended ≤40 MB; hard limit 650 MB.",
  },
  {
    title: "Trim size mismatch with interior",
    detail:
      'The cover trim must exactly match the interior trim you uploaded. Custom trims work, but both files must agree to the 0.01" precision.',
  },
];

const CHECKLIST = [
  `Computed spine width with ${siteConfig.name} using the actual paper choice (white / cream / standard color / premium color).`,
  "Full-cover dimensions match my interior trim (width × 2 + spine + bleed/wrap).",
  'Bleed: 0.125" on paperback, 0.51" wrap on hardcover.',
  'Safe zone: 0.125" inside on paperback, 0.635" inside on hardcover.',
  'Hardcover only: nothing in the 0.4" hinge dead-zone on either side of the spine.',
  'Barcode: 2" × 1.2" reserved area at the bottom-right of back cover, light/white background.',
  "Spine text: only if the book is ≥79 pages.",
  "Single flattened PDF, fonts embedded, no crop marks, 300 DPI, CMYK preferred.",
  "Filename includes ASCII characters only.",
];

export default function GuidePage() {
  const guideFaqs = siteFacts.faq.slice(0, 6);

  return (
    <article className="mx-auto max-w-3xl px-4 py-10 sm:px-6 sm:py-14">
      <p className="text-sage-700 text-xs font-medium tracking-[0.18em] uppercase">
        KDP cover review guide
      </p>
      <h1 className="mt-2 text-3xl leading-tight sm:text-4xl">
        Pass KDP&rsquo;s automated cover review on the first upload.
      </h1>
      <p className="text-sage-800 mt-3">
        KDP&rsquo;s reviewer checks geometry, bleed, safe zones, barcode placement, and file format.
        Every rejection we&rsquo;ve seen falls into one of seven buckets. Here they are, with the
        exact spec each one trips on.
      </p>

      <div className="rounded-card mt-8 border border-(--color-border) bg-(--color-surface) p-5 sm:p-6">
        <h2 className="text-xl">The pre-flight checklist</h2>
        <ul className="text-sage-800 mt-3 space-y-2 text-sm">
          {CHECKLIST.map((c) => (
            <li key={c} className="flex items-start gap-2">
              <span aria-hidden className="bg-sage-400 mt-1 h-1.5 w-1.5 shrink-0 rounded-full" />
              <span>{c}</span>
            </li>
          ))}
        </ul>
        <p className="text-sage-700 mt-4 text-xs">
          Run every line before exporting. Most KDP rejections are first-time-author misses, not
          edge cases.
        </p>
      </div>

      <h2 className="mt-12 text-2xl">The seven rejection patterns</h2>
      <ol className="mt-4 space-y-5">
        {REJECTION_REASONS.map((r, i) => (
          <li key={r.title}>
            <h3 className="text-base font-medium">
              <span className="tabular text-sage-700">{String(i + 1).padStart(2, "0")}.</span>{" "}
              {r.title}
            </h3>
            <p className="text-sage-800 mt-1 text-sm">{r.detail}</p>
          </li>
        ))}
      </ol>

      <div className="rounded-card border-warm-300 from-warm-50 mt-12 border bg-gradient-to-br to-(--color-surface) p-5 sm:p-6">
        <h2 className="text-xl">Don&rsquo;t want to eyeball all seven?</h2>
        <p className="text-sage-800 mt-1.5 max-w-2xl text-sm">
          Cover Pass-Check runs this whole checklist against your finished file in seconds —
          full-cover size, bleed, safe zones, DPI, color space, and embedded fonts — and tells you
          exactly what to fix before KDP sees it.
        </p>
        <div className="mt-4">
          <PassCheckCta source="guide" size="lg" />
        </div>
      </div>

      <h2 className="mt-12 text-2xl">FAQ</h2>
      <dl className="mt-4 space-y-5">
        {guideFaqs.map((qa) => (
          <div key={qa.q}>
            <dt className="font-medium text-(--color-on-bg)">{qa.q}</dt>
            <dd className="text-sage-800 mt-1 text-sm">{qa.a}</dd>
          </div>
        ))}
      </dl>

      <p className="rounded-card bg-sage-50 text-sage-800 mt-12 border border-(--color-border) p-5 text-sm">
        Ready to compute your spine?{" "}
        <Link href="/" className="font-medium text-(--color-accent) hover:opacity-80">
          Open the calculator →
        </Link>
      </p>

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd(guideFaqs)) }}
      />
    </article>
  );
}
