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
  // Last date every multiplier and formula was reconciled against Amazon KDP's
  // official cover-template generator. Surfaced in /about, /llms.txt and
  // /llms-full.txt as a provenance/freshness signal for search and LLMs.
  verifiedDate: "2026-05-15",
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
  proof: [
    {
      label: "Verified math",
      detail:
        "Every multiplier and bleed value is golden-tested against KDP's official cover-template generator on every commit.",
    },
    {
      label: "Zero-data architecture",
      detail:
        "All math runs in your browser. No account, no upload, no cookies set by the calculator itself.",
    },
    {
      label: "Standards-grade output",
      detail:
        "Downloadable SVG templates open cleanly in Affinity Publisher, Illustrator, Inkscape, and Figma at the exact KDP-spec geometry.",
    },
  ],
  faq: [
    {
      q: "How do I calculate my KDP book cover size?",
      a: "Multiply your interior page count by KDP's paper multiplier to get the spine width, then add trim size and bleed for the full cover. In the calculator, choose paperback or hardcover, pick your trim size and paper type, and enter the page count — it adds trim, bleed, and (for hardcover) hinge and wrap to produce the exact full-cover width and height.",
    },
    {
      q: "What size should a KDP paperback cover be?",
      a: "It depends on page count, trim, and paper. For a 300-page 6 × 9 in white-paper paperback the full cover is 12.9256 × 9.25 in with a 0.6756 in spine. Enter your own numbers above for an exact, KDP-verified size.",
    },
    {
      q: "Is this the same as Amazon's official KDP cover calculator?",
      a: "Yes — it uses the same published KDP formulas, and every value is golden-tested against Amazon's official cover-template generator. The difference: it runs entirely in your browser with no Amazon login, and adds a live safe-zone diagram and a downloadable print-ready template.",
    },
    {
      q: "What is the Kindle eBook cover size?",
      a: "A Kindle eBook cover is a single image, ideally 1,600 × 2,560 px (a 1.6:1 ratio). That is separate from a print cover — this tool calculates print paperback and hardcover dimensions, which change with page count and trim size.",
    },
    {
      q: "What spine width do I get for a 200-page book?",
      a: "A 200-page white-paper paperback has a 0.4504 in spine (200 × 0.002252). Cream is 0.5000 in; standard color matches white; case-laminate hardcover is 0.4694 in. Adjust paper or page count above to recompute instantly.",
    },
    {
      q: "Why did KDP reject my cover for wrong dimensions?",
      a: "The most common causes are computing the spine from the wrong paper multiplier and omitting the 0.125 in bleed on every paperback edge. Match the full-cover size from this calculator exactly, keep text inside the safe zone, and upload a single flattened PDF with fonts embedded.",
    },
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
      a: "A single flattened PDF with fonts embedded, at 300 DPI minimum and CMYK color. The PDF should combine back cover, spine, and front cover with no crop marks; keep it 40 MB or less (650 MB is the hard limit).",
    },
  ],
  // Cover Pass-Check — the paid preflight tool. Single source for the landing
  // page, llms.txt/llms-full.txt, and the product JSON-LD.
  preflight: {
    name: "Cover Pass-Check",
    tagline: "Upload your finished KDP cover and know it will pass review — before you submit.",
    summary:
      "Cover Pass-Check is a paid, in-browser tool that checks your finished Amazon KDP cover file (PDF, PNG, or JPG) against KDP's spec and your exact book — full-cover size, bleed/wrap, resolution, embedded fonts, color space, single-page, and file size — and returns a pass/fail report with the fix for each problem. The file is parsed entirely in your browser and never uploaded.",
    checks: [
      "Full-cover size matches the exact dimensions for your trim, paper, and page count",
      "Bleed (paperback) or wrap (hardcover) is present on every edge",
      "Resolution is at least 300 DPI at the printed size",
      "All fonts are embedded (PDF)",
      "Color space is print-ready — CMYK preferred, RGB flagged",
      "It's a single flattened page (PDF)",
      "File size is within KDP's 40 MB recommended / 650 MB hard limits",
    ],
    tiers: [
      {
        id: "author",
        name: "Author",
        priceUsd: 19,
        blurb: "For your book launch. Check one cover at a time, as many times as you need.",
        features: [
          "Single-file pass/fail report",
          "Every check above, with the fix for each",
          "2,500-template bonus pack + cheat sheet",
          "Lifetime access + free spec updates",
        ],
      },
      {
        id: "studio",
        name: "Studio",
        priceUsd: 49,
        blurb: "For volume publishers. Drop a whole folder of covers and get a pass/fail table.",
        features: [
          "Everything in Author",
          "Batch mode — check many covers at once",
          "Worst-first results table + CSV export",
          "Built for low/no-content publishers shipping at scale",
        ],
      },
    ],
    faq: [
      {
        q: "How does Cover Pass-Check know if my cover will pass KDP review?",
        a: "It reads your finished file in the browser and compares it to KDP's published spec and the exact dimensions for your trim, paper, and page count — full-cover size, bleed/wrap, resolution, embedded fonts, color space, page count, and file size. It reports each as pass, warn, or fail with the fix. It verifies the file's measurable properties; your artwork and KDP's own review are still yours to own, so a green report means the dimensions and spec are correct, not a guarantee of acceptance.",
      },
      {
        q: "Is my cover file uploaded anywhere?",
        a: "No. The entire check runs in your browser — the file never leaves your device and nothing is stored on a server. It's the same privacy-first approach as the free calculator.",
      },
      {
        q: "What's the difference between Author and Studio?",
        a: "Author ($19) checks one cover at a time — perfect for a single book launch. Studio ($49) adds batch mode: drop a whole folder of covers and get a worst-first pass/fail table with CSV export, built for publishers shipping many titles.",
      },
      {
        q: "Do I get a refund if it doesn't help?",
        a: "Yes — a 7-day, no-questions-asked refund through Gumroad. Email your receipt and we'll process it.",
      },
    ],
  },
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
