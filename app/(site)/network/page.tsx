import { loadSisterSites } from "@/lib/network";
import { siteConfig } from "@/lib/site-config";
import { networkCollectionJsonLd } from "@/lib/seo/jsonld";

export const metadata = {
  title: "Vertex Network",
  description: `Tools in the Vertex Network — focused, fast, free utilities for indie publishers, sellers, and creators.`,
  alternates: { canonical: "/network" },
};

export default function NetworkPage() {
  const sisters = loadSisterSites();
  return (
    <article className="mx-auto max-w-3xl px-4 py-10 sm:px-6 sm:py-14">
      <h1 className="text-3xl sm:text-4xl">Vertex Network</h1>
      <p className="mt-2 text-sage-800">
        {siteConfig.name} is one of {sisters.length + 1} small, focused tools in the Vertex
        Network. Each one solves a single, specific problem for indie publishers, marketplace
        sellers, and creators — no accounts, no upsell loops.
      </p>

      <ul className="mt-8 grid gap-4 sm:grid-cols-2">
        {sisters.map((t) => (
          <li
            key={t.url}
            className="flex flex-col rounded-card border border-(--color-border) bg-(--color-surface) p-5"
          >
            <div className="flex items-start justify-between gap-3">
              <h2 className="text-lg font-medium">{t.name}</h2>
              <span
                className={`rounded-full px-2 py-0.5 text-xs uppercase tracking-wide ${
                  t.status === "live"
                    ? "bg-sage-100 text-sage-800"
                    : "bg-warm-50 text-warm-700"
                }`}
              >
                {t.status === "live" ? "Live" : "Coming soon"}
              </span>
            </div>
            <p className="mt-2 text-xs uppercase tracking-wide text-sage-600">
              For {t.audience}
            </p>
            <p className="mt-2 text-sm font-medium text-(--color-on-bg)">{t.tagline}</p>
            <p className="mt-1 flex-1 text-sm text-sage-800">{t.description}</p>
            {t.status === "live" && (
              <a
                href={t.url}
                target="_blank"
                rel="noreferrer"
                className="mt-4 inline-flex min-h-(--spacing-touch) w-fit items-center text-sm text-(--color-accent) hover:opacity-80"
              >
                Visit {t.name} →
              </a>
            )}
          </li>
        ))}
      </ul>

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(networkCollectionJsonLd()) }}
      />
    </article>
  );
}
