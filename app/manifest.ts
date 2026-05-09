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
    // Icons live as Next.js file conventions in /app:
    //   /icon.svg    → app/icon.svg       (vector — scales to every browser request)
    //   /apple-icon  → app/apple-icon.tsx (180×180 PNG, also used as maskable for Android)
    icons: [
      { src: "/icon.svg", sizes: "any", type: "image/svg+xml" },
      { src: "/apple-icon", sizes: "180x180", type: "image/png", purpose: "any" },
      { src: "/apple-icon", sizes: "180x180", type: "image/png", purpose: "maskable" },
    ],
  };
}
