import type { MetadataRoute } from "next";
import { siteConfig } from "@/lib/site-config";
import { curatedPseoSlugs, parseSlug } from "@kdp/slug";
import { siteFacts } from "@/lib/content/site-facts";
import { CATALOG, STORE_PATH } from "@/lib/templates/catalog";

// Single sitemap served at /sitemap.xml. Total URL count (2,060 pSEO + static
// + catalog) is well under Google's 50,000-per-file limit, so no sharding /
// generateSitemaps() — exporting that would move the route to /sitemap/[id].xml
// and make /sitemap.xml (the URL robots.ts advertises) 404. If pSEO ever
// approaches ~45k URLs, reintroduce a proper sitemap index here.
const SITEMAP_MAX = 50000;

// Static/marketing pages genuinely change when we deploy, so build date is the
// honest lastmod for them.
const BUILD_LAST_MOD = new Date(
  process.env.VERCEL_GIT_COMMIT_AUTHOR_DATE ??
    process.env.SOURCE_DATE_EPOCH ??
    "2026-05-15T00:00:00Z",
);

// Calculator pages are pure functions of the KDP multipliers — their content
// only changes when those multipliers are re-verified, NOT on every deploy.
// Stamping them with the verified date (stable across builds, tied to a real
// content event) avoids the "everything changed today on every deploy" tell
// that build-date lastmod produces for a 2,060-page set.
const CONTENT_LAST_MOD = new Date(`${siteFacts.verifiedDate}T00:00:00Z`);

/**
 * Tier calculator priority by trim popularity (a real demand signal) instead of
 * one uniform value. 6 × 9 is by far the most-searched KDP trim; the other core
 * trades sit a notch below; everything else lower. priority is a weak, largely
 * ignored crawl hint — this varies it for honesty, and only ever raises the
 * most important pages, never starves them.
 */
function calculatorPriority(slug: string): number {
  const parsed = parseSlug(slug);
  if (!parsed) return 0.5;
  const { trimWidthIn: w, trimHeightIn: h } = parsed;
  if (w === 6 && h === 9) return 0.7;
  if ((w === 5 && h === 8) || (w === 5.5 && h === 8.5) || (w === 8.5 && h === 11)) return 0.6;
  return 0.5;
}

export default function sitemap(): MetadataRoute.Sitemap {
  const slugs = curatedPseoSlugs();
  const staticUrls = [
    "",
    "/calculator",
    "/cover-pass-check",
    "/about",
    "/contact",
    "/guide",
    "/changelog",
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
      priority:
        u === "" ? 1.0 : u === "/cover-pass-check" ? 0.9 : u === STORE_PATH ? 0.8 : 0.7,
    })),
    ...CATALOG.map((sku) => ({
      url: `${siteConfig.url}${STORE_PATH}/${sku.slug}`,
      lastModified: BUILD_LAST_MOD,
      changeFrequency: "weekly" as const,
      priority: 0.85,
    })),
    ...slugs.map((slug) => ({
      url: `${siteConfig.url}/calculator/${slug}`,
      lastModified: CONTENT_LAST_MOD,
      changeFrequency: "yearly" as const,
      priority: calculatorPriority(slug),
    })),
  ];

  return all.slice(0, SITEMAP_MAX);
}
