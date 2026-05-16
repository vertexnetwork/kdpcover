import { EmbedClient } from "../EmbedClient";

// The raw iframe target embedded on third-party sites. Bare layout (no site
// header/footer, frame-ancestors CSP set in next.config). Not indexed — the
// human-facing page is the /embed landing.
export const metadata = {
  title: "KDP Cover Calculator — Embed widget",
  robots: { index: false, follow: false },
};

export default async function EmbedWidgetPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const sp = await searchParams;
  const param = (k: string) => (Array.isArray(sp[k]) ? sp[k]?.[0] : sp[k]);
  const theme = param("theme") === "dark" ? "dark" : "light";
  const compact = param("compact") === "1";
  const accent = param("accent");
  const defaultFormat = param("defaultFormat") === "hardcover" ? "hardcover" : "paperback";

  return (
    <EmbedClient
      theme={theme}
      compact={compact}
      accent={typeof accent === "string" ? accent : undefined}
      defaultFormat={defaultFormat}
    />
  );
}
