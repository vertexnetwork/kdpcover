import type { Metadata } from "next";
import Link from "next/link";
import { ShieldCheck, Lock, FileCheck2, BookOpen, CheckCircle2 } from "lucide-react";
import { calcCover, type CoverInput } from "@kdp/calc";
import { evaluatePreflight } from "@/lib/preflight/evaluate";
import type { FileAnalysis } from "@/lib/preflight/types";
import { ReportCard } from "@/components/preflight/ReportCard";
import { PassCheckCta } from "@/components/preflight/PassCheckCta";
import { siteFacts } from "@/lib/content/site-facts";
import { siteConfig } from "@/lib/site-config";
import { passCheckJsonLd, faqJsonLd, breadcrumbJsonLd } from "@/lib/seo/jsonld";

const pf = siteFacts.preflight;

export const metadata: Metadata = {
  title: "Cover Pass-Check — will KDP reject your cover? Check before you upload",
  description:
    "Upload your finished KDP cover and get an instant pass/fail report — full-cover size, bleed, resolution, embedded fonts, and color space checked against KDP's spec and your exact book. Runs in your browser; never uploaded.",
  alternates: { canonical: "/cover-pass-check" },
  openGraph: {
    title: "Cover Pass-Check — pass KDP review on the first try",
    description:
      "Instant pass/fail check for your finished KDP cover file: size, bleed, DPI, fonts, color. In your browser, never uploaded.",
    url: `${siteConfig.url}/cover-pass-check`,
  },
};

// Static sample report — a common rejection (trim-sized RGB file with an
// unembedded font) for a 6×9 300-page paperback. Shows what the tool catches.
const SAMPLE_INPUT: CoverInput = {
  format: "paperback",
  paper: "white",
  pageCount: 300,
  trimWidthIn: 6,
  trimHeightIn: 9,
};
const SAMPLE_ANALYSIS: FileAnalysis = {
  kind: "pdf",
  byteSize: 9_400_000,
  pageCount: 1,
  widthIn: 12.6756, // trim-only — missing bleed
  heightIn: 9.0,
  colorSpace: "rgb",
  hasTransparency: false,
  hasRasterImages: false,
  fonts: [{ name: "Helvetica", embedded: false }],
};
const SAMPLE_REPORT = evaluatePreflight(SAMPLE_ANALYSIS, calcCover(SAMPLE_INPUT), SAMPLE_INPUT);

const STEPS = [
  { icon: BookOpen, title: "Set your book", body: "Pick format, trim, paper, and page count — the same inputs as the free calculator." },
  { icon: FileCheck2, title: "Drop your cover", body: "PDF, PNG, or JPG. It's read in your browser and never uploaded." },
  { icon: ShieldCheck, title: "Get the verdict", body: "A pass/fail report with the exact fix for anything KDP would reject." },
];

export default function CoverPassCheckPage() {
  const unlockHref = siteConfig.features.preflight.enabled
    ? `${siteConfig.features.preflight.route}/unlock`
    : undefined;

  return (
    <article className="mx-auto max-w-5xl px-4 py-10 sm:px-6 sm:py-14">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(passCheckJsonLd()) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd(pf.faq)) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(
            breadcrumbJsonLd([
              { name: "Home", url: siteConfig.url },
              { name: "Cover Pass-Check", url: `${siteConfig.url}/cover-pass-check` },
            ]),
          ),
        }}
      />

      {/* Hero */}
      <section className="max-w-2xl">
        <p className="text-xs uppercase tracking-wide text-(--color-accent)">Cover Pass-Check</p>
        <h1 className="mt-2 text-3xl leading-tight sm:text-5xl">
          Will KDP reject your cover? Check before you upload.
        </h1>
        <p className="mt-4 text-base text-sage-800 sm:text-lg">{pf.tagline}</p>
        <div className="mt-6 flex flex-wrap items-center gap-3">
          <PassCheckCta source="landing" size="lg" />
          <Link href="/" className="text-sm text-(--color-accent) hover:opacity-80">
            Try the free calculator first
          </Link>
        </div>
        {unlockHref && (
          <p className="mt-3 text-xs text-sage-700">
            Already purchased?{" "}
            <Link href={unlockHref} className="text-(--color-accent) underline hover:opacity-80">
              Unlock with your license key →
            </Link>
          </p>
        )}
        <p className="mt-3 inline-flex items-center gap-1.5 text-xs text-sage-700">
          <Lock className="h-3 w-3" aria-hidden /> Checked in your browser — your file is never
          uploaded.
        </p>
      </section>

      {/* How it works */}
      <section className="mt-14">
        <div className="grid gap-4 sm:grid-cols-3">
          {STEPS.map((s) => (
            <div key={s.title} className="rounded-card border border-sage-200 bg-white p-5">
              <s.icon className="h-6 w-6 text-sage-600" aria-hidden />
              <h2 className="mt-3 font-display text-lg">{s.title}</h2>
              <p className="mt-1 text-sm text-sage-800">{s.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Sample report */}
      <section className="mt-14 grid gap-8 lg:grid-cols-[1fr_1.1fr] lg:items-start">
        <div>
          <h2 className="text-2xl">Catches what gets covers rejected</h2>
          <p className="mt-3 text-sage-800">
            The most common KDP rejections are wrong full-cover size, missing bleed, low resolution,
            and fonts that aren&rsquo;t embedded. Pass-Check measures every one against your exact
            book and tells you how to fix it — here&rsquo;s a real report on a trim-sized file:
          </p>
          <ul className="mt-5 space-y-2">
            {pf.checks.map((c) => (
              <li key={c} className="flex items-start gap-2 text-sm text-sage-800">
                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-sage-600" aria-hidden />
                {c}
              </li>
            ))}
          </ul>
        </div>
        <ReportCard report={SAMPLE_REPORT} fileName="my-cover-6x9-300p.pdf (sample)" />
      </section>

      {/* Tiers */}
      <section className="mt-16">
        <h2 className="text-2xl">One purchase. Two ways to work.</h2>
        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          {pf.tiers.map((t) => {
            const price = t.id === "studio" ? siteConfig.monetization.gumroad.studioPrice : siteConfig.monetization.gumroad.price;
            return (
              <div key={t.id} className="flex flex-col rounded-card border border-sage-200 bg-white p-6">
                <div className="flex items-baseline justify-between">
                  <h3 className="font-display text-xl">{t.name}</h3>
                  <span className="font-display text-2xl">${price}</span>
                </div>
                <p className="mt-1 text-sm text-sage-800">{t.blurb}</p>
                <ul className="mt-4 flex-1 space-y-2">
                  {t.features.map((f) => (
                    <li key={f} className="flex items-start gap-2 text-sm text-sage-800">
                      <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-sage-600" aria-hidden />
                      {f}
                    </li>
                  ))}
                </ul>
                <div className="mt-5">
                  <PassCheckCta source="landing" tier={t.id as "author" | "studio"} />
                </div>
              </div>
            );
          })}
        </div>
        <p className="mt-3 text-center text-xs text-sage-700">
          7-day no-questions refund · secure checkout via Gumroad · {siteConfig.trademarkDisclaimer}
        </p>
      </section>

      {/* FAQ */}
      <section className="mt-16 max-w-3xl">
        <h2 className="text-2xl">Frequently asked</h2>
        <dl className="mt-4 space-y-6">
          {pf.faq.map((qa) => (
            <div key={qa.q}>
              <dt className="font-medium text-ink">{qa.q}</dt>
              <dd className="mt-1 text-sm text-sage-800">{qa.a}</dd>
            </div>
          ))}
        </dl>
      </section>
    </article>
  );
}
