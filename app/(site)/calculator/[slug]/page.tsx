import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { calcCover } from "@kdp/calc";
import { buildSlug, curatedPseoSlugs, parseSlug } from "@kdp/slug";
import { FORMAT_LABEL, isPageCountValid } from "@kdp/limits";
import { Calculator } from "@/components/calculator/Calculator";
import { breadcrumbJsonLd, howToJsonLd } from "@/lib/seo/jsonld";
import { ArrowRight } from "lucide-react";
import { siteConfig } from "@/lib/site-config";

type Params = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  return curatedPseoSlugs().map((slug) => ({ slug }));
}

export const dynamicParams = true;

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params;
  const parsed = parseSlug(slug);
  if (!parsed) return { title: "Not found" };
  const out = calcCover(parsed);
  const paperShort = parsed.paper.replace("color-", "");
  const trim = `${parsed.trimWidthIn}×${parsed.trimHeightIn}`;
  // Title leads with task intent ("KDP cover size") + the exact combo so it
  // matches pre-computation queries, and deliberately omits the spine number so
  // the SERP snippet can't fully answer the search (that would kill the click).
  const title = `KDP cover size: ${parsed.pageCount}-page ${trim} ${paperShort} ${parsed.format}`;
  // Description sells the click — live tool, safe-zone diagram, free template —
  // without handing over the dimensions.
  const description = `Get the exact spine width, full-cover dimensions, and a live safe-zone diagram for a ${parsed.pageCount}-page ${paperShort} ${parsed.format} at ${parsed.trimWidthIn} × ${parsed.trimHeightIn} in — plus a free print-ready KDP template. Calculate instantly, no login.`;
  return {
    title: title.slice(0, 60),
    description: description.slice(0, 158),
    alternates: { canonical: `/calculator/${slug}` },
    openGraph: {
      title,
      description,
      images: [
        `/api/og?f=${parsed.format}&p=${parsed.paper}&pg=${parsed.pageCount}&tw=${parsed.trimWidthIn}&th=${parsed.trimHeightIn}`,
      ],
    },
  };
}

export default async function PseoPage({ params }: Params) {
  const { slug } = await params;
  const parsed = parseSlug(slug);
  if (!parsed) notFound();

  const out = calcCover(parsed);
  const neighbors = neighborSlugs(parsed);

  const paperShort = parsed.paper.replace("color-", "");
  const trim = `${parsed.trimWidthIn}×${parsed.trimHeightIn}`;

  const breadcrumb = breadcrumbJsonLd([
    { name: "KDP cover calculator", url: `${siteConfig.url}/` },
    { name: FORMAT_LABEL[parsed.format], url: `${siteConfig.url}/` },
    { name: `${parsed.pageCount} pages`, url: `${siteConfig.url}/calculator/${slug}` },
  ]);

  const howTo = howToJsonLd({
    name: `Calculate the cover dimensions for a ${parsed.pageCount}-page ${parsed.paper} ${parsed.format}`,
    description: `Use the KDP spine multiplier to compute the spine width and full cover for a ${parsed.format} at ${parsed.trimWidthIn}×${parsed.trimHeightIn} in.`,
    steps: [
      {
        name: "Multiply page count by paper multiplier",
        text: `${parsed.pageCount} × ${parsed.format === "paperback" && parsed.paper === "white" ? "0.002252" : parsed.format === "paperback" && parsed.paper === "cream" ? "0.0025" : parsed.format === "paperback" && parsed.paper === "color-standard" ? "0.002252" : "0.002347"} = ${out.spineWidthIn.toFixed(4)} in`,
      },
      {
        name: "Add bleed and trim widths to get full cover width",
        text:
          parsed.format === "paperback"
            ? `(2 × ${parsed.trimWidthIn}) + ${out.spineWidthIn.toFixed(4)} + (2 × 0.125) = ${out.fullCoverWidthIn.toFixed(4)} in`
            : `(2 × ${parsed.trimWidthIn}) + ${out.spineWidthIn.toFixed(4)} + (2 × 0.4 hinge) + (2 × 0.51 wrap) = ${out.fullCoverWidthIn.toFixed(4)} in`,
      },
      {
        name: "Add bleed/wrap to trim height for full cover height",
        text:
          parsed.format === "paperback"
            ? `${parsed.trimHeightIn} + (2 × 0.125) = ${out.fullCoverHeightIn.toFixed(4)} in`
            : `${parsed.trimHeightIn} + (2 × 0.51 wrap) = ${out.fullCoverHeightIn.toFixed(4)} in`,
      },
    ],
  });

  return (
    <section className="mx-auto max-w-6xl px-4 py-10 sm:px-6 sm:py-14">
      <nav aria-label="Breadcrumb" className="text-xs text-sage-700">
        <Link href="/" className="hover:text-(--color-accent)">
          KDP cover calculator
        </Link>
        <span className="mx-1">›</span>
        <span>{FORMAT_LABEL[parsed.format]}</span>
        <span className="mx-1">›</span>
        <span>{parsed.pageCount} pages</span>
      </nav>

      <h1 className="mt-3 text-3xl leading-tight sm:text-4xl">
        KDP cover size for a {parsed.pageCount}-page {trim} {paperShort} {parsed.format}
      </h1>
      <p className="mt-3 max-w-2xl text-sage-800">
        Enter your details below and this free <strong>KDP cover calculator</strong> returns the
        exact spine width, full-cover dimensions, and a safe-zone diagram for a {parsed.pageCount}
        -page {parsed.trimWidthIn} × {parsed.trimHeightIn} in {paperShort} {parsed.format} — then
        download a print-ready template. Adjust any field to recompute live, or use it as a{" "}
        {parsed.format} spine-width calculator for any page count.
      </p>

      <div className="mt-8">
        <Calculator initial={parsed} />
      </div>

      <section className="mt-10">
        <PseoPassCheckCta spineWidthIn={out.spineWidthIn} />
      </section>

      <section className="mt-12">
        <h2 className="mb-3 text-xl">Try a similar page count</h2>
        <p className="mb-4 text-sm text-sage-700">
          Same format, paper, and trim — different page count. Each link is its own pre-computed
          page.
        </p>
        <div className="flex flex-wrap gap-2 text-sm">
          {neighbors.map((n) => (
            <Link
              key={n.slug}
              href={`/calculator/${n.slug}`}
              className="rounded-md border border-(--color-border) bg-(--color-surface) px-3 py-1.5 text-sage-800 hover:border-(--color-accent)"
            >
              {n.label}
            </Link>
          ))}
        </div>
      </section>

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumb) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(howTo) }}
      />
    </section>
  );
}

function PseoPassCheckCta({ spineWidthIn }: { spineWidthIn: number }) {
  return (
    <div className="rounded-card border border-warm-300 bg-gradient-to-br from-warm-50 to-(--color-surface) p-5 sm:p-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="max-w-md">
          <p className="text-xs uppercase tracking-wide text-warm-700">Before you upload</p>
          <h3 className="mt-1 text-lg font-display sm:text-xl">
            Finished your cover? Pass-check it against this exact {spineWidthIn.toFixed(4)}″-spine
            spec
          </h3>
          <p className="mt-1.5 text-sm text-sage-800">
            Cover Pass-Check reads your finished file and flags wrong size, missing bleed, low DPI,
            and unembedded fonts before KDP rejects it.
          </p>
        </div>
        <Link
          href={siteConfig.features.preflight.landing}
          className="inline-flex items-center gap-2 rounded-md bg-(--color-on-bg) px-4 py-2.5 text-sm font-medium text-(--color-on-accent) shadow-sm hover:bg-(--color-accent)"
        >
          Check my cover
          <ArrowRight className="h-4 w-4" aria-hidden />
        </Link>
      </div>
    </div>
  );
}

function neighborSlugs(parsed: NonNullable<ReturnType<typeof parseSlug>>) {
  const out: { slug: string; label: string }[] = [];
  for (const delta of [-50, -10, -1, 1, 10, 50]) {
    const pages = parsed.pageCount + delta;
    if (!isPageCountValid(parsed.format, pages)) continue;
    out.push({
      slug: buildSlug({ ...parsed, pageCount: pages }),
      label: `${pages} pages`,
    });
  }
  return out;
}
