import { siteConfig } from "@/lib/site-config";
import { getChangelogEntries } from "@/lib/content/changelog";

export const dynamic = "force-static";

function escapeXml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

/** RFC-822 date for RSS pubDate. Changelog dates are YYYY-MM-DD (UTC midnight). */
function rfc822(date: string): string {
  return new Date(`${date}T00:00:00Z`).toUTCString();
}

/**
 * RSS 2.0 feed for the changelog. Machine-readable syndication + a freshness
 * signal for crawlers; mirrors the human /changelog page (auto-generated from
 * git). Discoverable via the <link rel="alternate"> in the root layout.
 */
export async function GET() {
  const entries = getChangelogEntries();
  const self = `${siteConfig.url}/feed.xml`;
  const changelogUrl = `${siteConfig.url}/changelog`;
  const lastBuild = entries[0] ? rfc822(entries[0].date) : new Date(0).toUTCString();

  const items = entries
    .map((e) => {
      const guid = `${changelogUrl}#${e.date}-${encodeURIComponent(e.title)}`;
      return `    <item>
      <title>${escapeXml(e.title)}</title>
      <link>${changelogUrl}</link>
      <guid isPermaLink="false">${escapeXml(guid)}</guid>
      <pubDate>${rfc822(e.date)}</pubDate>
    </item>`;
    })
    .join("\n");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${escapeXml(siteConfig.name)} — Changelog</title>
    <link>${changelogUrl}</link>
    <atom:link href="${self}" rel="self" type="application/rss+xml"/>
    <description>Release history for ${escapeXml(siteConfig.name)}.</description>
    <language>en</language>
    <lastBuildDate>${lastBuild}</lastBuildDate>
${items}
  </channel>
</rss>
`;

  return new Response(xml, {
    headers: {
      "Content-Type": "application/rss+xml; charset=utf-8",
      "Cache-Control": "public, max-age=3600, s-maxage=3600",
    },
  });
}
