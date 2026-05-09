import { describe, expect, it } from "vitest";
import truth from "../fixtures/kdp-truth.json" with { type: "json" };
import { calcCover, spineWidthIn, type Format, type Paper } from "@kdp/calc";
import { isPageCountValid, pageCountBounds } from "@kdp/limits";

type GoldenCase = {
  format: Format;
  paper: Paper;
  pageCount: number;
  trimWidthIn: number;
  trimHeightIn: number;
  expectedSpineIn: number;
  expectedFullW: number;
  expectedFullH: number;
};

describe("calcCover — golden values", () => {
  for (const c of truth.cases as GoldenCase[]) {
    const id = `${c.format}/${c.paper}/${c.pageCount}p/${c.trimWidthIn}x${c.trimHeightIn}`;
    it(id, () => {
      const out = calcCover(c);
      expect(out.spineWidthIn).toBeCloseTo(c.expectedSpineIn, 4);
      expect(out.fullCoverWidthIn).toBeCloseTo(c.expectedFullW, 4);
      expect(out.fullCoverHeightIn).toBeCloseTo(c.expectedFullH, 4);
    });
  }
});

describe("spine multipliers", () => {
  it("paperback white = 0.002252 in/page", () => {
    expect(spineWidthIn({ format: "paperback", paper: "white", pageCount: 1000 })).toBeCloseTo(2.252, 4);
  });
  it("paperback cream = 0.0025 in/page", () => {
    expect(spineWidthIn({ format: "paperback", paper: "cream", pageCount: 1000 })).toBeCloseTo(2.5, 4);
  });
  it("paperback premium color = 0.002347 in/page", () => {
    expect(spineWidthIn({ format: "paperback", paper: "color-premium", pageCount: 1000 })).toBeCloseTo(2.347, 4);
  });
  it("hardcover any = 0.002347 in/page", () => {
    expect(spineWidthIn({ format: "hardcover", paper: "white", pageCount: 1000 })).toBeCloseTo(2.347, 4);
    expect(spineWidthIn({ format: "hardcover", paper: "cream", pageCount: 1000 })).toBeCloseTo(2.347, 4);
  });
});

describe("page-count bounds", () => {
  it("paperback range 24..828", () => {
    expect(pageCountBounds("paperback")).toEqual({ min: 24, max: 828 });
    expect(isPageCountValid("paperback", 24)).toBe(true);
    expect(isPageCountValid("paperback", 828)).toBe(true);
    expect(isPageCountValid("paperback", 23)).toBe(false);
    expect(isPageCountValid("paperback", 829)).toBe(false);
  });
  it("hardcover range 75..550", () => {
    expect(pageCountBounds("hardcover")).toEqual({ min: 75, max: 550 });
    expect(isPageCountValid("hardcover", 75)).toBe(true);
    expect(isPageCountValid("hardcover", 550)).toBe(true);
    expect(isPageCountValid("hardcover", 74)).toBe(false);
    expect(isPageCountValid("hardcover", 551)).toBe(false);
  });
});

describe("safe zones + barcode box", () => {
  it("paperback safe zones add bleed + 0.125 inset", () => {
    const out = calcCover({
      format: "paperback",
      paper: "white",
      pageCount: 200,
      trimWidthIn: 6,
      trimHeightIn: 9,
    });
    expect(out.safeZones.outside).toBeCloseTo(0.25, 4);
    expect(out.safeZones.spineHinge).toBe(0);
  });
  it("hardcover safe zones include 0.51 wrap + 0.635 inside, hinge 0.4", () => {
    const out = calcCover({
      format: "hardcover",
      paper: "color-premium",
      pageCount: 200,
      trimWidthIn: 6,
      trimHeightIn: 9,
    });
    expect(out.safeZones.outside).toBeCloseTo(0.51 + 0.635, 4);
    expect(out.safeZones.spineHinge).toBeCloseTo(0.4, 4);
  });
  it("barcode box is 2x1.2", () => {
    const out = calcCover({
      format: "paperback",
      paper: "white",
      pageCount: 200,
      trimWidthIn: 6,
      trimHeightIn: 9,
    });
    expect(out.barcodeBox.w).toBe(2);
    expect(out.barcodeBox.h).toBe(1.2);
  });
});

describe("spine text eligibility", () => {
  it("eligible at >= 79 pages", () => {
    expect(
      calcCover({ format: "paperback", paper: "white", pageCount: 79, trimWidthIn: 6, trimHeightIn: 9 })
        .spineTextEligible,
    ).toBe(true);
  });
  it("not eligible at < 79 pages", () => {
    expect(
      calcCover({ format: "paperback", paper: "white", pageCount: 78, trimWidthIn: 6, trimHeightIn: 9 })
        .spineTextEligible,
    ).toBe(false);
  });
});
