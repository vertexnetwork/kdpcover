import type { Metadata } from "next";
import Link from "next/link";
import { Calculator } from "@/components/calculator/Calculator";
import { siteFacts } from "@/lib/content/site-facts";
import {
  faqJsonLd,
  softwareAppJsonLd,
  organizationJsonLd,
  websiteJsonLd,
  howToJsonLd,
} from "@/lib/seo/jsonld";
import { MultiplierTable } from "@/components/site/MultiplierTable";
import { ProofStrip } from "@/components/site/ProofStrip";
import { EmailCaptureForm } from "@/components/email/EmailCaptureForm";
import { PassCheckCta } from "@/components/preflight/PassCheckCta";
import { RecommendedTools } from "@/components/site/RecommendedTools";
import { siteConfig } from "@/lib/site-config";
import { calcCover, type CoverInput } from "@kdp/calc";
import { buildSlug } from "@kdp/slug";
import { ShieldCheck, ArrowRight } from "lucide-react";

export const metadata: Metadata = {
  title: {
    absolute: "Free KDP Cover Calculator — Spine Width & Cover Size",
  },
  description:
    "Free KDP cover size calculator — exact spine width, full-cover dimensions, bleed and a print-ready template for Amazon paperback & hardcover. No login.",
  alternates: { canonical: "/" },
  openGraph: {
    title: "Free KDP Cover Calculator — Spine Width & Cover Size",
    description:
      "Calculate exact KDP spine width, full-cover dimensions, and bleed for Amazon paperback and hardcover books. Verified against KDP's official template.",
    url: siteConfig.url,
  },
};

/** Worked examples — computed at build from the same engine the tool uses. */
const EXAMPLES: { label: string; book: string; input: CoverInput }[] = [
  {
    label: "Novel — 6 × 9 paperback, 300 pages, white",
    book: "novel",
    input: { format: "paperback", paper: "white", pageCount: 300, trimWidthIn: 6, trimHeightIn: 9 },
  },
  {
    label: "Pocket fiction — 5 × 8 paperback, 250 pages, cream",
    book: "pocket",
    input: { format: "paperback", paper: "cream", pageCount: 250, trimWidthIn: 5, trimHeightIn: 8 },
  },
  {
    label: "Workbook — 8.5 × 11 paperback, 120 pages, white",
    book: "workbook",
    input: { format: "paperback", paper: "white", pageCount: 120, trimWidthIn: 8.5, trimHeightIn: 11 },
  },
  {
    label: "Nonfiction hardcover — 6 × 9, 240 pages",
    book: "hardcover",
    input: { format: "hardcover", paper: "white", pageCount: 240, trimWidthIn: 6, trimHeightIn: 9 },
  },
];

const BOOK_TYPES = [
  {
    title: "Novels & fiction",
    body: "Most trade fiction is 5 × 8 or 6 × 9 in on cream or white paper. Spine width scales with page count, so a 280-page novel and a 420-page novel need different covers.",
    slug: buildSlug({ format: "paperback", paper: "cream", pageCount: 320, trimWidthIn: 6, trimHeightIn: 9 }),
    cta: "320-page 6 × 9 cream paperback",
  },
  {
    title: "Workbooks & journals",
    body: "Letter-size 8.5 × 11 in is standard for workbooks, planners, and logbooks. The wide trim plus bleed makes the full cover noticeably larger than a novel's.",
    slug: buildSlug({ format: "paperback", paper: "white", pageCount: 120, trimWidthIn: 8.5, trimHeightIn: 11 }),
    cta: "120-page 8.5 × 11 workbook",
  },
  {
    title: "Color & illustrated books",
    body: "Premium-color interiors use a thicker 0.002347 in/page multiplier, so an illustrated 7 × 10 in book has a wider spine than a B&W book of the same length.",
    slug: buildSlug({ format: "paperback", paper: "color-premium", pageCount: 100, trimWidthIn: 7, trimHeightIn: 10 }),
    cta: "100-page 7 × 10 premium-color book",
  },
  {
    title: "Case-laminate hardcover",
    body: "Hardcover adds a 0.4 in hinge each side of the spine and a 0.51 in wrap on every edge — a different geometry from paperback bleed entirely.",
    slug: buildSlug({ format: "hardcover", paper: "white", pageCount: 240, trimWidthIn: 6, trimHeightIn: 9 }),
    cta: "240-page 6 × 9 hardcover",
  },
];

/** Representative spoke pages — wires the hub into the pSEO cluster for crawl. */
const POPULAR = [
  { pages: 100, trim: [6, 9] as const, paper: "white" as const, format: "paperback" as const },
  { pages: 200, trim: [6, 9] as const, paper: "white" as const, format: "paperback" as const },
  { pages: 300, trim: [6, 9] as const, paper: "white" as const, format: "paperback" as const },
  { pages: 400, trim: [6, 9] as const, paper: "cream" as const, format: "paperback" as const },
  { pages: 150, trim: [5.5, 8.5] as const, paper: "cream" as const, format: "paperback" as const },
  { pages: 250, trim: [5, 8] as const, paper: "cream" as const, format: "paperback" as const },
  { pages: 120, trim: [8.5, 11] as const, paper: "white" as const, format: "paperback" as const },
  { pages: 200, trim: [7, 10] as const, paper: "color-premium" as const, format: "paperback" as const },
  { pages: 100, trim: [6, 9] as const, paper: "white" as const, format: "hardcover" as const },
  { pages: 240, trim: [6, 9] as const, paper: "white" as const, format: "hardcover" as const },
  { pages: 320, trim: [7, 10] as const, paper: "white" as const, format: "hardcover" as const },
  { pages: 200, trim: [8.5, 11] as const, paper: "white" as const, format: "hardcover" as const },
].map((p) => ({
  slug: buildSlug({
    format: p.format,
    paper: p.paper,
    pageCount: p.pages,
    trimWidthIn: p.trim[0],
    trimHeightIn: p.trim[1],
  }),
  label: `${p.format === "hardcover" ? "Hardcover" : "Paperback"} · ${p.pages}p · ${p.trim[0]} × ${p.trim[1]}`,
}));

export default function HomePage() {
  return (
    <>
      <section className="mx-auto max-w-6xl px-4 pb-12 pt-6 sm:px-6 sm:pt-12">
        <div className="mb-5 max-w-2xl sm:mb-8">
          <h1 className="text-3xl leading-tight sm:text-5xl">Free KDP Cover Calculator</h1>
          <p className="mt-3 text-base text-sage-800 sm:text-lg">
            Calculate the exact <strong>spine width</strong>, full-cover dimensions, bleed, and
            safe-zone diagram for any Amazon KDP paperback or case-laminate hardcover — instant,
            in-browser, and verified against KDP&rsquo;s official cover-template generator.{" "}
            {siteConfig.tagline}
          </p>
          <p className="mt-3 inline-flex items-center gap-1.5 rounded-full border border-sage-200 bg-sage-50 px-2.5 py-1 text-xs text-sage-800">
            <ShieldCheck className="h-3.5 w-3.5 text-sage-600" aria-hidden />
            Multipliers verified against KDP&rsquo;s official template generator
          </p>
        </div>

        <Calculator />

        <ProofStrip />
      </section>

      <section className="mx-auto max-w-6xl px-4 pb-8 sm:px-6">
        <div className="flex flex-wrap items-center justify-between gap-4 rounded-card border border-warm-300 bg-gradient-to-br from-warm-50 to-white p-5 sm:p-6">
          <div className="max-w-xl">
            <p className="inline-flex items-center gap-1.5 text-xs uppercase tracking-wide text-warm-700">
              <ShieldCheck className="h-3.5 w-3.5" aria-hidden />
              Before you upload
            </p>
            <h2 className="mt-1 font-display text-xl sm:text-2xl">
              Will your finished cover pass KDP review?
            </h2>
            <p className="mt-1.5 text-sm text-sage-800">
              The calculator gives you the dimensions. <strong>Cover Pass-Check</strong> reads your
              finished file and flags wrong size, missing bleed, low DPI, RGB color, and unembedded
              fonts — before KDP rejects it.
            </p>
          </div>
          <PassCheckCta source="home" size="lg" />
        </div>
      </section>

      <section className="mx-auto max-w-3xl px-4 pb-16 sm:px-6">
        <MultiplierTable />

        <h2 className="mb-3 mt-12 text-2xl">Worked KDP cover size examples</h2>
        <p className="mb-4 text-sm text-sage-800">
          Computed by the same formula engine that powers the calculator above. Each row links to a
          full page for that exact specification.
        </p>
        <div className="overflow-x-auto rounded-card border border-sage-200 bg-white">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs uppercase tracking-wide text-sage-700">
                <th className="px-4 py-2 font-medium">Specification</th>
                <th className="px-4 py-2 text-right font-medium">Spine</th>
                <th className="px-4 py-2 text-right font-medium">Full cover (in)</th>
              </tr>
            </thead>
            <tbody className="tabular">
              {EXAMPLES.map((ex, i) => {
                const out = calcCover(ex.input);
                const slug = buildSlug(ex.input);
                return (
                  <tr key={ex.book} className={i % 2 === 0 ? "bg-sage-50/40" : ""}>
                    <td className="px-4 py-2">
                      <Link
                        href={`/calculator/${slug}`}
                        className="text-sage-800 underline decoration-sage-300 underline-offset-2 hover:text-(--color-accent)"
                      >
                        {ex.label}
                      </Link>
                    </td>
                    <td className="px-4 py-2 text-right">{out.spineWidthIn.toFixed(4)}″</td>
                    <td className="px-4 py-2 text-right">
                      {out.fullCoverWidthIn.toFixed(4)} × {out.fullCoverHeightIn.toFixed(4)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <h2 className="mb-3 mt-12 text-2xl">Cover dimensions by book type</h2>
        <p className="mb-4 text-sm text-sage-800">
          The right cover size depends on what you&rsquo;re publishing. Pick the closest match for a
          pre-filled calculation.
        </p>
        <div className="grid gap-3 sm:grid-cols-2">
          {BOOK_TYPES.map((b) => (
            <div
              key={b.title}
              className="rounded-card border border-sage-200 bg-white p-4"
            >
              <h3 className="font-display text-lg">{b.title}</h3>
              <p className="mt-1 text-sm text-sage-800">{b.body}</p>
              <Link
                href={`/calculator/${b.slug}`}
                className="mt-2 inline-flex items-center gap-1.5 text-sm text-(--color-accent) hover:underline"
              >
                {b.cta}
                <ArrowRight className="h-3.5 w-3.5" aria-hidden />
              </Link>
            </div>
          ))}
        </div>

        <h2 className="mb-3 mt-12 text-2xl">Popular spine-width calculations</h2>
        <p className="mb-4 text-sm text-sage-800">
          Every page count and trim combination has its own pre-computed page with the full cover
          spec, diagram, and template.
        </p>
        <div className="flex flex-wrap gap-2 text-sm">
          {POPULAR.map((p) => (
            <Link
              key={p.slug}
              href={`/calculator/${p.slug}`}
              className="rounded-md border border-(--color-border) bg-(--color-surface) px-3 py-1.5 text-sage-800 hover:border-(--color-accent)"
            >
              {p.label}
            </Link>
          ))}
        </div>

        <h2 className="mb-4 mt-12 text-2xl">Frequently asked</h2>
        <dl id="faq" className="space-y-6">
          {siteFacts.faq.map((qa) => (
            <div key={qa.q}>
              <dt className="font-medium text-(--color-on-bg)">{qa.q}</dt>
              <dd className="mt-1 text-sm text-sage-800">{qa.a}</dd>
            </div>
          ))}
        </dl>

        <p className="mt-8 text-sm text-sage-700">
          More on where the multipliers come from and the sources behind every number:{" "}
          <Link href="/about" className="underline hover:text-(--color-accent)">
            methodology &amp; sources
          </Link>
          .
        </p>

        <RecommendedTools source="home" className="mt-12" />

        <EmailCaptureForm source="calculator" className="mt-12" />
      </section>

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteJsonLd()) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(softwareAppJsonLd()) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(faqJsonLd(siteFacts.faq, ["#faq dt", "#faq dd"])),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd()) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(
            howToJsonLd({
              name: "How to calculate a KDP book cover size",
              description:
                "Compute the exact spine width and full-cover dimensions for an Amazon KDP paperback or hardcover book.",
              steps: [
                {
                  name: "Choose format and paper",
                  text: "Select paperback or case-laminate hardcover, then the paper type (white, cream, standard or premium color).",
                },
                {
                  name: "Set trim size and page count",
                  text: "Pick your book's trim size and enter the interior page count.",
                },
                {
                  name: "Read the spine and full-cover dimensions",
                  text: "The calculator multiplies page count by the KDP paper multiplier and adds bleed, hinge, and wrap to give the print-ready cover size.",
                },
              ],
            }),
          ),
        }}
      />
    </>
  );
}
