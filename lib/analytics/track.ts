"use client";

import { track as vercelTrack } from "@vercel/analytics";
import type { Format, Paper } from "@kdp/calc";

export type AnalyticsEvent =
  | {
      name: "calculate";
      props: { format: Format; paper: Paper; pageBucket: string };
    }
  | { name: "share_link_copied"; props: Record<string, never> }
  | { name: "embed_snippet_copied"; props: Record<string, never> }
  | { name: "template_downloaded"; props: { format: Format } }
  | { name: "pwa_installed"; props: Record<string, never> };

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
