import { Calculator } from "@/components/calculator/Calculator";
import { siteFacts } from "@/lib/content/site-facts";
import { faqJsonLd, softwareAppJsonLd, organizationJsonLd } from "@/lib/seo/jsonld";
import { AdSlot } from "@/components/site/AdSlot";

export default function HomePage() {
  return (
    <>
      <section className="mx-auto max-w-6xl px-4 pb-12 pt-10 sm:px-6 sm:pt-16">
        <div className="mb-8 max-w-2xl">
          <h1 className="text-4xl leading-tight sm:text-5xl">
            Pass KDP&rsquo;s review on the first try.
          </h1>
          <p className="mt-4 text-base text-sage-800 sm:text-lg">
            Precision spine width, full-cover dimensions, and safe-zone diagrams for
            Amazon paperback and case-laminate hardcover books. All math is local
            to your browser — no upload, no account.
          </p>
        </div>

        <Calculator />

        <AdSlot slot="below-results" className="mt-8" />
      </section>

      <section className="mx-auto max-w-3xl px-4 pb-16 sm:px-6">
        <h2 className="mb-4 text-2xl">Frequently asked</h2>
        <dl className="space-y-6">
          {siteFacts.faq.map((qa) => (
            <div key={qa.q}>
              <dt className="font-medium text-ink">{qa.q}</dt>
              <dd className="mt-1 text-sm text-sage-800">{qa.a}</dd>
            </div>
          ))}
        </dl>
      </section>

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(softwareAppJsonLd()) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd(siteFacts.faq)) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd()) }}
      />
    </>
  );
}
