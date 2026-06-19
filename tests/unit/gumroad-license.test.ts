import { describe, expect, it } from "vitest";
import {
  evaluateLicense,
  extractTier,
  type GumroadVerifyResponse,
} from "@/lib/gumroad-license";

const STUDIO = ["studio", "volume", "batch"];

describe("evaluateLicense", () => {
  it("rejects null / unsuccessful responses", () => {
    expect(evaluateLicense(null, 5)).toEqual({ ok: false, reason: "invalid" });
    expect(evaluateLicense({ success: false }, 5)).toEqual({ ok: false, reason: "invalid" });
  });

  it("accepts a clean purchase", () => {
    expect(evaluateLicense({ success: true, purchase: {} }, 5)).toEqual({ ok: true });
  });

  it("rejects refunded / chargebacked / disputed purchases first", () => {
    expect(evaluateLicense({ success: true, purchase: { refunded: true } }, 5)).toEqual({
      ok: false,
      reason: "refunded",
    });
    expect(evaluateLicense({ success: true, purchase: { chargebacked: true } }, 5)).toEqual({
      ok: false,
      reason: "chargebacked",
    });
    expect(evaluateLicense({ success: true, purchase: { disputed: true } }, 5)).toEqual({
      ok: false,
      reason: "disputed",
    });
  });

  it("blocks once uses exceed the cap", () => {
    expect(evaluateLicense({ success: true, uses: 6, purchase: {} }, 5)).toEqual({
      ok: false,
      reason: "uses_exceeded",
    });
    expect(evaluateLicense({ success: true, uses: 5, purchase: {} }, 5)).toEqual({ ok: true });
  });

  it("ignores the uses cap when it is zero/disabled", () => {
    expect(evaluateLicense({ success: true, uses: 999, purchase: {} }, 0)).toEqual({ ok: true });
  });
});

describe("extractTier", () => {
  const r = (purchase: Record<string, unknown>): GumroadVerifyResponse => ({
    success: true,
    purchase,
  });

  it("maps studio-named variants to studio", () => {
    expect(extractTier(r({ variants: "(Studio)" }), STUDIO)).toBe("studio");
    expect(extractTier(r({ tier_name: "Volume" }), STUDIO)).toBe("studio");
    expect(extractTier(r({ name: "Cover Pass-Check — Batch" }), STUDIO)).toBe("studio");
  });

  it("defaults to author for the author variant or no variant", () => {
    expect(extractTier(r({ variants: "(Author)" }), STUDIO)).toBe("author");
    expect(extractTier(r({}), STUDIO)).toBe("author");
    expect(extractTier(null, STUDIO)).toBe("author");
  });
});
