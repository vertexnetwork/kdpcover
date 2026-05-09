import type { MetadataRoute } from "next";
import { curatedPseoSlugs } from "@kdp/slug";

const SITE = "https://kdpcover.pro";
const PER_SHARD = 45000;

export async function generateSitemaps(): Promise<{ id: number }[]> {
  const total = curatedPseoSlugs().length + 16;
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
    "/changelog",
    "/recommended",
    "/network",
    "/extension",
    "/embed",
    "/terms",
    "/privacy",
  ];

  const all: MetadataRoute.Sitemap = [
    ...staticUrls.map((u) => ({
      url: `${SITE}${u || "/"}`,
      lastModified: new Date(),
      changeFrequency: "weekly" as const,
      priority: u === "" ? 1.0 : 0.7,
    })),
    ...slugs.map((slug) => ({
      url: `${SITE}/calculator/${slug}`,
      lastModified: new Date(),
      changeFrequency: "monthly" as const,
      priority: 0.6,
    })),
  ];

  const start = id * PER_SHARD;
  return all.slice(start, start + PER_SHARD);
}
