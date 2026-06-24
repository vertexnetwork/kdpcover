import Link from "next/link";
import { notFound } from "next/navigation";
import { Check } from "lucide-react";
import { extensionMeta } from "@/lib/content/extension";
import { siteConfig } from "@/lib/site-config";

export const metadata = {
  title: "Chrome Extension",
  description: `The ${siteConfig.name} calculator as a Chrome Web Store popup — same precision math, one-click access.`,
  alternates: { canonical: "/extension" },
};

export default function ExtensionPage() {
  if (!siteConfig.features.extension.enabled) notFound();
  const liveUrl = extensionMeta.chromeWebStoreUrl;

  return (
    <article className="mx-auto max-w-2xl px-4 py-10 sm:px-6 sm:py-14">
      <h1 className="text-3xl sm:text-4xl">{extensionMeta.name}</h1>
      <p className="text-sage-800 mt-2">{extensionMeta.short}</p>

      <ul className="text-sage-800 mt-6 space-y-2 text-sm">
        {extensionMeta.features.map((f) => (
          <li key={f} className="flex items-start gap-2">
            <Check className="text-sage-600 mt-0.5 h-4 w-4 shrink-0" aria-hidden />
            <span>{f}</span>
          </li>
        ))}
      </ul>

      <div className="mt-8">
        {liveUrl ? (
          <a
            href={liveUrl}
            target="_blank"
            rel="noreferrer"
            className="inline-flex min-h-(--spacing-touch) items-center rounded-md bg-(--color-accent) px-4 py-2 text-sm font-medium text-(--color-on-accent) hover:opacity-90"
          >
            Add to Chrome →
          </a>
        ) : (
          <div className="rounded-card border border-(--color-border) bg-(--color-surface) p-5">
            <p className="text-sage-800 text-sm">
              The extension is in review with the Chrome Web Store. The web calculator does
              everything the extension will — and works offline once installed as a PWA.
            </p>
            <Link
              href="/"
              className="mt-4 inline-flex min-h-(--spacing-touch) items-center rounded-md bg-(--color-accent) px-4 py-2 text-sm font-medium text-(--color-on-accent) hover:opacity-90"
            >
              Open the web calculator →
            </Link>
          </div>
        )}
      </div>
    </article>
  );
}
