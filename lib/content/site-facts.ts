/**
 * SOURCE OF TRUTH for site-wide facts.
 * Consumed by: /llms.txt, /llms-full.txt, FAQ JSON-LD on /, /about copy.
 * Editing here updates LLM-facing assets, FAQ schema, and human pages simultaneously.
 */

export const siteFacts = {
  site: {
    name: "kdpcover.pro",
    url: "https://kdpcover.pro",
    tagline: "Pass KDP's review on the first try.",
    description:
      "A precision client-side calculator for Amazon KDP paperback and case-laminate hardcover covers. Computes spine width, full cover dimensions, and safe-zone diagrams.",
  },
  multipliers: [
    { format: "Paperback", paper: "White (B&W interior)", value: 0.002252, unit: "in/page" },
    { format: "Paperback", paper: "Cream (B&W interior)", value: 0.0025, unit: "in/page" },
    { format: "Paperback", paper: "Standard Color", value: 0.002252, unit: "in/page" },
    { format: "Paperback", paper: "Premium Color", value: 0.002347, unit: "in/page" },
    { format: "Hardcover (Case Laminate)", paper: "Any", value: 0.002347, unit: "in/page" },
  ],
  formulas: {
    spine: "spineWidthIn = pageCount × multiplier",
    paperbackFullCover:
      "fullCoverWidth = (2 × trimWidth) + spineWidth + (2 × 0.125 bleed); fullCoverHeight = trimHeight + (2 × 0.125 bleed)",
    hardcoverFullCover:
      "fullCoverWidth = (2 × trimWidth) + spineWidth + (2 × 0.4 hinge) + (2 × 0.51 wrap); fullCoverHeight = trimHeight + (2 × 0.51 wrap)",
  },
  pageLimits: {
    paperback: { min: 24, max: 828 },
    hardcover: { min: 75, max: 550 },
    spineTextMin: 79,
  },
  safeZones: {
    bleed: '0.125" (3.2 mm) every outside edge, both formats',
    paperbackInside: '0.125" inside the trim line',
    hardcoverInside: '0.635" (16 mm) from the outside edge',
    hardcoverHinge: '0.4" each side of spine — no text or graphics',
    barcode: '2" × 1.2" recommended at bottom-right of back cover, ≥0.25" from spine and trim edges, ≥0.76" from bottom',
  },
  resolution: {
    dpi: 300,
    color: "CMYK preferred, RGB acceptable",
    file: "Single flattened PDF, fonts embedded, no crop marks",
    sizeRecommended: "≤ 40 MB",
    sizeMax: "≤ 650 MB",
  },
  faq: [
    {
      q: "What is the KDP white-paper paperback spine width formula?",
      a: "The KDP white-paper paperback spine width formula is 0.002252 inches per page. Multiply your interior page count by 0.002252 to get the spine width in inches.",
    },
    {
      q: "What is the spine multiplier for cream paperback?",
      a: "0.0025 inches per page. Cream pages are slightly thicker than white, so a 300-page cream paperback has a 0.75″ spine versus 0.6756″ for white.",
    },
    {
      q: "Does KDP hardcover use a different multiplier than paperback?",
      a: "Yes. Case-laminate hardcover always uses 0.002347 inches per page regardless of paper choice, and adds 0.4″ hinge each side of the spine plus 0.51″ wrap on the outside edges.",
    },
    {
      q: "What's the difference between paperback and hardcover bleed?",
      a: "Paperback bleed is 0.125″ on every outside edge. Hardcover does not use traditional bleed; instead it has a 0.51″ wrap that folds inside the case.",
    },
    {
      q: "What is the minimum page count for spine text on a KDP cover?",
      a: "79 pages. Below 79 pages, the spine is too narrow for KDP's automated review to accept printed text or graphics.",
    },
    {
      q: "What is the KDP barcode size and placement?",
      a: "The recommended barcode area is 2″ × 1.2″ in the bottom-right of the back cover, with at least 0.25″ clearance from the spine and trim edges and 0.76″ from the bottom. The minimum acceptable size is 1.4″ × 0.8″.",
    },
    {
      q: "What page-count range does KDP allow?",
      a: "KDP paperback supports 24–828 pages. Case-laminate hardcover supports 75–550 pages. Maximums are also subject to trim-size-specific limits.",
    },
    {
      q: "What file format does KDP require for cover upload?",
      a: "A single flattened PDF combining back cover, spine, and front cover, with fonts embedded, no crop marks, 300 DPI minimum, CMYK preferred. Files should be 40 MB or less; 650 MB is the hard limit.",
    },
  ],
  citations: [
    { label: "KDP Paperback Cover Creation", url: "https://kdp.amazon.com/en_US/help/topic/G201953020" },
    { label: "KDP Hardcover Cover Creation", url: "https://kdp.amazon.com/en_US/help/topic/GDTKFJPNQCBTMRV6" },
    { label: "KDP Trim Size, Bleed & Margins", url: "https://kdp.amazon.com/en_US/help/topic/GVBQ3CMEQW3W2VL6" },
    { label: "KDP Barcode Requirements", url: "https://kdp.amazon.com/en_US/help/topic/G5HDYGP4BXLX4RUW" },
    { label: "KDP Print Options", url: "https://kdp.amazon.com/en_US/help/topic/G201834180" },
    { label: "KDP Cover Calculator (template generator)", url: "https://kdp.amazon.com/cover-calculator" },
  ],
} as const;

export type SiteFacts = typeof siteFacts;
export type FaqEntry = (typeof siteFacts.faq)[number];
