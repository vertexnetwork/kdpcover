import { siteFacts, type FaqEntry } from "@/lib/content/site-facts";

const SITE_URL = siteFacts.site.url;

export function softwareAppJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: "KDP Cover & Spine Width Calculator",
    url: SITE_URL,
    applicationCategory: "DesignApplication",
    operatingSystem: "Any (web)",
    offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
    description: siteFacts.site.description,
    publisher: {
      "@type": "Organization",
      name: siteFacts.site.name,
      url: SITE_URL,
    },
  };
}

export function organizationJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: siteFacts.site.name,
    url: SITE_URL,
    sameAs: ["https://x.com/spinehero"],
  };
}

export function faqJsonLd(faq: readonly FaqEntry[]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faq.map((qa) => ({
      "@type": "Question",
      name: qa.q,
      acceptedAnswer: { "@type": "Answer", text: qa.a },
    })),
  };
}

export function howToJsonLd(opts: {
  name: string;
  description: string;
  steps: { name: string; text: string }[];
}) {
  return {
    "@context": "https://schema.org",
    "@type": "HowTo",
    name: opts.name,
    description: opts.description,
    step: opts.steps.map((s, i) => ({
      "@type": "HowToStep",
      position: i + 1,
      name: s.name,
      text: s.text,
    })),
  };
}

export function breadcrumbJsonLd(items: { name: string; url: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((it, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: it.name,
      item: it.url,
    })),
  };
}
