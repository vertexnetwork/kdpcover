export type Recommendation = {
  name: string;
  /** The base URL — affiliate ID will be appended at render time if configured */
  url: string;
  blurb: string;
  category: "design" | "publishing" | "research" | "hire";
  /**
   * Env var name (NEXT_PUBLIC_AFF_*) holding the affiliate ID. Resolved at
   * build time via `resolveRecommendationUrl` so we never ship raw secrets
   * and missing IDs fall back to the bare URL gracefully.
   */
  affiliateEnv?: string;
  /** How to inject the affiliate ID into the URL */
  affiliateMode?: "query" | "path";
  /** Query key (when mode = "query") — defaults to "ref" */
  affiliateKey?: string;
};

export const recommendations: Recommendation[] = [
  {
    name: "Affinity Publisher",
    url: "https://affinity.serif.com/en-us/publisher/",
    blurb:
      "One-time-purchase desktop publishing tool. Fast page layout, clean PDF/X export — solid for KDP cover and interior work.",
    category: "design",
  },
  {
    name: "Canva",
    url: "https://www.canva.com/",
    blurb:
      "Drag-and-drop graphic design with KDP-friendly templates. Best for non-designers and quick iteration.",
    category: "design",
    affiliateEnv: "NEXT_PUBLIC_AFF_CANVA",
    affiliateMode: "query",
    affiliateKey: "via",
  },
  {
    name: "Scribus",
    url: "https://www.scribus.net/",
    blurb:
      "Free, open-source desktop publishing. Mature PDF/X export and CMYK support — a real Affinity/InDesign alternative for tight budgets.",
    category: "design",
  },
  {
    name: "BookBrush",
    url: "https://bookbrush.com/",
    blurb:
      "3D mockups, ad creatives, and box-set covers for KDP and Amazon Ads. Useful once your manuscript is locked.",
    category: "design",
    affiliateEnv: "NEXT_PUBLIC_AFF_BOOKBRUSH",
    affiliateMode: "query",
    affiliateKey: "ref",
  },
  {
    name: "Atticus",
    url: "https://www.atticus.io/",
    blurb:
      "Cross-platform book formatter for manuscript interior and KDP-ready PDFs. Replaces Vellum for Windows users.",
    category: "publishing",
    affiliateEnv: "NEXT_PUBLIC_AFF_ATTICUS",
    affiliateMode: "query",
    affiliateKey: "ref",
  },
  {
    name: "Vellum",
    url: "https://vellum.pub/",
    blurb:
      "Mac-only, but the gold standard for fiction interior formatting. KDP-ready PDFs with one click.",
    category: "publishing",
  },
  {
    name: "Book Bolt",
    url: "https://bookbolt.io/",
    blurb:
      "Niche, keyword, and cover-template research for KDP low-content and trade books.",
    category: "research",
    affiliateEnv: "NEXT_PUBLIC_AFF_BOOKBOLT",
    affiliateMode: "query",
    affiliateKey: "ref",
  },
  {
    name: "Publisher Rocket",
    url: "https://publisherrocket.com/",
    blurb:
      "Amazon keyword and category research that actually maps to BSR — used by most six-figure indie authors.",
    category: "research",
    affiliateEnv: "NEXT_PUBLIC_AFF_ROCKET",
    affiliateMode: "query",
    affiliateKey: "via",
  },
  {
    name: "Reedsy",
    url: "https://reedsy.com/",
    blurb:
      "Vetted marketplace of cover designers, editors, and proofreaders. Higher floor than freelance platforms.",
    category: "hire",
    affiliateEnv: "NEXT_PUBLIC_AFF_REEDSY",
    affiliateMode: "query",
    affiliateKey: "ref",
  },
  {
    name: "Miblart",
    url: "https://miblart.com/",
    blurb:
      "Cover-design agency with unlimited revisions and a flat fee. Popular among self-publishers shipping multiple titles a year.",
    category: "hire",
  },
];

const AFFILIATE_ENV_MAP: Record<string, string | undefined> = {
  NEXT_PUBLIC_AFF_CANVA: process.env.NEXT_PUBLIC_AFF_CANVA,
  NEXT_PUBLIC_AFF_BOOKBRUSH: process.env.NEXT_PUBLIC_AFF_BOOKBRUSH,
  NEXT_PUBLIC_AFF_ATTICUS: process.env.NEXT_PUBLIC_AFF_ATTICUS,
  NEXT_PUBLIC_AFF_BOOKBOLT: process.env.NEXT_PUBLIC_AFF_BOOKBOLT,
  NEXT_PUBLIC_AFF_ROCKET: process.env.NEXT_PUBLIC_AFF_ROCKET,
  NEXT_PUBLIC_AFF_REEDSY: process.env.NEXT_PUBLIC_AFF_REEDSY,
};

export function resolveRecommendationUrl(rec: Recommendation): string {
  if (!rec.affiliateEnv) return rec.url;
  const id = AFFILIATE_ENV_MAP[rec.affiliateEnv];
  if (!id) return rec.url;

  if (rec.affiliateMode === "path") {
    return `${rec.url.replace(/\/$/, "")}/${encodeURIComponent(id)}`;
  }
  const url = new URL(rec.url);
  url.searchParams.set(rec.affiliateKey ?? "ref", id);
  return url.toString();
}
