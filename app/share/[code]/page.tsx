import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { decodeState } from "@kdp/share";
import { calcCover } from "@kdp/calc";
import { CoverDiagram } from "@/components/calculator/CoverDiagram";
import { FORMAT_LABEL, PAPER_LABEL } from "@kdp/limits";

type Params = { params: Promise<{ code: string }> };

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { code } = await params;
  const state = decodeState(code);
  if (!state) return { title: "Share link", robots: { index: false } };
  const out = calcCover(state);
  const title = `${FORMAT_LABEL[state.format]} · ${state.pageCount}pp · spine ${out.spineWidthIn.toFixed(4)}″`;
  const og = `/api/og?f=${state.format}&p=${state.paper}&pg=${state.pageCount}&tw=${state.trimWidthIn}&th=${state.trimHeightIn}`;
  return {
    title,
    description: `KDP cover spec — spine ${out.spineWidthIn.toFixed(4)}″ (${out.spineWidthMm.toFixed(2)} mm), full cover ${out.fullCoverWidthIn.toFixed(4)} × ${out.fullCoverHeightIn.toFixed(4)} in.`,
    robots: { index: false, follow: true },
    openGraph: { images: [og], title, type: "website" },
  };
}

export default async function SharePage({ params }: Params) {
  const { code } = await params;
  const state = decodeState(code);
  if (!state) notFound();
  const out = calcCover(state);
  const reopenHash = `#s=${code}`;

  return (
    <section className="mx-auto max-w-3xl px-4 py-10 sm:px-6 sm:py-14">
      <p className="text-xs uppercase tracking-wide text-sage-700">Shared cover spec</p>
      <h1 className="mt-2 text-3xl sm:text-4xl">
        {FORMAT_LABEL[state.format]} · {state.pageCount} pages · {PAPER_LABEL[state.paper]}
      </h1>
      <p className="mt-2 tabular text-sage-800">
        Trim {state.trimWidthIn} × {state.trimHeightIn} in
      </p>

      <div className="mt-6 rounded-card border border-sage-200 bg-white p-5 sm:p-6">
        <div className="flex flex-wrap items-end gap-6">
          <div>
            <div className="text-xs uppercase tracking-wide text-sage-700">Spine width</div>
            <div className="tabular font-display text-4xl">{out.spineWidthIn.toFixed(4)}<span className="ml-1 text-base text-sage-700">in</span></div>
            <div className="tabular text-sm text-sage-700">{out.spineWidthMm.toFixed(2)} mm</div>
          </div>
          <div>
            <div className="text-xs uppercase tracking-wide text-sage-700">Full cover</div>
            <div className="tabular text-lg">{out.fullCoverWidthIn.toFixed(4)} × {out.fullCoverHeightIn.toFixed(4)} in</div>
            <div className="tabular text-sm text-sage-700">{out.fullCoverWidthMm.toFixed(2)} × {out.fullCoverHeightMm.toFixed(2)} mm</div>
          </div>
        </div>

        <CoverDiagram input={state} output={out} className="mt-5" />
      </div>

      <Link
        href={`/${reopenHash}`}
        className="mt-6 inline-flex items-center rounded-md bg-warm-400 px-4 py-2 text-sm font-medium text-white hover:bg-warm-500"
      >
        Open in calculator →
      </Link>
    </section>
  );
}
