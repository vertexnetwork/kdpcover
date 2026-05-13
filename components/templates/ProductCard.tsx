import Link from "next/link";
import { Check, Star } from "lucide-react";
import { clsx } from "clsx";
import type { Sku } from "@/lib/templates/catalog";
import { STORE_PATH } from "@/lib/templates/catalog";
import { BuyButton } from "./BuyButton";
import { resolveCheckout } from "@/lib/templates/checkout";

type Props = {
  sku: Sku;
};

export function ProductCard({ sku }: Props) {
  const checkout = resolveCheckout(sku);
  const checkoutUrl = checkout.status === "ready" ? checkout.url : null;
  const topThree = sku.includes.slice(0, 4);

  return (
    <article
      className={clsx(
        "relative flex h-full flex-col rounded-card border bg-white p-6 transition-shadow",
        sku.highlight ? "border-warm-400 shadow-md ring-1 ring-warm-300/50" : "border-sage-200",
      )}
    >
      {sku.highlight && (
        <span className="absolute -top-3 left-6 inline-flex items-center gap-1 rounded-full bg-warm-500 px-2.5 py-0.5 text-xs font-medium text-white">
          <Star className="h-3 w-3" aria-hidden />
          Bestseller
        </span>
      )}

      <header>
        <h3 className="text-xl font-display">{sku.name}</h3>
        <p className="mt-1 text-sm text-sage-700">{sku.hook}</p>
      </header>

      <div className="mt-4 flex items-baseline gap-2">
        <span className="tabular text-3xl font-display">${sku.priceUsd}</span>
        {sku.compareAtUsd && (
          <span className="tabular text-sm text-sage-600 line-through">${sku.compareAtUsd}</span>
        )}
        <span className="text-xs text-sage-700">one-time</span>
      </div>

      <ul className="mt-5 space-y-2 text-sm">
        {topThree.map((feat) => (
          <li key={feat.label} className="flex items-start gap-2">
            <Check className="mt-0.5 h-4 w-4 shrink-0 text-sage-600" aria-hidden />
            <span className="text-ink">{feat.label}</span>
          </li>
        ))}
        {sku.includes.length > topThree.length && (
          <li className="pl-6 text-xs text-sage-700">
            + {sku.includes.length - topThree.length} more on the product page
          </li>
        )}
      </ul>

      <div className="mt-auto flex items-center gap-2 pt-6">
        <BuyButton sku={sku} checkoutUrl={checkoutUrl} source="store-card" />
        <Link
          href={`${STORE_PATH}/${sku.slug}`}
          className="text-sm text-sage-700 underline-offset-2 hover:text-warm-500 hover:underline"
        >
          Details
        </Link>
      </div>
    </article>
  );
}
