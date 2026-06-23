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
        <em>Last updated: 2026-05-15</em>
      </p>

      <h2>1. The service</h2>
      <p>
        {siteConfig.name} (&ldquo;the service&rdquo;) is a free, client-side calculator for
        Amazon KDP cover dimensions, with an optional paid file-check tool (Cover Pass-Check), a
        bundled template pack, and affiliate links. It is independent and not affiliated with
        Amazon, Kindle Direct Publishing, or any KDP-related trademark.
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
        Cover Pass-Check (and its bundled template pack) is sold through Gumroad as Merchant of
        Record, including sales tax and EU VAT. A purchase grants a personal license to use the
        tool and the included files; the template license permits unlimited commercial use (covers
        for unlimited books on KDP, IngramSpark, or elsewhere) but prohibits reselling or
        redistributing the templates themselves as templates. We offer a no-questions-asked refund
        within 7 days of purchase — email your receipt and we will process it.
      </p>
      <p>
        <strong>Cover Pass-Check is an automated advisory tool.</strong> It checks measurable
        properties of the file you provide (dimensions, bleed, resolution, embedded fonts, color
        space, page count, and file size) against KDP&rsquo;s published specifications and the book
        details you enter. A &ldquo;pass&rdquo; result means those measured properties match the
        expected spec; it is <em>not</em> a guarantee that Amazon KDP will accept your cover, which
        also depends on your artwork, content, and KDP&rsquo;s own review. You remain responsible
        for your final file.
      </p>

      <h2>5. Outbound links</h2>
      <p>
        We do not run advertising. Some outbound links may occasionally be affiliate links; where
        they are, we may earn a small commission at no extra cost to you, and only for tools we
        have used personally on KDP projects.
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
