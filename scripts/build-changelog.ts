/**
 * Programmatic changelog. Emits content/changelog.json (locked spec shape:
 * `{ date: "YYYY-MM-DD", title: string }[]`, sorted descending by date).
 *
 * - Runs as `prebuild`.
 * - Reads `git log --pretty=format:'%ad|%s' --date=short`.
 * - Includes every commit EXCEPT merge/dependency/chore noise (DROP). This repo
 *   writes sentence-case subjects ("Fix X", "Conversion overhaul"), not
 *   Conventional Commits, so a feat/fix/perf-only allowlist matched nothing and
 *   left the changelog empty. Denylist-by-default works with either style.
 * - Strips a Conventional Commits prefix + scope from the title when present.
 * - Idempotent and merge-safe — overwrites the JSON each build with the
 *   full computed list, since git history is the source of truth.
 *
 * Long-form release notes belong in GitHub Releases, not in this file.
 * The /changelog page header links to `siteConfig.repoUrl/releases`.
 */
import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

type Entry = { date: string; title: string };

const ROOT = process.cwd();
const OUT = path.join(ROOT, "content", "changelog.json");
// Conventional-commit prefix to strip from a title when present (cosmetic).
const STRIP_PREFIX = /^(feat|fix|perf)(\([^)]+\))?:\s*/i;
// Non-user-facing commits to exclude: merges, reverts, dependency bumps, and
// chore/ci/build/docs/test/refactor/style (conventional or sentence-case).
const DROP =
  /^(merge\b|revert\b|bump\b|consolidate dependabot|(chore|ci|build|docs|test|refactor|style)(\([^)]+\))?:?\s)/i;
const MAX_TITLE = 80;

function readLog(): Entry[] {
  try {
    execFileSync("git", ["rev-parse", "--is-inside-work-tree"], { stdio: "ignore" });
  } catch {
    return [];
  }
  let raw = "";
  try {
    // execFileSync (no shell) so the "|" in the format string is passed to git
    // literally — via a shell it would be parsed as a pipe and write 0 entries.
    raw = execFileSync("git", ["log", "--pretty=format:%ad|%s", "--date=short"], {
      encoding: "utf8",
    });
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
    if (DROP.test(subject)) continue;
    const title = subject.replace(STRIP_PREFIX, "").trim().slice(0, MAX_TITLE);
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
