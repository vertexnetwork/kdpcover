import { EmbedClient } from "./EmbedClient";

export const metadata = {
  title: "Embed",
  robots: { index: false, follow: false },
};

export default async function EmbedPage({
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
