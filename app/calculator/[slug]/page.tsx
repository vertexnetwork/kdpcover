import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { calcCover } from "@kdp/calc";
import { buildSlug, curatedPseoSlugs, parseSlug } from "@kdp/slug";
import { FORMAT_LABEL, PAPER_LABEL, isPageCountValid, pageCountBounds } from "@kdp/limits";
import { encodeState } from "@kdp/share";
import { CoverDiagram } from "@/components/calculator/CoverDiagram";
import { breadcrumbJsonLd, howToJsonLd } from "@/lib/seo/jsonld";

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
  const title = `${FORMAT_LABEL[parsed.format]} ${PAPER_LABEL[parsed.paper]} ${parsed.pageCount}-page spine width — ${out.spineWidthIn.toFixed(4)}″`;
  const description = `Computed KDP cover dimensions for a ${parsed.pageCount}-page ${parsed.paper.replace("color-", "")} ${parsed.format} at ${parsed.trimWidthIn} × ${parsed.trimHeightIn} in: spine ${out.spineWidthIn.toFixed(4)}″, full cover ${out.fullCoverWidthIn.toFixed(2)} × ${out.fullCoverHeightIn.toFixed(2)} in.`;
  return {
    title,
    description,
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

  const breadcrumb = breadcrumbJsonLd([
    { name: "Calculator", url: "https://kdpcover.pro/" },
    { name: FORMAT_LABEL[parsed.format], url: `https://kdpcover.pro/` },
    { name: `${parsed.pageCount} pages`, url: `https://kdpcover.pro/calculator/${slug}` },
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
    <article className="mx-auto max-w-3xl px-4 py-10 sm:px-6 sm:py-14">
      <nav aria-label="Breadcrumb" className="text-xs text-sage-700">
        <Link href="/" className="hover:text-warm-500">Calculator</Link>
        <span className="mx-1">›</span>
        <span>{FORMAT_LABEL[parsed.format]}</span>
        <span className="mx-1">›</span>
        <span>{parsed.pageCount} pages</span>
      </nav>

      <h1 className="mt-3 text-3xl leading-tight sm:text-4xl">
        {FORMAT_LABEL[parsed.format]} · {PAPER_LABEL[parsed.paper]} · {parsed.pageCount} pages — spine {out.spineWidthIn.toFixed(4)}″
      </h1>
      <p className="mt-3 text-sage-800">
        For a {parsed.trimWidthIn} × {parsed.trimHeightIn} in {parsed.format} with {PAPER_LABEL[parsed.paper].toLowerCase()} interior pages, the KDP-spec cover is {out.fullCoverWidthIn.toFixed(4)} × {out.fullCoverHeightIn.toFixed(4)} in (spine {out.spineWidthIn.toFixed(4)}″ / {out.spineWidthMm.toFixed(2)} mm).
      </p>

      <div className="mt-6 rounded-card border border-sage-200 bg-white p-5 sm:p-6">
        <table className="w-full text-sm">
          <tbody className="tabular">
            <tr>
              <td className="py-1.5 text-sage-700">Spine width</td>
              <td className="py-1.5 text-right font-medium">{out.spineWidthIn.toFixed(4)} in · {out.spineWidthMm.toFixed(2)} mm</td>
            </tr>
            <tr>
              <td className="py-1.5 text-sage-700">Full cover width</td>
              <td className="py-1.5 text-right font-medium">{out.fullCoverWidthIn.toFixed(4)} in · {out.fullCoverWidthMm.toFixed(2)} mm</td>
            </tr>
            <tr>
              <td className="py-1.5 text-sage-700">Full cover height</td>
              <td className="py-1.5 text-right font-medium">{out.fullCoverHeightIn.toFixed(4)} in · {out.fullCoverHeightMm.toFixed(2)} mm</td>
            </tr>
            <tr>
              <td className="py-1.5 text-sage-700">Spine text</td>
              <td className="py-1.5 text-right font-medium">{out.spineTextEligible ? "Eligible" : "Too narrow (<79 pages)"}</td>
            </tr>
          </tbody>
        </table>
        <CoverDiagram input={parsed} output={out} className="mt-5" />
      </div>

      <section className="mt-8">
        <h2 className="mb-3 text-xl">Try other sizes</h2>
        <div className="flex flex-wrap gap-2 text-sm">
          {neighbors.map((n) => (
            <Link
              key={n.slug}
              href={`/calculator/${n.slug}`}
              className="rounded-md border border-sage-200 bg-white px-2.5 py-1 text-sage-800 hover:border-warm-400"
            >
              {n.label}
            </Link>
          ))}
        </div>
      </section>

      <p className="mt-8 text-xs text-sage-700">
        Need a different config?{" "}
        <Link href={`/#s=${encodeState(parsed)}`} className="underline hover:text-warm-500">
          Open the live calculator →
        </Link>
      </p>

      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumb) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(howTo) }} />
    </article>
  );
}

function neighborSlugs(parsed: ReturnType<typeof parseSlug> & object) {
  if (!parsed) return [];
  const out: { slug: string; label: string }[] = [];
  const bounds = pageCountBounds(parsed.format);
  for (const delta of [-50, -10, -1, 1, 10, 50]) {
    const pages = parsed.pageCount + delta;
    if (!isPageCountValid(parsed.format, pages)) continue;
    out.push({
      slug: buildSlug({ ...parsed, pageCount: pages }),
      label: `${pages} pages`,
    });
    void bounds;
  }
  return out;
}
