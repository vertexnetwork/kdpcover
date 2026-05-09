export type NetworkTool = {
  name: string;
  url: string;
  description: string;
  audience: string;
  status: "live" | "soon";
};

export const networkTools: NetworkTool[] = [
  {
    name: "kdpcover.pro",
    url: "https://kdpcover.pro",
    description: "Precision spine width and cover dimension calculator for Amazon KDP.",
    audience: "Self-published authors and cover designers",
    status: "live",
  },
  {
    name: "shopifont.app",
    url: "https://shopifont.app",
    description: "Type-pair previews and font-stack inspector for Shopify storefronts.",
    audience: "Shopify merchants and theme designers",
    status: "live",
  },
  {
    name: "etsymargin.tools",
    url: "https://etsymargin.tools",
    description: "Margin, fee, and break-even calculator built for Etsy sellers — fees, shipping, and ad spend in one view.",
    audience: "Etsy sellers and print-on-demand operators",
    status: "live",
  },
  {
    name: "captionsnap.io",
    url: "https://captionsnap.io",
    description: "Fast, on-brand caption generator for short-form video creators.",
    audience: "Creators on TikTok, Reels, and Shorts",
    status: "live",
  },
];
