import { getChangelogEntries } from "@/lib/content/changelog";
import { siteConfig } from "@/lib/site-config";

export const metadata = {
  title: "Changelog",
  description: `Release history for ${siteConfig.name}.`,
  alternates: { canonical: "/changelog" },
};

export default function ChangelogPage() {
  const entries = getChangelogEntries();
  return (
    <article className="mx-auto max-w-2xl px-4 py-10 sm:px-6 sm:py-14">
      <header>
        <h1 className="text-3xl sm:text-4xl">Changelog</h1>
        <p className="mt-2 text-sage-800">
          Auto-generated from git. Headers only — full release notes live on{" "}
          <a
            href={`${siteConfig.repoUrl}/releases`}
            target="_blank"
            rel="noreferrer"
            className="underline hover:text-(--color-accent)"
          >
            GitHub Releases
          </a>
          .
        </p>
        <p className="mt-1 text-xs text-sage-700">
          Source:{" "}
          <a
            href={siteConfig.repoUrl}
            target="_blank"
            rel="noreferrer"
            className="underline hover:text-(--color-accent)"
          >
            {siteConfig.repoUrl.replace("https://", "")}
          </a>
        </p>
      </header>

      {entries.length === 0 ? (
        <p className="mt-8 text-sm text-sage-700">No entries yet.</p>
      ) : (
        <ol className="mt-8 divide-y divide-sage-200/70 border-y border-sage-200/70">
          {entries.map((e, i) => (
            <li key={`${e.date}-${i}`} className="flex items-baseline gap-4 py-3">
              <time
                dateTime={e.date}
                className="tabular w-28 shrink-0 text-xs text-sage-700"
              >
                {e.date}
              </time>
              <span className="text-sm text-(--color-on-bg)">{e.title}</span>
            </li>
          ))}
        </ol>
      )}
    </article>
  );
}
