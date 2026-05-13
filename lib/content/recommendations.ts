import { siteConfig } from "@/lib/site-config";

/**
 * Single-affiliate slot driven entirely from env via siteConfig.features.affiliate.
 *
 * Set:
 *   NEXT_PUBLIC_AFFILIATE_ENABLED=1
 *   NEXT_PUBLIC_AFFILIATE_URL=https://... (already includes your ref code)
 *   NEXT_PUBLIC_AFFILIATE_LABEL=Affinity Publisher (one-time, KDP-ready PDF/X)
 *   NEXT_PUBLIC_AFFILIATE_PROVIDER=affinity
 *
 * The /recommended page renders this single slot plus an editorial list of
 * non-affiliated peers — surface alternatives without pretending neutrality.
 */

export type Recommendation = {
  name: string;
  url: string;
  blurb: string;
  category: "design" | "publishing" | "research" | "hire";
};

export const recommendations: Recommendation[] = [
  {
    name: "Affinity Publisher",
    url: "https://affinity.serif.com/en-us/publisher/",
    blurb:
      "One-time-purchase desktop publishing. Fast page layout, clean PDF/X export — solid for KDP cover and interior work.",
    category: "design",
  },
  {
    name: "Scribus",
    url: "https://www.scribus.net/",
    blurb:
      "Free, open-source desktop publishing. Mature PDF/X export and CMYK support — a real InDesign alternative for tight budgets.",
    category: "design",
  },
  {
    name: "Atticus",
    url: "https://www.atticus.io/",
    blurb:
      "Cross-platform book formatter for manuscript interior and KDP-ready PDFs. Works on Windows where Vellum doesn't.",
    category: "publishing",
  },
  {
    name: "Vellum",
    url: "https://vellum.pub/",
    blurb:
      "Mac-only, but the gold standard for fiction interior formatting. KDP-ready PDFs with one click.",
    category: "publishing",
  },
  {
    name: "Publisher Rocket",
    url: "https://publisherrocket.com/",
    blurb:
      "Amazon keyword and category research that actually maps to BSR — used by most six-figure indie authors.",
    category: "research",
  },
  {
    name: "Reedsy",
    url: "https://reedsy.com/",
    blurb:
      "Vetted marketplace of cover designers, editors, and proofreaders. Higher floor than freelance platforms.",
    category: "hire",
  },
];

/**
 * The featured affiliate slot, if configured. Returns null otherwise.
 */
export function featuredAffiliate() {
  const aff = siteConfig.features.affiliate;
  if (!aff.enabled || !aff.url) return null;
  return { url: aff.url, label: aff.label, provider: aff.provider };
}
