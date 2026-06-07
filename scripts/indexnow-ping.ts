/**
 * IndexNow ping — notifies Bing/Yandex (and partners) that key URLs changed.
 *
 * Opt-in: only runs when INDEXNOW_ENABLED=1, so it never breaks CI for
 * unrelated builds or runs without network. Wire into a deploy hook, e.g.:
 *
 *   INDEXNOW_ENABLED=1 npx tsx scripts/indexnow-ping.ts
 *
 * The key file public/{KEY}.txt must be deployed and reachable at
 * https://kdpcover.pro/{KEY}.txt for IndexNow to accept the submission.
 */
import { siteConfig } from "../lib/site-config";

const KEY = "ce29a3cc318c158cdc940aa44e8da46b";

// High-value, stable URLs. pSEO spokes are discovered via sitemap.xml; this
// list is the hub surface worth pinging on every content deploy.
const URLS = [
  "/",
  "/about",
  "/guide",
  "/templates",
  "/embed",
  "/changelog",
].map((p) => `${siteConfig.url}${p}`);

async function main(): Promise<void> {
  if (process.env.INDEXNOW_ENABLED !== "1") {
    console.log("[indexnow] skipped (set INDEXNOW_ENABLED=1 to submit)");
    return;
  }

  const host = new URL(siteConfig.url).host;
  const body = {
    host,
    key: KEY,
    keyLocation: `${siteConfig.url}/${KEY}.txt`,
    urlList: URLS,
  };

  const res = await fetch("https://api.indexnow.org/IndexNow", {
    method: "POST",
    headers: { "Content-Type": "application/json; charset=utf-8" },
    body: JSON.stringify(body),
  });

  console.log(`[indexnow] submitted ${URLS.length} URLs → ${res.status} ${res.statusText}`);
  if (!res.ok) process.exitCode = 1;
}

void main();
