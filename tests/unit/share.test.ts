import { describe, expect, it } from "vitest";
import { decodeState, encodeState } from "@kdp/share";

describe("share state codec", () => {
  it("round-trips a typical config", () => {
    const input = {
      format: "paperback" as const,
      paper: "color-premium" as const,
      pageCount: 220,
      trimWidthIn: 8.5,
      trimHeightIn: 11,
    };
    const code = encodeState(input);
    expect(code).toMatch(/^[A-Za-z0-9_-]+$/);
    expect(decodeState(code)).toEqual(input);
  });

  it("rejects garbage", () => {
    expect(decodeState("@@@not-base64@@@")).toBeNull();
    expect(decodeState("")).toBeNull();
  });

  it("rejects out-of-range values", () => {
    const bad = encodeState({
      format: "paperback",
      paper: "white",
      pageCount: 99999,
      trimWidthIn: 6,
      trimHeightIn: 9,
    });
    expect(decodeState(bad)).toBeNull();
  });
});
