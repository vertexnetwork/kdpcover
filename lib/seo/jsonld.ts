import { siteConfig } from "@/lib/site-config";
import { siteFacts } from "@/lib/content/site-facts";
import type { Sku } from "@/lib/templates/catalog";
import { STORE_PATH } from "@/lib/templates/catalog";
import { loadSisterSites } from "@/lib/network";

type FaqLike = { q: string; a: string };

const SITE_URL = siteConfig.url;

export function websiteJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: siteConfig.name,
    url: SITE_URL,
    description: siteConfig.description,
    inLanguage: "en",
    potentialAction: {
      "@type": "SearchAction",
      target: `${SITE_URL}/calculator/{search_term_string}`,
      "query-input": "required name=search_term_string",
    },
  };
}

export function organizationJsonLd() {
  const sisterSites = loadSisterSites().map((s) => s.url);
  // External identity first (Knowledge-Graph reconciliation), then the owned
  // Vertex Network spokes as related properties.
  const sameAs = ["https://github.com/vertexnetwork", ...sisterSites];
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: siteConfig.name,
    url: SITE_URL,
    logo: `${SITE_URL}/icon-512.png`,
    sameAs,
  };
}

export function softwareAppJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": siteConfig.jsonLd.type,
    name: "KDP Cover & Spine Width Calculator",
    url: SITE_URL,
    applicationCategory: siteConfig.jsonLd.applicationCategory,
    operatingSystem: siteConfig.jsonLd.operatingSystem,
    offers: { "@type": "Offer", price: String(siteConfig.jsonLd.price), priceCurrency: "USD" },
    description: siteFacts.site.description,
    publisher: {
      "@type": "Organization",
      name: siteConfig.name,
      url: SITE_URL,
    },
  };
}

export function productJsonLd(sku: Sku) {
  return {
    "@context": "https://schema.org",
    "@type": "Product",
    name: sku.name,
    description: sku.hook,
    brand: {
      "@type": "Brand",
      name: siteConfig.name,
    },
    category: "DigitalGood",
    offers: {
      "@type": "Offer",
      url: `${SITE_URL}${STORE_PATH}/${sku.slug}`,
      price: sku.priceUsd.toFixed(2),
      priceCurrency: "USD",
      availability: "https://schema.org/InStock",
      itemCondition: "https://schema.org/NewCondition",
    },
  };
}

export function faqJsonLd(faq: readonly FaqLike[], speakableSelectors?: string[]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    // Voice-assistant hint (VEO): which DOM regions hold spoken-answer text.
    ...(speakableSelectors?.length
      ? { speakable: { "@type": "SpeakableSpecification", cssSelector: speakableSelectors } }
      : {}),
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

export function networkCollectionJsonLd() {
  const sites = loadSisterSites();
  return {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: "Vertex Network",
    url: `${SITE_URL}/network`,
    isPartOf: { "@type": "WebSite", name: siteConfig.name, url: SITE_URL },
    hasPart: sites.map((s) => ({
      "@type": "WebSite",
      name: s.name,
      url: s.url,
      description: s.description,
    })),
  };
}
