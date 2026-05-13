/**
 * Programmatic changelog. Emits content/changelog.json (locked spec shape:
 * `{ date: "YYYY-MM-DD", title: string }[]`, sorted descending by date).
 *
 * - Runs as `prebuild`.
 * - Reads `git log --pretty=format:'%ad|%s' --date=short`.
 * - Filters to user-facing prefixes (feat/fix/perf).
 * - Strips Conventional Commits prefix and scope from the title.
 * - Idempotent and merge-safe — overwrites the JSON each build with the
 *   full computed list, since git history is the source of truth.
 *
 * Long-form release notes belong in GitHub Releases, not in this file.
 * The /changelog page header links to `siteConfig.repoUrl/releases`.
 */
import { execSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

type Entry = { date: string; title: string };

const ROOT = process.cwd();
const OUT = path.join(ROOT, "content", "changelog.json");
const KEEP = /^(feat|fix|perf)(\([^)]+\))?:\s*/i;
const MAX_TITLE = 80;

function readLog(): Entry[] {
  try {
    execSync("git rev-parse --is-inside-work-tree", { stdio: "ignore" });
  } catch {
    return [];
  }
  let raw = "";
  try {
    raw = execSync("git log --pretty=format:%ad|%s --date=short", { encoding: "utf8" });
  } catch {
    return [];
  }
  const entries: Entry[] = [];
  for (const line of raw.split("\n")) {
    if (!line) continue;
    const sep = line.indexOf("|");
    if (sep < 0) continue;
    const date = line.slice(0, sep);
    const subject = line.slice(sep + 1);
    if (!KEEP.test(subject)) continue;
    const title = subject.replace(KEEP, "").trim().slice(0, MAX_TITLE);
    if (!title) continue;
    entries.push({ date, title });
  }
  return entries.sort((a, b) => (a.date < b.date ? 1 : -1));
}

function main(): void {
  fs.mkdirSync(path.dirname(OUT), { recursive: true });
  const entries = readLog();
  fs.writeFileSync(OUT, JSON.stringify(entries, null, 2) + "\n", "utf8");
  console.log(`[changelog] wrote ${entries.length} entries to ${path.relative(ROOT, OUT)}`);
}

main();
