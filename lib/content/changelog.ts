import fs from "node:fs";
import path from "node:path";

export type ChangelogEntry = { date: string; title: string };

const FILE = path.join(process.cwd(), "content", "changelog.json");

export function getChangelogEntries(): ChangelogEntry[] {
  try {
    const raw = fs.readFileSync(FILE, "utf8");
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed
      .filter(
        (e): e is ChangelogEntry =>
          !!e &&
          typeof (e as ChangelogEntry).date === "string" &&
          typeof (e as ChangelogEntry).title === "string",
      )
      .sort((a, b) => (a.date < b.date ? 1 : -1));
  } catch {
    return [];
  }
}
