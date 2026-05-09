export type Recommendation = {
  name: string;
  url: string;
  blurb: string;
  category: "design" | "publishing" | "research";
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
    name: "Book Bolt",
    url: "https://bookbolt.io/",
    blurb: "Niche, keyword, and cover-template research for KDP low-content and trade books.",
    category: "research",
  },
];
