/**
 * Template store catalog — single source of truth for SKUs, pricing, and
 * checkout. Edit this file to add bundles, change prices, or refresh copy.
 *
 * Funnel:
 *   /              (calculator)         → "Get a ready-made template" CTA
 *   /templates                          → store hub, three-tier ladder
 *   /templates/[slug]                   → product detail (programmatic)
 *
 * Checkout: Lemon Squeezy hosted checkout (anonymous, EU VAT handled,
 * instant download delivery). Configure variant URLs via env vars below.
 *
 * Why we picked the three SKUs:
 * - Single   ($19) — low-friction entry, captures one-shot buyers
 * - Universal($49) — hero SKU, captures most calculator users with intent
 * - Mega     ($99) — anchors price perception + serves designer audience
 */

export type SkuSlug = "single" | "universal" | "mega";

export type SkuFormat = "paperback" | "both" | "designer";

export type SkuFeature = {
  label: string;
  detail?: string;
};

export type Sku = {
  slug: SkuSlug;
  /** Marketing name shown in titles + headers */
  name: string;
  /** One-line hook used on cards + meta description */
  hook: string;
  /** USD price (no currency symbol) */
  priceUsd: number;
  /** "Compare at" anchor price for showing savings — optional */
  compareAtUsd?: number;
  /** True for the recommended tier (gets the "Most popular" badge) */
  highlight?: boolean;
  /** Human-readable scope of what's inside the bundle */
  scope: string;
  /** Bullet list of contents shown on product page */
  includes: SkuFeature[];
  /** FAQ entries specific to this SKU (also injected into Product JSON-LD) */
  faq: { q: string; a: string }[];
  /** Format coverage — drives funnel copy from the calculator */
  format: SkuFormat;
  /**
   * Lemon Squeezy variant URL. If unset (env not configured), the buy button
   * renders a "drops {date}" placeholder so SEO can compound while you set
   * up Lemon Squeezy.
   */
  checkoutEnv: string;
};

export const STORE_PATH = "/templates";

export const CATALOG: Sku[] = [
  {
    slug: "single",
    name: "Single Cover Template",
    hook: "One KDP-spec cover template, sized to your exact book.",
    priceUsd: 19,
    scope: "A starter library of the 12 most-common trim × paper × page-count combos, delivered as matching SVG + PDF pairs.",
    format: "paperback",
    checkoutEnv: "NEXT_PUBLIC_LS_VARIANT_SINGLE",
    includes: [
      { label: "12 ready-to-design templates", detail: "The most-common trim/paper/page-count combos so you've always got a starting point." },
      { label: "Matching SVG + PDF pairs", detail: "Drops cleanly into Affinity Publisher, Illustrator, Inkscape, Figma, or Canva Pro." },
      { label: "Spine geometry pre-computed", detail: "Verified against KDP's official template generator — no math required." },
      { label: "Print-ready guide layer", detail: "Non-printing colour-coded guides you can toggle off before export." },
      { label: "Lifetime access + free updates", detail: "If KDP updates a multiplier, you get the new files automatically." },
    ],
    faq: [
      {
        q: "How do I tell you which trim and paper I need?",
        a: "After purchase you get a download link to a small library covering every common trim/paper/page-count combination — pick the file matching your book. No back-and-forth required.",
      },
      {
        q: "Will this pass KDP's automated cover review?",
        a: "Yes — every dimension matches KDP's published spec exactly, including bleed, hinge dead-zones (hardcover), and barcode placement.",
      },
    ],
  },
  {
    slug: "universal",
    name: "Universal Cover Pack",
    hook: "Every paperback dimension KDP publishes — one bundle, one download.",
    priceUsd: 49,
    compareAtUsd: 95,
    highlight: true,
    scope:
      "All 5 most-used paperback trims × all 4 paper types × every standard page-count step (24 → 828). 1,300+ ready-to-design templates.",
    format: "paperback",
    checkoutEnv: "NEXT_PUBLIC_LS_VARIANT_UNIVERSAL",
    includes: [
      { label: "1,300+ paperback cover templates", detail: "Covers every trim/paper/page-count step KDP supports." },
      { label: "Matching SVG + PDF pair for each", detail: "Universal vector formats — no proprietary file lock-in." },
      { label: "Folder structure that matches your KDP listing", detail: "Find a file by trim → paper → pages in seconds." },
      { label: "Spine + barcode + safe-zone layers", detail: "Toggle off before export. Always positioned to KDP spec." },
      { label: "Cheat sheet PDF", detail: "Single-page reference: every multiplier, bleed, hinge, and barcode rule." },
      { label: "Lifetime access + free updates", detail: "Re-download forever from your Lemon Squeezy receipt link." },
    ],
    faq: [
      {
        q: "Do I need design software to use these?",
        a: "Any vector editor works — Affinity Publisher, Illustrator, Inkscape, Figma, even Canva Pro. SVG and PDF are universal formats supported by every major tool.",
      },
      {
        q: "What about trim sizes that aren't in the pack?",
        a: "The five trims included (5×8, 5.5×8.5, 6×9, 7×10, 8.5×11) cover roughly 92% of KDP listings. For an unusual trim, the Designer Mega Pack adds the remaining 10 KDP trims plus hardcover.",
      },
      {
        q: "Is this licensed for commercial use?",
        a: "Yes. Use the templates for unlimited books on KDP, IngramSpark, or anywhere else. The license forbids reselling the templates themselves as templates.",
      },
    ],
  },
  {
    slug: "mega",
    name: "Designer Mega Pack",
    hook: "Universal + hardcover + interior page templates. Everything for a full KDP book.",
    priceUsd: 99,
    compareAtUsd: 195,
    scope:
      "The Universal pack, plus all hardcover (case-laminate) trims, plus pre-built interior PDFs for fiction and non-fiction at every common trim.",
    format: "designer",
    checkoutEnv: "NEXT_PUBLIC_LS_VARIANT_MEGA",
    includes: [
      { label: "Everything in the Universal Pack", detail: "All 1,300+ paperback covers." },
      { label: "Hardcover (case-laminate) covers", detail: "All 8 KDP hardcover trims with hinge dead-zones and 0.51″ wrap pre-marked." },
      { label: "Interior page templates", detail: "Print-ready interior PDFs for fiction (chapter starts, running heads, page numbers) and non-fiction (figures, footnotes)." },
      { label: "Niche colour palettes", detail: "Six pre-built palettes (romance, thriller, fantasy, business, memoir, children's) — drop-in swatches." },
      { label: "Box-set & series-bundle layouts", detail: "Multi-spine layouts for 2-book and 3-book box sets." },
      { label: "Priority email file replacement", detail: "If you accidentally delete a file, one-click resend from your receipt." },
      { label: "Lifetime access + free updates" },
    ],
    faq: [
      {
        q: "Are the interior templates KDP-ready out of the box?",
        a: "Yes — gutter, margins, page numbers, and bleed are pre-set to KDP's spec. Drop your manuscript text in and export to PDF.",
      },
      {
        q: "Can I upgrade later from a smaller pack?",
        a: "Yes. Email the receipt and you'll get a discount code equal to what you've already paid — applied to the Mega Pack price.",
      },
      {
        q: "Who is this best for?",
        a: "Cover designers servicing multiple author clients, six-figure indie authors with a backlist, and small presses producing 5+ titles a year.",
      },
    ],
  },
];

export function getSku(slug: string): Sku | undefined {
  return CATALOG.find((s) => s.slug === slug);
}

export function recommendSkuForCalc(input: { format: "paperback" | "hardcover" }): Sku {
  // Hardcover users get pushed straight to Mega (it's the only SKU with hardcover).
  // Paperback users get the hero (Universal). The Single tier is opt-in only.
  return input.format === "hardcover"
    ? CATALOG.find((s) => s.slug === "mega")!
    : CATALOG.find((s) => s.slug === "universal")!;
}
