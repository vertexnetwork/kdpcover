import type { MetadataRoute } from "next";
import { siteConfig } from "@/lib/site-config";
import { curatedPseoSlugs } from "@kdp/slug";
import { CATALOG, STORE_PATH } from "@/lib/templates/catalog";

const PER_SHARD = 45000;

const BUILD_LAST_MOD = new Date(
  process.env.VERCEL_GIT_COMMIT_AUTHOR_DATE ??
    process.env.SOURCE_DATE_EPOCH ??
    "2026-05-12T00:00:00Z",
);

export async function generateSitemaps(): Promise<{ id: number }[]> {
  const total = curatedPseoSlugs().length + 16 + CATALOG.length;
  const shards = Math.max(1, Math.ceil(total / PER_SHARD));
  return Array.from({ length: shards }, (_, i) => ({ id: i }));
}

export default async function sitemap({
  id,
}: {
  id: number;
}): Promise<MetadataRoute.Sitemap> {
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

  const start = id * PER_SHARD;
  return all.slice(start, start + PER_SHARD);
}
