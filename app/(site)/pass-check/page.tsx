import type { Metadata } from "next";
import Link from "next/link";
import { cookies } from "next/headers";
import { notFound, redirect } from "next/navigation";
import { ArrowUpRight } from "lucide-react";
import { siteConfig } from "@/lib/site-config";
import { PREFLIGHT_COOKIE, readToken } from "@/lib/preflight-token";
import { PreflightTool } from "@/components/preflight/PreflightTool";
import { BatchTable } from "@/components/preflight/BatchTable";

// Gated tool. Cookie-checked on every request; noindex.
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Cover Pass-Check",
  robots: { index: false, follow: false },
};

export default async function PassCheckPage() {
  if (!siteConfig.features.preflight.enabled) notFound();

  const token = (await cookies()).get(PREFLIGHT_COOKIE)?.value;
  const result = readToken(token);
  if (!result.valid) redirect(`${siteConfig.features.preflight.route}/unlock`);

  const studioUrl = siteConfig.monetization.gumroad.studioUrl;

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 sm:py-12">
      <header className="mb-6 max-w-2xl">
        <h1 className="text-3xl leading-tight sm:text-4xl">Cover Pass-Check</h1>
        <p className="mt-2 text-sage-800">
          {result.tier === "studio"
            ? "Studio: drop a folder of finished covers and get a pass/fail table."
            : "Set your book, drop your finished cover, and see whether it will pass KDP review."}
        </p>
      </header>

      {result.tier === "studio" ? <BatchTable /> : <PreflightTool />}

      {result.tier === "author" && studioUrl && (
        <div className="mt-8 flex flex-wrap items-center justify-between gap-3 rounded-card border border-sage-200 bg-sage-50/50 p-5">
          <div>
            <p className="font-display text-lg">Publishing at volume?</p>
            <p className="text-sm text-sage-800">
              Studio adds batch mode — check a whole folder of covers at once.
            </p>
          </div>
          <a
            href={studioUrl}
            target="_blank"
            rel="noopener"
            className="inline-flex items-center gap-1.5 rounded-md bg-(--color-on-bg) px-4 py-2.5 text-sm font-medium text-(--color-on-accent) hover:bg-(--color-accent)"
          >
            Upgrade to Studio <ArrowUpRight className="h-4 w-4" aria-hidden />
          </a>
        </div>
      )}

      <p className="mt-8 text-center text-xs text-sage-700">
        Need the dimensions first?{" "}
        <Link href="/" className="text-(--color-accent) hover:opacity-80">
          Use the free calculator
        </Link>
        .
      </p>
    </div>
  );
}
