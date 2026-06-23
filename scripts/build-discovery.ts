/**
 * Materialises HUB-templated discovery files into public/ with per-site
 * substitutions. Idempotent; runs at `prebuild`.
 *
 *   public/.well-known/security.txt  ← Contact + Expires from siteConfig.security
 *   public/humans.txt                ← Last update from now()
 *   public/ai.txt                    ← AI-usage policy, synced from ai-bots.json
 *   public/trust.txt                 ← + /.well-known/trust.txt, from siteConfig
 *
 * `public/ads.txt`, `public/app-ads.txt`, `public/network.json`,
 * `public/ai-bots.json` are synced verbatim from the hub by
 * .github/workflows/sync-from-hub.yml — this script does not rewrite them.
 */
import fs from "node:fs";
import path from "node:path";
import { siteConfig } from "../lib/site-config";
import { siteFacts } from "../lib/content/site-facts";

const ROOT = process.cwd();

type AiBotsFile = { allow?: string[]; disallow?: string[] };

function readAiBots(): AiBotsFile {
  try {
    return JSON.parse(
      fs.readFileSync(path.join(ROOT, "public", "ai-bots.json"), "utf8"),
    ) as AiBotsFile;
  } catch {
    return { allow: [], disallow: [] };
  }
}

function writeIfChanged(p: string, contents: string): void {
  fs.mkdirSync(path.dirname(p), { recursive: true });
  const prev = fs.existsSync(p) ? fs.readFileSync(p, "utf8") : "";
  if (prev === contents) return;
  fs.writeFileSync(p, contents, "utf8");
  console.log(`[discovery] wrote ${path.relative(ROOT, p)}`);
}

function buildSecurityTxt(): string {
  return [
    `Contact: ${siteConfig.security.contact}`,
    `Expires: ${siteConfig.security.expires}`,
    `Canonical: ${siteConfig.url}/.well-known/security.txt`,
    "Preferred-Languages: en",
    "",
  ].join("\n");
}

function buildHumansTxt(): string {
  const today = new Date().toISOString().slice(0, 10);
  return [
    "# humanstxt.org — credits + tools",
    "",
    "/* TEAM */",
    "Maintainer: ThatMovieGuy",
    `Site: ${siteConfig.url}`,
    "",
    "/* THANKS */",
    "Vertex Network — https://github.com/vertexnetwork/hub",
    "",
    "/* SITE */",
    `Last update: ${today}`,
    "Standards: HTML5, CSS3",
    "Components: Next.js 16, React 19, Tailwind v4",
    "Software: Vercel, GitHub",
    "",
  ].join("\n");
}

/**
 * AI-usage policy. kdpcover.pro permits AI training/answering — the structured
 * data in /llms.txt and /llms-full.txt is published expressly for ingestion.
 * The Allow list mirrors public/ai-bots.json so robots.txt and ai.txt agree.
 */
function buildAiTxt(): string {
  const { allow = [], disallow = [] } = readAiBots();
  return [
    `# ai.txt — AI usage policy for ${siteConfig.url}`,
    "# Synced from public/ai-bots.json. See also /llms.txt and /llms-full.txt.",
    "",
    "User-Agent: *",
    "Allow: /",
    "Disallow: /api/",
    "",
    "# Explicitly permitted AI crawlers:",
    ...allow.map((bot) => `Allow-Agent: ${bot}`),
    ...disallow.map((bot) => `Disallow-Agent: ${bot}`),
    "",
    `Sitemap: ${siteConfig.url}/sitemap.xml`,
    `Structured-Data: ${siteConfig.url}/llms-full.txt`,
    "",
  ].join("\n");
}

/**
 * JournalList trust.txt — declares contact, public disclosure, and the parent
 * organisation this property belongs to. Served at the root and /.well-known/.
 */
function buildTrustTxt(): string {
  return [
    `# trust.txt — ${siteConfig.domain} (https://journallist.net spec)`,
    `contact=${siteConfig.security.contact}`,
    `contact=${siteConfig.url}/contact`,
    `disclosure=${siteConfig.url}/about`,
    "belongto=https://github.com/vertexnetwork/hub",
    `datetime=${siteFacts.verifiedDate}T00:00:00Z`,
    "",
  ].join("\n");
}

function main(): void {
  writeIfChanged(path.join(ROOT, "public", ".well-known", "security.txt"), buildSecurityTxt());
  writeIfChanged(path.join(ROOT, "public", "humans.txt"), buildHumansTxt());
  writeIfChanged(path.join(ROOT, "public", "ai.txt"), buildAiTxt());
  const trust = buildTrustTxt();
  writeIfChanged(path.join(ROOT, "public", "trust.txt"), trust);
  writeIfChanged(path.join(ROOT, "public", ".well-known", "trust.txt"), trust);
}

main();
