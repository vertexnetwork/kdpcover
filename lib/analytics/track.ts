"use client";

import { track as vercelTrack } from "@vercel/analytics";
import type { Format, Paper } from "@kdp/calc";

export type TemplateBuySource = "store-card" | "product-page" | "calculator-cta" | "pseo";

/** Where a Pass-Check CTA was shown — the conversion-attribution dimension. */
export type PassCheckSource =
  | "landing"
  | "unlock"
  | "calculator-cta"
  | "pseo"
  | "home"
  | "templates"
  | "header"
  | "guide"
  | "banner";

type PassCheckTier = "author" | "studio";

// Source carried onto an ACTIVATION (unlock) event. For auto-unlock it's the
// originating buy source (or "unknown" if a resumed claim lost it); for manual
// key entry there's no surface, so "manual".
type AttributionSource = PassCheckSource | "manual" | "unknown";

type EmailSource = "about" | "guide" | "calculator" | "extension" | "templates" | "footer";

/** Where the affiliate "tools authors use" strip was shown. */
export type AffiliateSource = "pseo" | "home" | "guide";

export type AnalyticsEvent =
  | { name: "calculate"; props: { format: Format; paper: Paper; pageBucket: string } }
  | { name: "format_changed"; props: { format: Format } }
  | { name: "paper_changed"; props: { paper: Paper } }
  | { name: "share_link_copied"; props: { kind: "share" | "handoff" } }
  | { name: "embed_snippet_copied"; props: Record<string, never> }
  | { name: "template_downloaded"; props: { format: Format } }
  | { name: "pwa_installed"; props: Record<string, never> }
  | { name: "template_buy_click"; props: { source: TemplateBuySource; price: number } }
  | { name: "template_notify_click"; props: { source: TemplateBuySource } }
  | { name: "template_upsell_view"; props: { source: TemplateBuySource } }
  | { name: "passcheck_cta_view"; props: { source: PassCheckSource } }
  | { name: "passcheck_buy_click"; props: { source: PassCheckSource; price: number } }
  | { name: "passcheck_notify_click"; props: { source: PassCheckSource } }
  | { name: "passcheck_unlock_attempt"; props: Record<string, never> }
  | { name: "passcheck_unlock_success"; props: { tier: PassCheckTier; source: AttributionSource } }
  | { name: "passcheck_autounlock_start"; props: { source: PassCheckSource } }
  | { name: "passcheck_autounlock_success"; props: { tier: PassCheckTier; source: AttributionSource } }
  | { name: "passcheck_autounlock_timeout"; props: Record<string, never> }
  | { name: "passcheck_run"; props: { kind: string; overall: string; tier: PassCheckTier } }
  | { name: "vertex_footer_opened"; props: Record<string, never> }
  | { name: "subscribe_view"; props: { source: EmailSource } }
  | { name: "subscribe_submit"; props: { source: EmailSource } }
  | { name: "subscribe_success"; props: { source: EmailSource } }
  | { name: "affiliate_view"; props: { source: AffiliateSource } }
  | { name: "affiliate_click"; props: { partner: string; source: AffiliateSource } };

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
  }
}

/**
 * Safe wrapper that fans every event out to BOTH Vercel Analytics and GA4.
 * Each sink is independently guarded — if a script never loaded (consent
 * denied, ad blocker, dev mode) it simply no-ops. GA4's gtag only exists after
 * the consent-gated script mounts, so this is a no-op until then.
 */
export function track<E extends AnalyticsEvent>(event: E): void {
  const props = event.props as Record<string, string | number | boolean | null>;
  try {
    vercelTrack(event.name, props);
  } catch {
    /* no-op */
  }
  try {
    if (typeof window !== "undefined" && typeof window.gtag === "function") {
      window.gtag("event", event.name, props);
    }
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
