import { describe, expect, it } from "vitest";
import { calcCover, type CoverInput } from "@kdp/calc";
import { evaluatePreflight } from "@/lib/preflight/evaluate";
import type { FileAnalysis } from "@/lib/preflight/types";

// 6 × 9 / 300p white paperback → full cover 12.9256 × 9.25 in.
const INPUT: CoverInput = {
  format: "paperback",
  paper: "white",
  pageCount: 300,
  trimWidthIn: 6,
  trimHeightIn: 9,
};
const CALC = calcCover(INPUT);
const W = CALC.fullCoverWidthIn;
const H = CALC.fullCoverHeightIn;

// A correct PDF: exact size, single page, embedded font, CMYK, vector.
const GOOD_PDF: FileAnalysis = {
  kind: "pdf",
  byteSize: 8 * 1024 * 1024,
  pageCount: 1,
  widthIn: W,
  heightIn: H,
  colorSpace: "cmyk",
  hasTransparency: false,
  hasRasterImages: false,
  fonts: [{ name: "MyFont", embedded: true }],
};

const run = (a: FileAnalysis) => evaluatePreflight(a, CALC, INPUT);
const check = (a: FileAnalysis, id: string) => run(a).checks.find((c) => c.id === id);

describe("evaluatePreflight", () => {
  it("passes a correct PDF", () => {
    const r = run(GOOD_PDF);
    expect(r.overall).toBe("pass");
    expect(check(GOOD_PDF, "full-cover-size")?.status).toBe("pass");
    expect(check(GOOD_PDF, "bleed-present")?.status).toBe("pass");
    expect(check(GOOD_PDF, "fonts-embedded")?.status).toBe("pass");
  });

  it("fails a trim-sized file (missing bleed) on size and bleed", () => {
    const trimOnly: FileAnalysis = { ...GOOD_PDF, widthIn: W - 0.25, heightIn: H - 0.25 };
    const r = run(trimOnly);
    expect(r.overall).toBe("fail");
    expect(check(trimOnly, "full-cover-size")?.status).toBe("fail");
    expect(check(trimOnly, "bleed-present")?.status).toBe("fail");
  });

  it("warns when the page is rotated 90°", () => {
    const rotated: FileAnalysis = { ...GOOD_PDF, widthIn: H, heightIn: W };
    expect(check(rotated, "full-cover-size")?.status).toBe("warn");
  });

  it("accepts size within the 1/16\" tolerance", () => {
    const close: FileAnalysis = { ...GOOD_PDF, widthIn: W + 0.05, heightIn: H - 0.05 };
    expect(check(close, "full-cover-size")?.status).toBe("pass");
  });

  it("fails on an unembedded font", () => {
    const a: FileAnalysis = { ...GOOD_PDF, fonts: [{ name: "Helvetica", embedded: false }] };
    expect(check(a, "fonts-embedded")?.status).toBe("fail");
    expect(run(a).overall).toBe("fail");
  });

  it("warns on RGB color", () => {
    const a: FileAnalysis = { ...GOOD_PDF, colorSpace: "rgb" };
    expect(check(a, "color-space")?.status).toBe("warn");
  });

  it("grades file size: rec / warn / hard-fail", () => {
    expect(check({ ...GOOD_PDF, byteSize: 10 * 1024 * 1024 }, "file-size")?.status).toBe("pass");
    expect(check({ ...GOOD_PDF, byteSize: 100 * 1024 * 1024 }, "file-size")?.status).toBe("warn");
    expect(check({ ...GOOD_PDF, byteSize: 700 * 1024 * 1024 }, "file-size")?.status).toBe("fail");
  });

  it("fails a multi-page PDF", () => {
    expect(check({ ...GOOD_PDF, pageCount: 2 }, "single-page")?.status).toBe("fail");
  });

  it("hard-fails an unreadable file with a single check", () => {
    const r = run({ kind: "unknown", byteSize: 10, error: "bad" });
    expect(r.overall).toBe("fail");
    expect(r.checks).toHaveLength(1);
  });

  it("grades raster DPI against the target size", () => {
    // PNG with no embedded DPI → judged by pixels vs the full-cover size.
    const at = (dpi: number): FileAnalysis => ({
      kind: "png",
      byteSize: 5 * 1024 * 1024,
      pixelWidth: Math.round(W * dpi),
      pixelHeight: Math.round(H * dpi),
      colorSpace: "rgb",
      hasTransparency: false,
    });
    expect(check(at(300), "resolution-dpi")?.status).toBe("pass");
    expect(check(at(260), "resolution-dpi")?.status).toBe("warn");
    expect(check(at(200), "resolution-dpi")?.status).toBe("fail");
  });

  it("flags a raster (PNG/JPG) as a non-PDF format warning", () => {
    const a: FileAnalysis = {
      kind: "png",
      byteSize: 5 * 1024 * 1024,
      pixelWidth: Math.round(W * 300),
      pixelHeight: Math.round(H * 300),
      colorSpace: "rgb",
    };
    expect(check(a, "file-format")?.status).toBe("warn");
  });
});
