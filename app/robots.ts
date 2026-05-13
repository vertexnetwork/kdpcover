import type { MetadataRoute } from "next";
import { siteConfig } from "@/lib/site-config";
import { aiAllow, aiDisallow } from "@/lib/ai-bots";

export default function robots(): MetadataRoute.Robots {
  const rules: MetadataRoute.Robots["rules"] = [
    {
      userAgent: "*",
      allow: "/",
      disallow: ["/api/", "/share/"],
    },
    ...aiAllow().map((bot) => ({
      userAgent: bot,
      allow: "/",
    })),
    ...aiDisallow().map((bot) => ({
      userAgent: bot,
      disallow: "/",
    })),
  ];

  return {
    rules,
    sitemap: `${siteConfig.url}/sitemap.xml`,
    host: siteConfig.url,
  };
}
