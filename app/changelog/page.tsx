import { getChangelogEntries } from "@/lib/content/changelog";

export const metadata = {
  title: "Changelog",
  description: "Release history for kdpcover.pro.",
};

export default function ChangelogPage() {
  const entries = getChangelogEntries();
  return (
    <article className="mx-auto max-w-2xl px-4 py-10 sm:px-6 sm:py-14">
      <h1 className="text-3xl sm:text-4xl">Changelog</h1>
      <p className="mt-2 text-sage-800">
        Auto-generated from each build. Titles only — see the repo for diffs.
      </p>

      {entries.length === 0 ? (
        <p className="mt-6 text-sm text-sage-700">No entries yet.</p>
      ) : (
        <ol className="mt-6 divide-y divide-sage-200/70 border-y border-sage-200/70">
          {entries.map((e) => (
            <li key={e.slug} className="flex items-baseline gap-4 py-3">
              <time dateTime={e.date} className="tabular w-28 shrink-0 text-xs text-sage-700">
                {e.date}
              </time>
              <span className="text-sm text-ink">{e.title}</span>
            </li>
          ))}
        </ol>
      )}
    </article>
  );
}
