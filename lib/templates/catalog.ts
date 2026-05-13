/**
 * Template store catalog — single SKU per the Vertex network's
 * "one affiliate, one SKU" template guidance (spec §10).
 *
 * Funnel:
 *   /              (calculator)         → "Get the template" CTA
 *   /templates                          → SKU landing page
 *   /templates/[slug]                   → product detail (programmatic)
 *
 * Checkout: Lemon Squeezy hosted checkout. Set
 * `NEXT_PUBLIC_LEMON_SQUEEZY_STORE_ID` plus `NEXT_PUBLIC_LEMON_SQUEEZY_VARIANT`
 * to the variant UUID.
 */

export type SkuSlug = "kdp-cover-template";

export type SkuFeature = {
  label: string;
  detail?: string;
};

export type Sku = {
  slug: SkuSlug;
  name: string;
  hook: string;
  priceUsd: number;
  compareAtUsd?: number;
  highlight?: boolean;
  scope: string;
  includes: SkuFeature[];
  faq: { q: string; a: string }[];
  /** Always single-SKU. Retained for cross-spoke type compatibility. */
  format: "all";
};

export const STORE_PATH = "/templates";

const SKU: Sku = {
  slug: "kdp-cover-template",
  name: "KDP Cover Template Pack",
  hook: "Every KDP-spec paperback and hardcover dimension — one bundle, one download.",
  priceUsd: 49,
  compareAtUsd: 95,
  highlight: true,
  scope:
    "Paperback and case-laminate hardcover templates across every common KDP trim, every paper type, and every page-count step. 1,300+ ready-to-design files in matching SVG + PDF pairs.",
  format: "all",
  includes: [
    {
      label: "1,300+ KDP cover templates",
      detail: "Paperback and hardcover, every standard trim, every paper, every page-count step.",
    },
    {
      label: "Matching SVG + PDF pair for each",
      detail: "Universal vector formats — open in Affinity Publisher, Illustrator, Inkscape, Figma, or Canva Pro.",
    },
    {
      label: "Spine geometry pre-computed",
      detail: "Verified against KDP's official cover-template generator.",
    },
    {
      label: "Spine + barcode + safe-zone layers",
      detail: "Toggle off before export. Always positioned to KDP spec.",
    },
    {
      label: "Folder structure that mirrors your KDP listing",
      detail: "Find a file by trim → paper → pages in seconds.",
    },
    {
      label: "Cheat sheet PDF",
      detail: "Single-page reference: every multiplier, bleed, hinge, and barcode rule.",
    },
    {
      label: "Lifetime access + free updates",
      detail: "If KDP changes a multiplier, you get the new files automatically.",
    },
  ],
  faq: [
    {
      q: "Do I need design software to use these?",
      a: "Any vector editor works — Affinity Publisher, Illustrator, Inkscape, Figma, or Canva Pro. SVG and PDF are universal formats.",
    },
    {
      q: "Will this pass KDP's automated cover review?",
      a: "Yes — every dimension matches KDP's published spec, including bleed, hinge dead-zones (hardcover), and barcode placement.",
    },
    {
      q: "Is this licensed for commercial use?",
      a: "Yes. Use the templates for unlimited books on KDP, IngramSpark, or anywhere else. The license forbids reselling the templates themselves as templates.",
    },
  ],
};

export const CATALOG: Sku[] = [SKU];

export function getSku(slug: string): Sku | undefined {
  return CATALOG.find((s) => s.slug === slug);
}

/**
 * For cross-call compatibility (used by the calculator's "skip the layout"
 * upsell). Always returns the single SKU.
 */
export function recommendSkuForCalc(): Sku {
  return SKU;
}
