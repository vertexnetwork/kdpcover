import { ExternalLink } from "lucide-react";
import { recommendations, featuredAffiliate } from "@/lib/content/recommendations";
import { AffiliateSlot } from "@/components/affiliate/AffiliateSlot";
import { siteConfig } from "@/lib/site-config";

export const metadata = {
  title: "Recommended tools",
  description: `Hand-picked tools we use alongside ${siteConfig.name} for KDP cover design and publishing research.`,
  alternates: { canonical: "/recommended" },
};

export default function RecommendedPage() {
  const featured = featuredAffiliate();

  return (
    <article className="mx-auto max-w-3xl px-4 py-10 sm:px-6 sm:py-14">
      <h1 className="text-3xl sm:text-4xl">Recommended</h1>
      <p className="mt-2 text-sage-800">
        Tools we actually use. We only recommend things we&rsquo;ve used personally on KDP
        projects.
      </p>

      {featured && (
        <section className="mt-8 rounded-card border border-warm-300 bg-gradient-to-br from-warm-50 to-(--color-surface) p-5">
          <p className="text-xs uppercase tracking-wide text-warm-700">Our pick</p>
          <h2 className="mt-1 text-xl font-display">{featured.label}</h2>
          <p className="mt-1 text-sm text-sage-800">
            One pick we actively use day-to-day for KDP cover work. The link below is an
            affiliate link, at no extra cost to you.
          </p>
          <div className="mt-3">
            <AffiliateSlot placement="recommended-page" />
          </div>
          <p className="mt-3 text-xs text-warm-700">
            Affiliate disclosure: {siteConfig.name} may earn a small commission when you sign up
            through this link, at no extra cost to you.
          </p>
        </section>
      )}

      <h2 className="mt-12 text-xl">Also worth knowing about</h2>
      <p className="mt-1 text-sm text-sage-700">
        Editorial list — not affiliated, no commission. Listed so this page doesn&rsquo;t pretend
        the one option above is the only one.
      </p>
      <ul className="mt-6 grid gap-4 sm:grid-cols-2">
        {recommendations.map((r) => (
          <li
            key={r.url}
            className="rounded-card border border-(--color-border) bg-(--color-surface) p-4"
          >
            <div className="flex items-start justify-between gap-3">
              <h3 className="text-lg font-medium">{r.name}</h3>
              <span className="rounded-full bg-sage-100 px-2 py-0.5 text-xs uppercase tracking-wide text-sage-700">
                {r.category}
              </span>
            </div>
            <p className="mt-2 text-sm text-sage-800">{r.blurb}</p>
            <a
              href={r.url}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-3 inline-flex items-center gap-1 text-sm text-(--color-accent) hover:opacity-80"
            >
              Visit <ExternalLink className="h-3.5 w-3.5" aria-hidden />
            </a>
          </li>
        ))}
      </ul>
    </article>
  );
}
