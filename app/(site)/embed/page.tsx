import type { Metadata } from "next";
import Link from "next/link";
import { Check, Code, Palette, Maximize2, ShieldCheck } from "lucide-react";
import { EmbedSnippet } from "@/components/calculator/EmbedSnippet";
import { siteConfig } from "@/lib/site-config";

const WIDGET_URL = `${siteConfig.url}${siteConfig.features.embed.route}`;

export const metadata: Metadata = {
  title: "Embed the KDP Cover Calculator on your site — free",
  description:
    "Add the free KDP cover & spine-width calculator to your blog or author site with one iframe snippet. No signup, auto-resizing, themeable. Paperback & hardcover.",
  alternates: { canonical: "/embed" },
  openGraph: {
    title: "Embed the free KDP Cover Calculator",
    description:
      "One iframe snippet adds the KDP spine-width & cover-size calculator to your site. Free, auto-resizing, themeable.",
  },
};

const PARAMS: { name: string; values: string; desc: string }[] = [
  { name: "theme", values: "light · dark", desc: "Color scheme. Defaults to light." },
  {
    name: "compact",
    values: "1",
    desc: "Condensed layout — hides the copy / share / embed row. Good for narrow sidebars.",
  },
  {
    name: "accent",
    values: "hex e.g. 2563eb",
    desc: "Override the accent color to match your brand (URL-encode the #).",
  },
  {
    name: "defaultFormat",
    values: "paperback · hardcover",
    desc: "Which format the widget opens on. Defaults to paperback.",
  },
];

const BENEFITS = [
  { icon: ShieldCheck, label: "Free forever, no signup", detail: "No API key, no account, no rate limit." },
  { icon: Maximize2, label: "Auto-resizing", detail: "Posts its height to the parent so there's no inner scrollbar." },
  { icon: Palette, label: "Themeable", detail: "Light/dark and a custom accent color via URL params." },
  { icon: Code, label: "One snippet", detail: "Paste the iframe + 6-line resize script and you're done." },
];

export default function EmbedLandingPage() {
  return (
    <article className="mx-auto max-w-5xl px-4 py-10 sm:px-6 sm:py-14">
      <header className="max-w-3xl">
        <p className="text-xs uppercase tracking-wide text-(--color-accent)">Embed</p>
        <h1 className="mt-2 text-3xl leading-tight sm:text-5xl">
          Put the KDP Cover Calculator on your site
        </h1>
        <p className="mt-4 text-base text-sage-800 sm:text-lg">
          Give your readers the same spine-width and full-cover math, embedded right in your blog
          post, author site, or course. One iframe snippet — free, auto-resizing, and themeable to
          your brand.
        </p>
      </header>

      <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {BENEFITS.map((b) => (
          <div key={b.label} className="rounded-card border border-sage-200 bg-(--color-surface) p-4">
            <b.icon className="h-5 w-5 text-sage-600" aria-hidden />
            <div className="mt-2 text-sm font-medium text-(--color-on-bg)">{b.label}</div>
            <div className="mt-0.5 text-sm text-sage-700">{b.detail}</div>
          </div>
        ))}
      </div>

      <section className="mt-12 grid gap-8 lg:grid-cols-[1fr_1fr]">
        <div>
          <h2 className="text-2xl">Copy the snippet</h2>
          <p className="mt-2 text-sm text-sage-800">
            Paste this where you want the calculator to appear. The small script lets the iframe
            resize itself so there&rsquo;s no inner scrollbar.
          </p>
          <div className="mt-4">
            <EmbedSnippet />
          </div>
          <p className="mt-4 text-xs text-sage-700">
            The widget keeps a small &ldquo;Powered by kdpcover.pro&rdquo; link — please leave it in
            place (see <Link href="/terms" className="underline hover:text-(--color-accent)">Terms</Link>).
          </p>
        </div>

        <div>
          <h2 className="text-2xl">Live preview</h2>
          <p className="mt-2 text-sm text-sage-800">
            This is the real widget, embedded exactly as the snippet would render it.
          </p>
          <div className="mt-4 overflow-hidden rounded-card border border-sage-200 bg-(--color-surface)">
            <iframe
              src={`${siteConfig.features.embed.route}?theme=light`}
              width="100%"
              height={640}
              style={{ border: 0 }}
              loading="lazy"
              title="KDP Cover Calculator preview"
            />
          </div>
        </div>
      </section>

      <section className="mt-14 max-w-3xl">
        <h2 className="text-2xl">Customize it</h2>
        <p className="mt-2 text-sm text-sage-800">
          Append query parameters to the iframe <code className="rounded bg-sage-100 px-1 py-0.5 text-xs">src</code>{" "}
          (<code className="rounded bg-sage-100 px-1 py-0.5 text-xs">{WIDGET_URL}</code>):
        </p>
        <div className="mt-4 overflow-x-auto rounded-card border border-sage-200 bg-white">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs uppercase tracking-wide text-sage-700">
                <th className="px-4 py-2 font-medium">Parameter</th>
                <th className="px-4 py-2 font-medium">Values</th>
                <th className="px-4 py-2 font-medium">Effect</th>
              </tr>
            </thead>
            <tbody>
              {PARAMS.map((p, i) => (
                <tr key={p.name} className={i % 2 === 0 ? "bg-sage-50/40" : ""}>
                  <td className="px-4 py-2 font-mono text-xs text-(--color-on-bg)">{p.name}</td>
                  <td className="px-4 py-2 font-mono text-xs text-sage-700">{p.values}</td>
                  <td className="px-4 py-2 text-sage-800">{p.desc}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="mt-4 text-sm text-sage-700">
          Example:{" "}
          <code className="rounded bg-sage-100 px-1 py-0.5 text-xs">
            {siteConfig.features.embed.route}?theme=dark&amp;compact=1&amp;defaultFormat=hardcover
          </code>
        </p>
      </section>

      <section className="mt-14 max-w-3xl">
        <h2 className="text-2xl">Common questions</h2>
        <dl className="mt-4 space-y-5">
          <div>
            <dt className="font-medium text-(--color-on-bg)">Does it cost anything?</dt>
            <dd className="mt-1 text-sm text-sage-800">
              No. The embed is free with no signup or usage limit. We monetize through the optional{" "}
              <Link href="/templates" className="underline hover:text-(--color-accent)">
                template pack
              </Link>
              , not the calculator.
            </dd>
          </div>
          <div>
            <dt className="font-medium text-(--color-on-bg)">Will it slow down my page?</dt>
            <dd className="mt-1 text-sm text-sage-800">
              The iframe is{" "}
              <code className="rounded bg-sage-100 px-1 py-0.5 text-xs">loading=&quot;lazy&quot;</code>{" "}
              so it only loads when scrolled near. All calculation runs inside the iframe — nothing
              touches your page&rsquo;s JavaScript.
            </dd>
          </div>
          <div>
            <dt className="font-medium text-(--color-on-bg)">Can I remove the attribution?</dt>
            <dd className="mt-1 text-sm text-sage-800">
              Please keep the small &ldquo;Powered by kdpcover.pro&rdquo; link — it&rsquo;s the only
              thing we ask in exchange for the free widget, per our{" "}
              <Link href="/terms" className="underline hover:text-(--color-accent)">
                Terms
              </Link>
              .
            </dd>
          </div>
        </dl>
      </section>

      <p className="mt-12 text-sm text-sage-700">
        Prefer it on every page automatically? There&rsquo;s also a{" "}
        <Link href="/extension" className="underline hover:text-(--color-accent)">
          Chrome extension
        </Link>
        . Or just use the{" "}
        <Link href="/" className="underline hover:text-(--color-accent)">
          full calculator
        </Link>
        .
      </p>
    </article>
  );
}
