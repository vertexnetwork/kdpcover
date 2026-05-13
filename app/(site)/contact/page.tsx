import { siteConfig } from "@/lib/site-config";

export const metadata = {
  title: "Contact",
  description: `Contact ${siteConfig.name}. Bug reports, KDP-spec corrections, and feature requests are welcome.`,
  alternates: { canonical: "/contact" },
};

export default function ContactPage() {
  return (
    <article className="mx-auto max-w-2xl px-4 py-10 sm:px-6 sm:py-14">
      <h1 className="text-3xl sm:text-4xl">Contact</h1>
      <p className="mt-3 text-sage-800">
        {siteConfig.name} is built and maintained by one person. Email is the fastest way to
        reach me — typical response within a couple of business days.
      </p>

      <div className="mt-8 rounded-card border border-(--color-border)/80 bg-(--color-surface) p-5">
        <p className="text-xs uppercase tracking-wide text-sage-700">Email</p>
        <p className="mt-1 text-lg">
          <a
            href={`mailto:${siteConfig.supportEmail}`}
            className="font-medium text-(--color-on-bg) underline-offset-2 hover:text-(--color-accent) hover:underline"
          >
            {siteConfig.supportEmail}
          </a>
        </p>
      </div>

      <h2 className="mt-12 text-xl">What kinds of email I read first</h2>
      <ul className="mt-3 space-y-2 text-sm text-sage-800">
        <li>
          <span className="font-medium text-(--color-on-bg)">KDP-spec corrections.</span> If
          Amazon changed a multiplier, bleed, hinge, or barcode rule and the site still shows the
          old value — please send the official KDP page so I can update.
        </li>
        <li>
          <span className="font-medium text-(--color-on-bg)">Calculation bugs.</span> Include
          format, paper, page count, and trim — and what KDP&rsquo;s template generator says for
          the same inputs.
        </li>
        <li>
          <span className="font-medium text-(--color-on-bg)">Template-pack feedback.</span> If
          you bought the bundle and a file is missing or off-spec, attach the receipt and the
          specific file.
        </li>
        <li>
          <span className="font-medium text-(--color-on-bg)">Security issues.</span> Use{" "}
          <a href={siteConfig.security.contact} className="underline hover:text-(--color-accent)">
            {siteConfig.security.contact.replace("mailto:", "")}
          </a>{" "}
          — see{" "}
          <a
            href="/.well-known/security.txt"
            className="underline hover:text-(--color-accent)"
          >
            /.well-known/security.txt
          </a>
          .
        </li>
      </ul>
    </article>
  );
}
