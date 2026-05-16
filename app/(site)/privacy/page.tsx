import { siteConfig } from "@/lib/site-config";

export const metadata = {
  title: "Privacy Policy",
  description: `How ${siteConfig.name} handles data — short version: it doesn't collect personal data without your consent.`,
  alternates: { canonical: "/privacy" },
};

/**
 * Per-spoke privacy policy. Provider list is generated from
 * `siteConfig.features.*` so adding/removing a third party automatically
 * updates the disclosure.
 */
function activeProviders() {
  const list: { name: string; purpose: string }[] = [
    { name: "Vercel", purpose: "hosting, performance, and first-party analytics" },
  ];
  if (process.env.NEXT_PUBLIC_CLARITY_PROJECT_ID) {
    list.push({
      name: "Microsoft Clarity",
      purpose: "heatmaps and session replay (only with your cookie consent)",
    });
  }
  if (siteConfig.features.email.enabled) {
    list.push({
      name: "Resend",
      purpose:
        "stores opt-in email addresses for KDP-spec-change notifications; only used when Amazon changes a spec",
    });
  }
  if (siteConfig.monetization.gumroad.productUrl) {
    list.push({
      name: "Gumroad",
      purpose:
        "hosted checkout, payment processing, and sales tax / EU VAT (as Merchant of Record) for the template store, after you click Buy",
    });
  }
  if (siteConfig.features.ads.provider !== "none") {
    list.push({
      name: `Ad provider (${siteConfig.features.ads.provider})`,
      purpose: "displays and measures ads, only with your cookie consent",
    });
  }
  return list;
}

export default function PrivacyPage() {
  const providers = activeProviders();
  return (
    <article className="prose prose-sage mx-auto max-w-2xl px-4 py-10 sm:px-6 sm:py-14">
      <h1>Privacy Policy</h1>
      <p className="text-sm text-sage-700">
        <em>Last updated: 2026-05-15</em>
      </p>

      <h2>What we collect</h2>
      <p>
        <strong>Nothing personal.</strong> All cover calculations run entirely in your browser.
        Inputs (format, paper, page count, trim size) are stored only in the URL hash on your
        device and are never transmitted to our servers.
      </p>

      <h2>Anonymous analytics</h2>
      <p>
        We use Vercel Analytics and Vercel Speed Insights to understand aggregate usage and
        performance. These collect anonymised session data and do not identify individual users.
        Microsoft Clarity (heatmaps + session replay) is loaded only after you accept the cookie
        banner.
      </p>

      <h2>Email opt-in</h2>
      <p>
        If you submit the &ldquo;{siteConfig.features.email.leadMagnetName}&rdquo; form, your
        email address is stored in our email provider (Resend) and used <em>only</em> to notify
        you when Amazon changes a KDP spec. We do not send marketing emails, newsletters, or
        promotional content. Every email we do send includes a one-click unsubscribe link.
      </p>

      <h2>Advertising</h2>
      <p>
        {siteConfig.features.ads.provider === "none"
          ? "We do not run advertising. The site is monetised solely by sales of digital templates through Gumroad."
          : `We run ads through ${siteConfig.features.ads.provider}, gated by your cookie consent.`}
      </p>

      <h2>Data processors</h2>
      <ul>
        {providers.map((p) => (
          <li key={p.name}>
            <strong>{p.name}</strong> — {p.purpose}
          </li>
        ))}
      </ul>

      <h2>Cookies</h2>
      <p>
        We use no first-party cookies. Optional third-party cookies are gated by the consent
        banner. Gumroad sets checkout cookies only after you click a buy button. No
        cookies are set for advertising unless you opt in.
      </p>

      <h2>Your rights</h2>
      <p>
        Because we don&rsquo;t collect personal data by default, there&rsquo;s nothing to delete
        on our end. To remove your email from the KDP-spec notification list, reply
        &ldquo;unsubscribe&rdquo; to any email we send or message{" "}
        <a href={`mailto:${siteConfig.supportEmail}`}>{siteConfig.supportEmail}</a>.
      </p>

      <h2>Contact</h2>
      <p>
        <a href={`mailto:${siteConfig.supportEmail}`}>{siteConfig.supportEmail}</a>
      </p>
    </article>
  );
}
