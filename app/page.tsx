import { Calculator } from "@/components/calculator/Calculator";
import { siteFacts } from "@/lib/content/site-facts";
import { faqJsonLd, softwareAppJsonLd, organizationJsonLd } from "@/lib/seo/jsonld";
import { DeferredAdSlot } from "@/components/site/DeferredAdSlot";
import { ShieldCheck } from "lucide-react";

export default function HomePage() {
  return (
    <>
      <section className="mx-auto max-w-6xl px-4 pb-12 pt-6 sm:px-6 sm:pt-12">
        <div className="mb-5 max-w-2xl sm:mb-8">
          <h1 className="text-3xl leading-tight sm:text-5xl">
            Pass KDP&rsquo;s review on the first try.
          </h1>
          <p className="mt-3 text-sm text-sage-800 sm:text-lg">
            Spine width, full-cover dimensions, and safe-zone diagrams — instant, in-browser.
          </p>
          <p className="mt-3 inline-flex items-center gap-1.5 rounded-full border border-sage-200 bg-sage-50 px-2.5 py-1 text-xs text-sage-800">
            <ShieldCheck className="h-3.5 w-3.5 text-sage-600" aria-hidden />
            Multipliers verified against KDP&rsquo;s official template generator
          </p>
        </div>

        <Calculator />

        <DeferredAdSlot slot="below-results" className="mt-8" />
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
