import type { Metadata } from "next";
import Link from "next/link";
import { cookies } from "next/headers";
import { notFound, redirect } from "next/navigation";
import { siteConfig } from "@/lib/site-config";
import { PREFLIGHT_COOKIE, readToken } from "@/lib/preflight-token";
import { UnlockForm } from "@/components/preflight/UnlockForm";
import { PassCheckCta } from "@/components/preflight/PassCheckCta";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Unlock Cover Pass-Check",
  robots: { index: false, follow: false },
};

export default async function UnlockPage() {
  if (!siteConfig.features.preflight.enabled) notFound();

  const token = (await cookies()).get(PREFLIGHT_COOKIE)?.value;
  if (readToken(token).valid) redirect(siteConfig.features.preflight.route);

  return (
    <div className="mx-auto max-w-2xl px-4 py-10 sm:px-6 sm:py-16">
      <h1 className="text-3xl leading-tight sm:text-4xl">Unlock Cover Pass-Check</h1>
      <p className="mt-3 text-sage-800">
        The free calculator gives you the dimensions. Pass-Check reads your finished file and tells
        you whether it will actually pass KDP review — size, bleed, resolution, fonts, and color —
        before you upload.
      </p>

      <div className="mt-8 rounded-card border border-sage-200 bg-white p-5 sm:p-6">
        <h2 className="text-lg font-semibold">Already bought it?</h2>
        <p className="mt-1 text-sm text-sage-700">
          Enter your Gumroad license key to unlock the tool on this device.
        </p>
        <div className="mt-4">
          <UnlockForm />
        </div>
      </div>

      <div className="mt-6">
        <p className="mb-3 text-sm font-medium text-ink">Don&rsquo;t have it yet?</p>
        <PassCheckCta source="unlock" variant="card" />
      </div>

      <p className="mt-8 text-center text-xs text-sage-700">
        <Link href="/cover-pass-check" className="text-(--color-accent) hover:opacity-80">
          See everything Pass-Check checks
        </Link>
      </p>
    </div>
  );
}
