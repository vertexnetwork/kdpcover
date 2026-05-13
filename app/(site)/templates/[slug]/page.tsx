import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Check, ChevronLeft, ShieldCheck } from "lucide-react";
import { CATALOG, STORE_PATH, getSku } from "@/lib/templates/catalog";
import { resolveCheckout } from "@/lib/templates/checkout";
import { BuyButton, CheckoutTrust } from "@/components/templates/BuyButton";
import { breadcrumbJsonLd, productJsonLd, faqJsonLd } from "@/lib/seo/jsonld";
import { siteConfig } from "@/lib/site-config";

type Params = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  return CATALOG.map((s) => ({ slug: s.slug }));
}

export const dynamicParams = false;

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params;
  const sku = getSku(slug);
  if (!sku) return { title: "Not found" };
  const title = `${sku.name} — $${sku.priceUsd} · KDP-spec cover templates`;
  return {
    title,
    description: sku.hook,
    alternates: { canonical: `${STORE_PATH}/${sku.slug}` },
    openGraph: { title, description: sku.hook, type: "website" },
  };
}

export default async function ProductPage({ params }: Params) {
  const { slug } = await params;
  const sku = getSku(slug);
  if (!sku) notFound();

  const checkout = resolveCheckout(sku);
  const checkoutUrl = checkout.status === "ready" ? checkout.url : null;

  const breadcrumb = breadcrumbJsonLd([
    { name: "Templates", url: `${siteConfig.url}${STORE_PATH}` },
    { name: sku.name, url: `${siteConfig.url}${STORE_PATH}/${sku.slug}` },
  ]);
  const product = productJsonLd(sku);
  const faq = faqJsonLd(sku.faq);

  return (
    <article className="mx-auto max-w-5xl px-4 py-10 sm:px-6 sm:py-14">
      <Link
        href={STORE_PATH}
        className="inline-flex items-center gap-1 text-xs text-sage-700 hover:text-(--color-accent)"
      >
        <ChevronLeft className="h-3.5 w-3.5" aria-hidden />
        All templates
      </Link>

      <div className="mt-6 grid gap-10 lg:grid-cols-[1.4fr_1fr]">
        <header>
          {sku.highlight && (
            <span className="mb-3 inline-flex items-center rounded-full bg-warm-100 px-2.5 py-0.5 text-xs font-medium text-warm-700">
              Bestseller
            </span>
          )}
          <h1 className="text-3xl leading-tight sm:text-4xl">{sku.name}</h1>
          <p className="mt-3 text-lg text-sage-800">{sku.hook}</p>
          <p className="mt-4 text-sm text-sage-700">{sku.scope}</p>

          <h2 className="mt-10 text-xl">What&rsquo;s inside</h2>
          <ul className="mt-3 space-y-3">
            {sku.includes.map((feat) => (
              <li key={feat.label} className="flex items-start gap-2.5">
                <Check className="mt-0.5 h-4 w-4 shrink-0 text-sage-600" aria-hidden />
                <div>
                  <div className="text-sm font-medium text-(--color-on-bg)">{feat.label}</div>
                  {feat.detail && (
                    <div className="mt-0.5 text-sm text-sage-700">{feat.detail}</div>
                  )}
                </div>
              </li>
            ))}
          </ul>

          {sku.faq.length > 0 && (
            <section className="mt-10">
              <h2 className="text-xl">Common questions</h2>
              <dl className="mt-4 space-y-5">
                {sku.faq.map((qa) => (
                  <div key={qa.q}>
                    <dt className="font-medium text-(--color-on-bg)">{qa.q}</dt>
                    <dd className="mt-1 text-sm text-sage-800">{qa.a}</dd>
                  </div>
                ))}
              </dl>
            </section>
          )}
        </header>

        <aside className="lg:sticky lg:top-24 lg:h-fit">
          <div className="rounded-card border border-(--color-border) bg-(--color-surface) p-6">
            <div className="flex items-baseline gap-2">
              <span className="tabular text-4xl font-display">${sku.priceUsd}</span>
              {sku.compareAtUsd && (
                <span className="tabular text-sm text-sage-600 line-through">
                  ${sku.compareAtUsd}
                </span>
              )}
            </div>
            <p className="mt-1 text-xs text-sage-700">One-time payment · Lifetime access</p>

            <div className="mt-5">
              <BuyButton
                sku={sku}
                checkoutUrl={checkoutUrl}
                source="product-page"
                size="lg"
                className="w-full"
              />
              <CheckoutTrust />
            </div>

            <ul className="mt-6 space-y-2 border-t border-sage-100 pt-5 text-xs text-sage-700">
              <li className="flex items-center gap-2">
                <ShieldCheck className="h-3.5 w-3.5 text-sage-600" aria-hidden />
                14-day refund guarantee
              </li>
              <li className="flex items-center gap-2">
                <ShieldCheck className="h-3.5 w-3.5 text-sage-600" aria-hidden />
                Verified against KDP&rsquo;s template generator
              </li>
              <li className="flex items-center gap-2">
                <ShieldCheck className="h-3.5 w-3.5 text-sage-600" aria-hidden />
                Free updates if KDP changes a multiplier
              </li>
            </ul>
          </div>
        </aside>
      </div>

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumb) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(product) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faq) }}
      />
    </article>
  );
}
