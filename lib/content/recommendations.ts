import { siteConfig } from "@/lib/site-config";

/**
 * PartnerStack affiliate partners for kdpcover (self-published authors).
 *
 * Every partner is a PartnerStack program that pays CASH, so the whole network
 * is monitored from one PartnerStack dashboard — no chasing payouts across a
 * dozen affiliate networks. Each is a COMPLEMENT to the $19 Cover Pass-Check
 * (email, merch, courses), never a substitute, so surfacing them never competes
 * with our own sale. See vertex-network-affiliate-guide.md for the full research.
 *
 * Referral URLs come from env so the same build ships pre- and post-approval:
 * a partner whose URL env var is unset is omitted by `activeRecommendedTools()`.
 * `applyUrl` is the PartnerStack application link (operator reference only, not
 * rendered) — apply there, then paste the issued referral link into the matching
 * NEXT_PUBLIC_AFF_*_URL env var to make the card go live.
 */
export type RecommendedTool = {
  id: string;
  name: string;
  /** Short category tag shown on the card. */
  tag: string;
  /** One-line, author-intent pitch. */
  blurb: string;
  /** Referral URL — set per-partner via env once approved on PartnerStack. */
  url: string;
  /** Our PartnerStack application link. Reference only; never rendered. */
  applyUrl: string;
};

const CATALOG: readonly RecommendedTool[] = [
  {
    id: "kit",
    name: "Kit",
    tag: "Email & newsletter",
    blurb: "Build the launch list every book needs — email automation made for authors.",
    url: process.env.NEXT_PUBLIC_AFF_KIT_URL ?? "",
    applyUrl: "https://dash.partnerstack.com/application?company=kit",
  },
  {
    id: "printify",
    name: "Printify",
    tag: "Print-on-demand merch",
    blurb: "Turn your book into journals, tees, and reader merch — no inventory, no upfront cost.",
    url: process.env.NEXT_PUBLIC_AFF_PRINTIFY_URL ?? "",
    applyUrl: "https://dash.partnerstack.com/application?company=printify",
  },
  {
    id: "gelato",
    name: "Gelato",
    tag: "Global print-on-demand",
    blurb: "Print books and merch locally across 32 countries — fast, low-footprint fulfillment.",
    url: process.env.NEXT_PUBLIC_AFF_GELATO_URL ?? "",
    applyUrl: "https://dash.partnerstack.com/application?company=gelato&group=inbound",
  },
  {
    id: "teachable",
    name: "Teachable",
    tag: "Courses & coaching",
    blurb: "Turn your expertise into a course your readers can buy after they finish the book.",
    url: process.env.NEXT_PUBLIC_AFF_TEACHABLE_URL ?? "",
    applyUrl: "https://dash.partnerstack.com/application?company=teachableinc&group=30oneyear",
  },
];

/** The full catalog, including not-yet-approved partners (for ops/reference). */
export const recommendedToolsCatalog = CATALOG;

/** Partners that should actually render: affiliate enabled AND a referral URL set. */
export function activeRecommendedTools(): RecommendedTool[] {
  if (!siteConfig.features.affiliate.enabled) return [];
  return CATALOG.filter((t) => t.url.trim().length > 0);
}
