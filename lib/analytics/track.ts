"use client";

import { track as vercelTrack } from "@vercel/analytics";
import type { Format, Paper } from "@kdp/calc";

export type TemplateBuySource = "store-card" | "product-page" | "calculator-cta" | "pseo";

export type AnalyticsEvent =
  | {
      name: "calculate";
      props: { format: Format; paper: Paper; pageBucket: string };
    }
  | { name: "format_changed"; props: { format: Format } }
  | { name: "paper_changed"; props: { paper: Paper } }
  | { name: "share_link_copied"; props: Record<string, never> }
  | { name: "embed_snippet_copied"; props: Record<string, never> }
  | { name: "template_downloaded"; props: { format: Format } }
  | { name: "pwa_installed"; props: Record<string, never> }
  | {
      name: "template_buy_click";
      props: { sku: string; source: TemplateBuySource; price: number };
    }
  | {
      name: "template_notify_click";
      props: { sku: string; source: TemplateBuySource };
    }
  | {
      name: "template_upsell_view";
      props: { sku: string; source: TemplateBuySource };
    };

export function track<E extends AnalyticsEvent>(event: E) {
  vercelTrack(event.name, event.props);
}

export function pageBucket(pages: number): string {
  if (pages < 50) return "<50";
  if (pages < 100) return "50-99";
  if (pages < 200) return "100-199";
  if (pages < 300) return "200-299";
  if (pages < 500) return "300-499";
  return "500+";
}
