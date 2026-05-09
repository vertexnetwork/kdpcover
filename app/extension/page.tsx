import Link from "next/link";
import { extensionMeta } from "@/lib/content/extension";
import { Check } from "lucide-react";

export const metadata = {
  title: "Chrome Extension",
  description: "The KDP Cover Calculator as a Chrome Web Store popup — same precision math, one-click access.",
};

export default function ExtensionPage() {
  const liveUrl = extensionMeta.chromeWebStoreUrl;

  return (
    <article className="mx-auto max-w-2xl px-4 py-10 sm:px-6 sm:py-14">
      <h1 className="text-3xl sm:text-4xl">{extensionMeta.name}</h1>
      <p className="mt-2 text-sage-800">{extensionMeta.short}</p>

      <ul className="mt-6 space-y-2 text-sm text-sage-800">
        {extensionMeta.features.map((f) => (
          <li key={f} className="flex items-start gap-2">
            <Check className="mt-0.5 h-4 w-4 shrink-0 text-sage-600" aria-hidden />
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
            className="inline-flex min-h-11 items-center rounded-md bg-warm-400 px-4 py-2 text-sm font-medium text-white hover:bg-warm-500"
          >
            Add to Chrome →
          </a>
        ) : (
          <div className="rounded-card border border-sage-200 bg-white p-5">
            <p className="text-sm text-sage-800">
              The extension is in review with the Chrome Web Store. The web calculator does everything the extension will — and works offline once installed as a PWA.
            </p>
            <Link
              href="/"
              className="mt-4 inline-flex min-h-11 items-center rounded-md bg-warm-400 px-4 py-2 text-sm font-medium text-white hover:bg-warm-500"
            >
              Open the web calculator →
            </Link>
          </div>
        )}
      </div>
    </article>
  );
}
