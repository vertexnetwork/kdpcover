import { z } from "zod";
import type { CoverInput, Format, Paper } from "./calc";

const StateSchema = z.object({
  f: z.enum(["paperback", "hardcover"]),
  p: z.enum(["white", "cream", "color-standard", "color-premium"]),
  pg: z.number().int().min(1).max(2000),
  tw: z.number().positive().max(20),
  th: z.number().positive().max(20),
});

export type ShareState = z.infer<typeof StateSchema>;

export function encodeState(input: CoverInput): string {
  const compact: ShareState = {
    f: input.format,
    p: input.paper,
    pg: input.pageCount,
    tw: round(input.trimWidthIn),
    th: round(input.trimHeightIn),
  };
  return base64UrlEncode(JSON.stringify(compact));
}

export function decodeState(code: string): CoverInput | null {
  try {
    const json = base64UrlDecode(code);
    const parsed = StateSchema.safeParse(JSON.parse(json));
    if (!parsed.success) return null;
    return {
      format: parsed.data.f as Format,
      paper: parsed.data.p as Paper,
      pageCount: parsed.data.pg,
      trimWidthIn: parsed.data.tw,
      trimHeightIn: parsed.data.th,
    };
  } catch {
    return null;
  }
}

function round(n: number): number {
  return Math.round(n * 100) / 100;
}

function base64UrlEncode(s: string): string {
  if (typeof globalThis.btoa === "function") {
    return globalThis
      .btoa(unescape(encodeURIComponent(s)))
      .replace(/\+/g, "-")
      .replace(/\//g, "_")
      .replace(/=+$/, "");
  }
  return Buffer.from(s, "utf8").toString("base64url");
}

function base64UrlDecode(s: string): string {
  const padded = s.replace(/-/g, "+").replace(/_/g, "/");
  if (typeof globalThis.atob === "function") {
    const padding = padded.length % 4 === 0 ? "" : "=".repeat(4 - (padded.length % 4));
    return decodeURIComponent(escape(globalThis.atob(padded + padding)));
  }
  return Buffer.from(padded, "base64").toString("utf8");
}
