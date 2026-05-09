import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/api/og", "/share/"],
      },
    ],
    sitemap: "https://kdpcover.pro/sitemap.xml",
  };
}
