import type { Metadata } from "next";
import Link from "next/link";
import { calcCover, type Format, type Paper } from "@kdp/calc";
import { buildSlug } from "@kdp/slug";
import {
  PAPERBACK_TRIMS,
  HARDCOVER_TRIMS,
  PAPER_LABEL,
  FORMAT_LABEL,
  type TrimSize,
} from "@kdp/limits";
import { breadcrumbJsonLd } from "@/lib/seo/jsonld";
import { PassCheckCta } from "@/components/preflight/PassCheckCta";
import { RecommendedTools } from "@/components/site/RecommendedTools";
import { siteConfig } from "@/lib/site-config";

export const metadata: Metadata = {
  title: "KDP cover sizes — every trim, paper & page count",
  description:
    "Browse pre-computed KDP cover and spine-width pages for every common Amazon paperback and hardcover trim, paper type, and page count. Jump straight to your exact spec.",
  alternates: { canonical: "/calculator" },
  openGraph: {
    title: "KDP cover sizes — every trim, paper & page count",
    description:
      "Pre-computed spine width and full-cover dimensions for every common KDP paperback and hardcover trim, paper, and page count.",
  },
};

// Same trim selection that drives curatedPseoSlugs() — keep in sync so every
// link below points at an indexed (not noindexed) page.
const PAPERBACK_TRIM_SLUGS = ["5x8", "5.5x8.5", "6x9", "7x10", "8.5x11"];
const HARDCOVER_TRIM_SLUGS = ["5.5x8.5", "6x9", "7x10", "8.25x11", "8.5x11"];

// Representative page-count spread per format — all values sit on the curated
// grid so the targets are indexable.
const PAGE_SPREAD: Record<Format, number[]> = {
  paperback: [60, 100, 200, 300, 500],
  hardcover: [100, 200, 300, 400, 500],
};
const PAPER_AT = 200; // representative page count for the paper-variant links
const PAPERS: Paper[] = ["white", "cream", "color-standard", "color-premium"];

const SECTIONS = (["paperback", "hardcover"] as const).map((format) => {
  const all = format === "paperback" ? PAPERBACK_TRIMS : HARDCOVER_TRIMS;
  const wanted = format === "paperback" ? PAPERBACK_TRIM_SLUGS : HARDCOVER_TRIM_SLUGS;
  const trims = wanted
    .map((slug) => all.find((t) => t.slug === slug))
    .filter((t): t is TrimSize => Boolean(t));
  return { format, trims };
});

function pageLink(format: Format, paper: Paper, trim: TrimSize, pageCount: number) {
  const slug = buildSlug({
    format,
    paper,
    pageCount,
    trimWidthIn: trim.widthIn,
    trimHeightIn: trim.heightIn,
  });
  const spine = calcCover({
    format,
    paper,
    pageCount,
    trimWidthIn: trim.widthIn,
    trimHeightIn: trim.heightIn,
  }).spineWidthIn;
  return { slug, spine };
}

export default function CalculatorIndexPage() {
  const breadcrumb = breadcrumbJsonLd([
    { name: "KDP cover calculator", url: `${siteConfig.url}/` },
    { name: "All sizes", url: `${siteConfig.url}/calculator` },
  ]);

  return (
    <section className="mx-auto max-w-5xl px-4 py-10 sm:px-6 sm:py-14">
      <nav aria-label="Breadcrumb" className="text-xs text-sage-700">
        <Link href="/" className="hover:text-(--color-accent)">
          KDP cover calculator
        </Link>
        <span className="mx-1">›</span>
        <span>All sizes</span>
      </nav>

      <h1 className="mt-3 text-3xl leading-tight sm:text-4xl">
        KDP cover sizes — every trim, paper &amp; page count
      </h1>
      <p className="mt-3 max-w-2xl text-sage-800">
        Every common Amazon KDP paperback and case-laminate hardcover spec has its own pre-computed
        page with the exact spine width, full-cover dimensions, a safe-zone diagram, and a
        print-ready template. Pick the closest match below, or{" "}
        <Link href="/" className="underline hover:text-(--color-accent)">
          start from the live calculator
        </Link>{" "}
        and enter any page count.
      </p>

      {SECTIONS.map(({ format, trims }) => (
        <div key={format} className="mt-12">
          <h2 className="text-2xl">{FORMAT_LABEL[format]} cover sizes</h2>
          <div className="mt-4 space-y-6">
            {trims.map((trim) => (
              <div key={trim.slug} className="rounded-card border border-sage-200 bg-white p-4 sm:p-5">
                <h3 className="font-display text-lg">
                  {trim.label} {FORMAT_LABEL[format].toLowerCase()}
                </h3>

                <p className="mt-2 text-xs uppercase tracking-wide text-sage-700">By page count</p>
                <div className="mt-1.5 flex flex-wrap gap-2 text-sm">
                  {PAGE_SPREAD[format].map((pages) => {
                    const { slug, spine } = pageLink(format, "white", trim, pages);
                    return (
                      <Link
                        key={slug}
                        href={`/calculator/${slug}`}
                        className="rounded-md border border-(--color-border) bg-(--color-surface) px-3 py-1.5 text-sage-800 hover:border-(--color-accent)"
                      >
                        {pages}p · {spine.toFixed(3)}″ spine
                      </Link>
                    );
                  })}
                </div>

                <p className="mt-4 text-xs uppercase tracking-wide text-sage-700">
                  By paper (at {PAPER_AT} pages)
                </p>
                <div className="mt-1.5 flex flex-wrap gap-2 text-sm">
                  {PAPERS.map((paper) => {
                    const { slug } = pageLink(format, paper, trim, PAPER_AT);
                    return (
                      <Link
                        key={slug}
                        href={`/calculator/${slug}`}
                        className="rounded-md border border-(--color-border) bg-(--color-surface) px-3 py-1.5 text-sage-800 hover:border-(--color-accent)"
                      >
                        {PAPER_LABEL[paper]}
                      </Link>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}

      <section className="mt-14">
        <div className="rounded-card border border-warm-300 bg-gradient-to-br from-warm-50 to-(--color-surface) p-5 sm:p-6">
          <h2 className="text-lg font-display sm:text-xl">Finished your cover?</h2>
          <p className="mt-1.5 max-w-2xl text-sm text-sage-800">
            Cover Pass-Check reads your finished file and flags wrong size, missing bleed, low DPI,
            RGB color, and unembedded fonts — before KDP rejects it.
          </p>
          <div className="mt-4">
            <PassCheckCta source="calculator-index" />
          </div>
        </div>
      </section>

      <section className="mt-12">
        <RecommendedTools source="calculator-index" />
      </section>

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumb) }}
      />
    </section>
  );
}
