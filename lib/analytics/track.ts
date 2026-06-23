"use client";

import { track as vercelTrack } from "@vercel/analytics";
import type { Format, Paper } from "@kdp/calc";

export type TemplateBuySource = "store-card" | "product-page" | "calculator-cta" | "pseo";

/** Where a Pass-Check CTA was shown. */
export type PassCheckSource =
  | "landing"
  | "unlock"
  | "calculator-cta"
  | "pseo"
  | "home"
  | "templates";

type PassCheckTier = "author" | "studio";

type EmailSource = "about" | "guide" | "calculator" | "extension" | "templates";
type AffiliatePlacement = "recommended-page" | "calculator-cta" | "footer";

export type AnalyticsEvent =
  | { name: "calculate"; props: { format: Format; paper: Paper; pageBucket: string } }
  | { name: "format_changed"; props: { format: Format } }
  | { name: "paper_changed"; props: { paper: Paper } }
  | { name: "share_link_copied"; props: Record<string, never> }
  | { name: "embed_snippet_copied"; props: Record<string, never> }
  | { name: "template_downloaded"; props: { format: Format } }
  | { name: "pwa_installed"; props: Record<string, never> }
  | { name: "template_buy_click"; props: { source: TemplateBuySource; price: number } }
  | { name: "template_notify_click"; props: { source: TemplateBuySource } }
  | { name: "template_upsell_view"; props: { source: TemplateBuySource } }
  | { name: "passcheck_buy_click"; props: { source: PassCheckSource; price: number } }
  | { name: "passcheck_notify_click"; props: { source: PassCheckSource } }
  | { name: "passcheck_unlock_attempt"; props: Record<string, never> }
  | { name: "passcheck_unlock_success"; props: { tier: PassCheckTier } }
  | { name: "passcheck_autounlock_start"; props: { source: PassCheckSource } }
  | { name: "passcheck_autounlock_success"; props: { tier: PassCheckTier } }
  | { name: "passcheck_autounlock_timeout"; props: Record<string, never> }
  | { name: "passcheck_run"; props: { kind: string; overall: string; tier: PassCheckTier } }
  | { name: "vertex_footer_opened"; props: Record<string, never> }
  | { name: "subscribe_submit"; props: { source: EmailSource } }
  | { name: "subscribe_success"; props: { source: EmailSource } }
  | { name: "affiliate_click"; props: { provider: string; placement: AffiliatePlacement } };

/**
 * Safe wrapper around `@vercel/analytics`. No-ops if the script never
 * loaded (e.g., consent denied, ad blocker, dev mode).
 */
export function track<E extends AnalyticsEvent>(event: E): void {
  try {
    vercelTrack(event.name, event.props as Record<string, string | number | boolean | null>);
  } catch {
    /* no-op */
  }
}

export function safeTrack<E extends AnalyticsEvent>(event: E): void {
  track(event);
}

export function pageBucket(pages: number): string {
  if (pages < 50) return "<50";
  if (pages < 100) return "50-99";
  if (pages < 200) return "100-199";
  if (pages < 300) return "200-299";
  if (pages < 500) return "300-499";
  return "500+";
}
