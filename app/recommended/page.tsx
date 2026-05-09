import { recommendations } from "@/lib/content/recommendations";
import { ExternalLink } from "lucide-react";

export const metadata = {
  title: "Recommended tools",
  description: "Hand-picked tools we use alongside kdpcover.pro for KDP cover design and publishing research.",
};

export default function RecommendedPage() {
  return (
    <article className="mx-auto max-w-3xl px-4 py-10 sm:px-6 sm:py-14">
      <h1 className="text-3xl sm:text-4xl">Recommended</h1>
      <p className="mt-2 text-sage-800">
        Tools we actually use. Some links may be affiliate links — we only recommend things we&rsquo;ve used personally on KDP projects.
      </p>

      <div className="mt-2 rounded-md border border-warm-100 bg-warm-50 px-3 py-2 text-xs text-warm-700">
        Affiliate disclosure: kdpcover.pro may earn a small commission when you sign up through some of these links, at no extra cost to you.
      </div>

      <ul className="mt-8 grid gap-4 sm:grid-cols-2">
        {recommendations.map((r) => (
          <li key={r.url} className="rounded-card border border-sage-200 bg-white p-4">
            <div className="flex items-start justify-between gap-3">
              <h2 className="text-lg font-medium">{r.name}</h2>
              <span className="rounded-full bg-sage-100 px-2 py-0.5 text-xs uppercase tracking-wide text-sage-700">
                {r.category}
              </span>
            </div>
            <p className="mt-2 text-sm text-sage-800">{r.blurb}</p>
            <a
              href={r.url}
              target="_blank"
              rel="noopener sponsored noreferrer"
              className="mt-3 inline-flex items-center gap-1 text-sm text-warm-500 hover:text-warm-700"
            >
              Visit <ExternalLink className="h-3.5 w-3.5" aria-hidden />
            </a>
          </li>
        ))}
      </ul>
    </article>
  );
}
