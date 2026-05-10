import { networkTools } from "@/lib/content/network";

export const metadata = {
  title: "Vertex Network",
  description: "Tools in the Vertex Network — focused, fast, free utilities for indie publishers, sellers, and creators.",
};

// Hide the current site from its own /network — visitors are already here.
// The data array stays the canonical list so it's portable to sister sites.
const CURRENT_SITE = "kdpcover.pro";

export default function NetworkPage() {
  const others = networkTools.filter((t) => t.name !== CURRENT_SITE);
  return (
    <article className="mx-auto max-w-3xl px-4 py-10 sm:px-6 sm:py-14">
      <h1 className="text-3xl sm:text-4xl">Vertex Network</h1>
      <p className="mt-2 text-sage-800">
        A small constellation of focused, fast, free tools for indie publishers, marketplace sellers, and creators. Each one solves a single, specific problem — no accounts, no upsell loops.
      </p>

      <ul className="mt-8 grid gap-4 sm:grid-cols-2">
        {others.map((t) => (
          <li key={t.url} className="flex flex-col rounded-card border border-sage-200 bg-white p-5">
            <div className="flex items-start justify-between gap-3">
              <h2 className="text-lg font-medium">{t.name}</h2>
              <span
                className={`rounded-full px-2 py-0.5 text-xs uppercase tracking-wide ${
                  t.status === "live" ? "bg-sage-100 text-sage-800" : "bg-warm-50 text-warm-700"
                }`}
              >
                {t.status === "live" ? "Live" : "Coming soon"}
              </span>
            </div>
            <p className="mt-2 text-xs uppercase tracking-wide text-sage-600">For {t.audience}</p>
            <p className="mt-2 flex-1 text-sm text-sage-800">{t.description}</p>
            {t.status === "live" && (
              <a
                href={t.url}
                target="_blank"
                rel="noreferrer"
                className="mt-4 inline-flex min-h-11 w-fit items-center text-sm text-warm-500 hover:text-warm-700"
              >
                Visit {t.name} →
              </a>
            )}
          </li>
        ))}
      </ul>
    </article>
  );
}
