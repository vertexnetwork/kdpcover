import type { NextConfig } from "next";
import createMDX from "@next/mdx";
import { buildCSP, EMBED_FRAME_ANCESTORS_CSP } from "./lib/csp";
import { siteConfig } from "./lib/site-config";

const withMDX = createMDX({
  extension: /\.mdx?$/,
});

const siteCsp = buildCSP({
  vercelAnalytics: true,
  clarity: !!process.env.NEXT_PUBLIC_CLARITY_PROJECT_ID,
  adsense: siteConfig.features.ads.provider === "adsense",
  mediavine: siteConfig.features.ads.provider === "mediavine",
  carbon: siteConfig.features.ads.provider === "carbon",
  plausible: !!process.env.NEXT_PUBLIC_PLAUSIBLE_DOMAIN,
  ga: !!process.env.NEXT_PUBLIC_GA_ID,
});

const nextConfig: NextConfig = {
  pageExtensions: ["ts", "tsx", "mdx"],
  reactStrictMode: true,
  poweredByHeader: false,
  experimental: {
    optimizePackageImports: ["lucide-react"],
  },
  async headers() {
    return [
      {
        source: "/embed",
        headers: [
          { key: "Content-Security-Policy", value: EMBED_FRAME_ANCESTORS_CSP },
          { key: "X-Frame-Options", value: "" },
        ],
      },
      {
        source: "/((?!embed).*)",
        headers: [
          { key: "Content-Security-Policy", value: siteCsp },
          { key: "X-Frame-Options", value: "DENY" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=(), interest-cohort=()",
          },
        ],
      },
    ];
  },
};

export default withMDX(nextConfig);
