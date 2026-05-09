export type Recommendation = {
  name: string;
  url: string;
  blurb: string;
  category: "design" | "publishing" | "research" | "hire";
  affiliateId?: string;
};

export const recommendations: Recommendation[] = [
  {
    name: "Affinity Publisher",
    url: "https://affinity.serif.com/en-us/publisher/",
    blurb: "One-time-purchase desktop publishing tool. Fast page layout, clean PDF/X export — solid for KDP cover and interior work.",
    category: "design",
  },
  {
    name: "Canva",
    url: "https://www.canva.com/",
    blurb: "Drag-and-drop graphic design with KDP-friendly templates. Best for non-designers and quick iteration.",
    category: "design",
  },
  {
    name: "Scribus",
    url: "https://www.scribus.net/",
    blurb: "Free, open-source desktop publishing. Mature PDF/X export and CMYK support — a real Affinity/InDesign alternative for tight budgets.",
    category: "design",
  },
  {
    name: "BookBrush",
    url: "https://bookbrush.com/",
    blurb: "3D mockups, ad creatives, and box-set covers for KDP and Amazon Ads. Useful once your manuscript is locked.",
    category: "design",
  },
  {
    name: "Atticus",
    url: "https://www.atticus.io/",
    blurb: "Cross-platform book formatter for manuscript interior and KDP-ready PDFs. Replaces Vellum for Windows users.",
    category: "publishing",
  },
  {
    name: "Vellum",
    url: "https://vellum.pub/",
    blurb: "Mac-only, but the gold standard for fiction interior formatting. KDP-ready PDFs with one click.",
    category: "publishing",
  },
  {
    name: "Book Bolt",
    url: "https://bookbolt.io/",
    blurb: "Niche, keyword, and cover-template research for KDP low-content and trade books.",
    category: "research",
  },
  {
    name: "Publisher Rocket",
    url: "https://publisherrocket.com/",
    blurb: "Amazon keyword and category research that actually maps to BSR — used by most six-figure indie authors.",
    category: "research",
  },
  {
    name: "Reedsy",
    url: "https://reedsy.com/",
    blurb: "Vetted marketplace of cover designers, editors, and proofreaders. Higher floor than freelance platforms.",
    category: "hire",
  },
  {
    name: "Miblart",
    url: "https://miblart.com/",
    blurb: "Cover-design agency with unlimited revisions and a flat fee. Popular among self-publishers shipping multiple titles a year.",
    category: "hire",
  },
];
