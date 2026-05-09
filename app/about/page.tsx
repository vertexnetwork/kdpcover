import { siteFacts } from "@/lib/content/site-facts";
import { faqJsonLd } from "@/lib/seo/jsonld";

export const metadata = {
  title: "About",
  description: "How kdpcover.pro computes KDP spine width and cover dimensions, and where the multipliers come from.",
};

export default function AboutPage() {
  return (
    <article className="mx-auto max-w-3xl px-4 py-10 sm:px-6 sm:py-14">
      <h1 className="text-3xl sm:text-4xl">About kdpcover.pro</h1>
      <p className="mt-3 text-sage-800">
        kdpcover.pro is an independent precision calculator for Amazon KDP paperback and case-laminate hardcover covers. The KDP white-paper paperback spine width formula is 0.002252 inches per page; cream is 0.0025; standard color is 0.002252; premium color and case-laminate hardcover are both 0.002347. Multiply your interior page count by the right multiplier and you have the spine width.
      </p>

      <h2 className="mt-8 text-2xl">Methodology</h2>
      <p className="mt-2 text-sage-800">
        Every multiplier is verified against KDP&rsquo;s official cover-template generator. All math runs in your browser; nothing is uploaded. The full set of formulas lives in{" "}
        <code className="rounded bg-sage-100 px-1 py-0.5 text-xs">lib/kdp/calc.ts</code> with full unit-test coverage.
      </p>

      <h2 className="mt-8 text-2xl">Authoritative sources</h2>
      <ul className="mt-2 space-y-1 text-sm">
        {siteFacts.citations.map((c) => (
          <li key={c.url}>
            <a
              href={c.url}
              rel="cite noreferrer"
              target="_blank"
              className="text-sage-800 underline hover:text-warm-500"
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
            <dt className="font-medium text-ink">{qa.q}</dt>
            <dd className="mt-1 text-sm text-sage-800">{qa.a}</dd>
          </div>
        ))}
      </dl>

      <h2 className="mt-8 text-2xl">Contact</h2>
      <p className="mt-2 text-sage-800">
        Bugs, feature requests, or accuracy reports:{" "}
        <a href="mailto:hello@kdpcover.pro" className="underline hover:text-warm-500">
          hello@kdpcover.pro
        </a>{" "}
        or{" "}
        <a href="https://x.com/spinehero" target="_blank" rel="noreferrer" className="underline hover:text-warm-500">
          @spinehero
        </a>
        .
      </p>

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd(siteFacts.faq)) }}
      />
    </article>
  );
}
