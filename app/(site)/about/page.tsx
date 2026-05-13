import { siteFacts } from "@/lib/content/site-facts";
import { faqJsonLd } from "@/lib/seo/jsonld";
import { siteConfig } from "@/lib/site-config";
import { EmailCaptureForm } from "@/components/email/EmailCaptureForm";

export const metadata = {
  title: "About",
  description: `How ${siteConfig.name} computes KDP spine width and cover dimensions, and where the multipliers come from.`,
  alternates: { canonical: "/about" },
};

export default function AboutPage() {
  return (
    <article className="mx-auto max-w-3xl px-4 py-10 sm:px-6 sm:py-14">
      <h1 className="text-3xl sm:text-4xl">About {siteConfig.name}</h1>
      <p className="mt-3 text-sage-800">
        {siteConfig.name} is an independent precision calculator for Amazon KDP paperback and
        case-laminate hardcover covers. The KDP white-paper paperback spine width formula is
        0.002252 inches per page; cream is 0.0025; standard color is 0.002252; premium color and
        case-laminate hardcover are both 0.002347. Multiply your interior page count by the right
        multiplier and you have the spine width.
      </p>

      <h2 className="mt-8 text-2xl">Methodology</h2>
      <p className="mt-2 text-sage-800">
        Every multiplier is verified against KDP&rsquo;s official cover-template generator. All
        math runs in your browser; nothing is uploaded. The full set of formulas lives in{" "}
        <code className="rounded bg-sage-100 px-1 py-0.5 text-xs">lib/kdp/calc.ts</code> with full
        unit-test coverage.
      </p>

      <h2 className="mt-8 text-2xl">Authoritative sources</h2>
      <ul className="mt-2 space-y-1 text-sm">
        {siteFacts.citations.map((c) => (
          <li key={c.url}>
            <a
              href={c.url}
              rel="cite noreferrer"
              target="_blank"
              className="text-sage-800 underline hover:text-(--color-accent)"
            >
              {c.label}
            </a>
          </li>
        ))}
      </ul>

      <h2 className="mt-8 text-2xl">FAQ</h2>
      <dl className="mt-3 space-y-5">
        {siteFacts.faq.map((qa) => (
          <div key={qa.q}>
            <dt className="font-medium text-(--color-on-bg)">{qa.q}</dt>
            <dd className="mt-1 text-sm text-sage-800">{qa.a}</dd>
          </div>
        ))}
      </dl>

      <h2 className="mt-8 text-2xl">Contact</h2>
      <p className="mt-2 text-sage-800">
        Bugs, feature requests, or accuracy reports:{" "}
        <a
          href={`mailto:${siteConfig.supportEmail}`}
          className="underline hover:text-(--color-accent)"
        >
          {siteConfig.supportEmail}
        </a>
        .
      </p>

      <EmailCaptureForm source="about" className="mt-10" />

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd(siteFacts.faq)) }}
      />
    </article>
  );
}
