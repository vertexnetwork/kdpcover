import type { MetadataRoute } from "next";
import { siteConfig } from "@/lib/site-config";
import { curatedPseoSlugs } from "@kdp/slug";
import { CATALOG, STORE_PATH } from "@/lib/templates/catalog";

// Single sitemap served at /sitemap.xml. Total URL count (~3.2k pSEO + static
// + catalog) is well under Google's 50,000-per-file limit, so no sharding /
// generateSitemaps() — exporting that would move the route to /sitemap/[id].xml
// and make /sitemap.xml (the URL robots.ts advertises) 404. If pSEO ever
// approaches ~45k URLs, reintroduce a proper sitemap index here.
const SITEMAP_MAX = 50000;

const BUILD_LAST_MOD = new Date(
  process.env.VERCEL_GIT_COMMIT_AUTHOR_DATE ??
    process.env.SOURCE_DATE_EPOCH ??
    "2026-05-15T00:00:00Z",
);

export default function sitemap(): MetadataRoute.Sitemap {
  const slugs = curatedPseoSlugs();
  const staticUrls = [
    "",
    "/about",
    "/contact",
    "/guide",
    "/changelog",
    "/recommended",
    "/network",
    "/extension",
    "/embed",
    "/terms",
    "/privacy",
    STORE_PATH,
  ];

  const all: MetadataRoute.Sitemap = [
    ...staticUrls.map((u) => ({
      url: `${siteConfig.url}${u || "/"}`,
      lastModified: BUILD_LAST_MOD,
      changeFrequency: "weekly" as const,
      priority: u === "" ? 1.0 : u === STORE_PATH ? 0.9 : 0.7,
    })),
    ...CATALOG.map((sku) => ({
      url: `${siteConfig.url}${STORE_PATH}/${sku.slug}`,
      lastModified: BUILD_LAST_MOD,
      changeFrequency: "weekly" as const,
      priority: 0.85,
    })),
    ...slugs.map((slug) => ({
      url: `${siteConfig.url}/calculator/${slug}`,
      lastModified: BUILD_LAST_MOD,
      changeFrequency: "monthly" as const,
      priority: 0.6,
    })),
  ];

  return all.slice(0, SITEMAP_MAX);
}
