/**
 * Materialises HUB-templated discovery files into public/ with per-site
 * substitutions. Idempotent; runs at `prebuild`.
 *
 *   public/.well-known/security.txt  ← Contact + Expires from siteConfig.security
 *   public/humans.txt                ← Last update from now()
 *
 * `public/ads.txt`, `public/app-ads.txt`, `public/network.json`,
 * `public/ai-bots.json` are synced verbatim from the hub by
 * .github/workflows/sync-from-hub.yml — this script does not rewrite them.
 */
import fs from "node:fs";
import path from "node:path";
import { siteConfig } from "../lib/site-config";

const ROOT = process.cwd();

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
    "Components: Next.js 15, React 19, Tailwind v4",
    "Software: Vercel, GitHub",
    "",
  ].join("\n");
}

function main(): void {
  writeIfChanged(path.join(ROOT, "public", ".well-known", "security.txt"), buildSecurityTxt());
  writeIfChanged(path.join(ROOT, "public", "humans.txt"), buildHumansTxt());
}

main();
