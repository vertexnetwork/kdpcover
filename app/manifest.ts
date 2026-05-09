import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "KDP Cover & Spine Width Calculator",
    short_name: "kdpcover.pro",
    description: "Pass KDP's review on the first try. Precision spine width and full cover dimensions.",
    start_url: "/?utm_source=pwa",
    display: "standalone",
    background_color: "#FBF7EB",
    theme_color: "#9CAF88",
    icons: [
      { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
      { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png" },
      {
        src: "/icons/icon-maskable-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  };
}
