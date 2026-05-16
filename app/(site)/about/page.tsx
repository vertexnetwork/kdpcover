import Link from "next/link";
import { siteFacts } from "@/lib/content/site-facts";
import { siteConfig } from "@/lib/site-config";
import { EmailCaptureForm } from "@/components/email/EmailCaptureForm";

export const metadata = {
  title: "Methodology & Sources",
  description: `How ${siteConfig.name} computes KDP spine width and cover dimensions, and the official Amazon sources behind every multiplier.`,
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

      <p className="mt-8 text-sage-800">
        Common questions about spine width, bleed, trim sizes, and KDP rejections are answered on
        the{" "}
        <Link href="/" className="underline hover:text-(--color-accent)">
          KDP cover calculator
        </Link>{" "}
        itself, alongside the live tool.
      </p>

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
    </article>
  );
}
