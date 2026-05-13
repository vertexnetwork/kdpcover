import { siteConfig } from "@/lib/site-config";

export const metadata = {
  title: "Terms of Service",
  description: `Terms governing your use of ${siteConfig.name}.`,
  alternates: { canonical: "/terms" },
};

export default function TermsPage() {
  return (
    <article className="prose prose-sage mx-auto max-w-2xl px-4 py-10 sm:px-6 sm:py-14">
      <h1>Terms of Service</h1>
      <p className="text-sm text-sage-700">
        <em>Last updated: 2026-05-12</em>
      </p>

      <h2>1. The service</h2>
      <p>
        {siteConfig.name} (&ldquo;the service&rdquo;) is a free, client-side calculator for
        Amazon KDP cover dimensions, with an optional paid template-pack and affiliate links.
        It is independent and not affiliated with Amazon, Kindle Direct Publishing, or any
        KDP-related trademark.
      </p>

      <h2>2. Accuracy</h2>
      <p>
        We make every reasonable effort to keep our spine multipliers and formulas current with
        KDP&rsquo;s published specifications. KDP can change requirements at any time. Always
        verify your final cover against KDP&rsquo;s official template generator before
        submission. We are not liable for rejected uploads, printing errors, or any other
        consequence of relying on the values shown here.
      </p>

      <h2>3. Acceptable use</h2>
      <p>
        You may use the service for any lawful purpose, including commercial design work. You
        may embed the iframe widget on your site provided you do not remove the
        &ldquo;Powered by {siteConfig.name}&rdquo; attribution.
      </p>

      <h2>4. Purchases</h2>
      <p>
        Template-pack purchases are processed by Lemon Squeezy, including tax and EU VAT. The
        license permits unlimited commercial use of the included files but prohibits reselling
        the templates themselves as templates. Refunds are issued at our discretion within 14
        days of purchase.
      </p>

      <h2>5. Affiliate links</h2>
      <p>
        The Recommended page and selected CTAs may include affiliate links. We may earn a small
        commission when you sign up through these, at no extra cost to you. We only recommend
        products we have used personally on KDP projects.
      </p>

      <h2>6. No warranties</h2>
      <p>
        The service is provided &ldquo;as is&rdquo;, without warranties of any kind, express or
        implied.
      </p>

      <h2>7. Changes</h2>
      <p>
        We may update these terms at any time. Continued use after a change constitutes
        acceptance.
      </p>

      <h2>8. Contact</h2>
      <p>
        Questions? Reach us at{" "}
        <a href={`mailto:${siteConfig.supportEmail}`}>{siteConfig.supportEmail}</a>.
      </p>
    </article>
  );
}
