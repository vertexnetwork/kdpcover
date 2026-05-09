import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";

export type ChangelogEntry = {
  slug: string;
  date: string;
  title: string;
};

const CHANGELOG_DIR = path.join(process.cwd(), "content", "changelog");

export function getChangelogEntries(): ChangelogEntry[] {
  if (!fs.existsSync(CHANGELOG_DIR)) return [];
  const files = fs
    .readdirSync(CHANGELOG_DIR)
    .filter((f) => f.endsWith(".mdx") || f.endsWith(".md"));

  const entries = files.map((f) => {
    const raw = fs.readFileSync(path.join(CHANGELOG_DIR, f), "utf8");
    const fm = matter(raw);
    const date = String(fm.data.date ?? "");
    const title = String(fm.data.title ?? f.replace(/\.(mdx?|md)$/, ""));
    return { slug: f.replace(/\.(mdx?|md)$/, ""), date, title };
  });

  return entries.sort((a, b) => (a.date < b.date ? 1 : -1));
}
