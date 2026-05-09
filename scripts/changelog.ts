/**
 * Programmatic changelog generator.
 *
 * Runs as `prebuild` hook. Reads `git log` since the last existing entry,
 * filters to user-facing prefixes (feat/fix/perf), and writes one MDX
 * file per qualifying commit at content/changelog/<date>-<slug>.mdx with
 * frontmatter `{ date, title }`. Empty body — titles only.
 *
 * Idempotent: never overwrites existing files.
 */
import { execSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

const ROOT = process.cwd();
const OUT_DIR = path.join(ROOT, "content", "changelog");

const KEEP_PREFIX_RE = /^(feat|fix|perf)(\([^)]+\))?:\s*/i;

function ensureDir() {
  fs.mkdirSync(OUT_DIR, { recursive: true });
}

function isGitRepo(): boolean {
  try {
    execSync("git rev-parse --is-inside-work-tree", { stdio: "ignore" });
    return true;
  } catch {
    return false;
  }
}

function readGitLog(): { hash: string; date: string; subject: string }[] {
  try {
    const raw = execSync('git log --pretty=format:"%H|%aI|%s"', { encoding: "utf8" });
    return raw
      .split("\n")
      .filter(Boolean)
      .map((line) => {
        const [hash, isoDate, ...rest] = line.split("|");
        return { hash, date: isoDate.slice(0, 10), subject: rest.join("|") };
      });
  } catch {
    return [];
  }
}

function slugify(s: string): string {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 60);
}

function existingSlugs(): Set<string> {
  if (!fs.existsSync(OUT_DIR)) return new Set();
  return new Set(
    fs.readdirSync(OUT_DIR).filter((f) => f.endsWith(".mdx")).map((f) => f.replace(/\.mdx$/, "")),
  );
}

function main() {
  ensureDir();
  if (!isGitRepo()) {
    console.warn("[changelog] not a git repo — skipping generation");
    return;
  }
  const commits = readGitLog();
  const existing = existingSlugs();
  let written = 0;

  for (const c of commits) {
    if (!KEEP_PREFIX_RE.test(c.subject)) continue;
    const title = c.subject.replace(KEEP_PREFIX_RE, "").trim();
    const slug = `${c.date}-${slugify(title)}-${c.hash.slice(0, 7)}`;
    if (existing.has(slug)) continue;
    const filePath = path.join(OUT_DIR, `${slug}.mdx`);
    const fm = `---\ndate: ${c.date}\ntitle: "${title.replace(/"/g, '\\"')}"\n---\n`;
    fs.writeFileSync(filePath, fm, "utf8");
    written++;
  }

  console.log(`[changelog] wrote ${written} new entries`);
}

main();
