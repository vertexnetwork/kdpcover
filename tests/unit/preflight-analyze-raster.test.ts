import { describe, expect, it } from "vitest";
import { analyzeRasterBytes } from "@/lib/preflight/analyze-raster";

function pushU32(arr: number[], n: number) {
  arr.push((n >>> 24) & 255, (n >>> 16) & 255, (n >>> 8) & 255, n & 255);
}

function chunk(type: string, data: number[]): number[] {
  const out: number[] = [];
  pushU32(out, data.length);
  for (const ch of type) out.push(ch.charCodeAt(0));
  out.push(...data, 0, 0, 0, 0); // CRC ignored by the parser
  return out;
}

function buildPng(width: number, height: number, colorType: number, dpi?: number): Uint8Array {
  const ihdr: number[] = [];
  pushU32(ihdr, width);
  pushU32(ihdr, height);
  ihdr.push(8, colorType, 0, 0, 0);
  const out = [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, ...chunk("IHDR", ihdr)];
  if (dpi) {
    const ppu = Math.round(dpi / 0.0254);
    const phys: number[] = [];
    pushU32(phys, ppu);
    pushU32(phys, ppu);
    phys.push(1); // unit = metre
    out.push(...chunk("pHYs", phys));
  }
  out.push(...chunk("IEND", []));
  return new Uint8Array(out);
}

function buildJpeg(width: number, height: number, components: number, dpi: number): Uint8Array {
  const out: number[] = [0xff, 0xd8];
  const jfif = [
    0x4a, 0x46, 0x49, 0x46, 0x00, 1, 1, 1, (dpi >> 8) & 255, dpi & 255, (dpi >> 8) & 255, dpi & 255, 0, 0,
  ];
  out.push(0xff, 0xe0, ((jfif.length + 2) >> 8) & 255, (jfif.length + 2) & 255, ...jfif);
  const sof = [8, (height >> 8) & 255, height & 255, (width >> 8) & 255, width & 255, components];
  for (let i = 0; i < components; i++) sof.push(i + 1, 0x11, 0);
  out.push(0xff, 0xc0, ((sof.length + 2) >> 8) & 255, (sof.length + 2) & 255, ...sof);
  out.push(0xff, 0xd9);
  return new Uint8Array(out);
}

describe("analyzeRasterBytes — PNG", () => {
  it("reads dimensions, RGB, and 300-DPI physical size", () => {
    const png = buildPng(600, 900, 2, 300);
    const a = analyzeRasterBytes(png, png.length);
    expect(a.kind).toBe("png");
    expect(a.pixelWidth).toBe(600);
    expect(a.pixelHeight).toBe(900);
    expect(a.colorSpace).toBe("rgb");
    expect(a.embeddedDpi).toBeCloseTo(300, 1);
    expect(a.widthIn).toBeCloseTo(2.0, 2);
    expect(a.heightIn).toBeCloseTo(3.0, 2);
  });

  it("flags RGBA transparency and grayscale", () => {
    expect(analyzeRasterBytes(buildPng(10, 10, 6), 100).hasTransparency).toBe(true);
    expect(analyzeRasterBytes(buildPng(10, 10, 0), 100).colorSpace).toBe("gray");
  });

  it("leaves physical size unknown without pHYs", () => {
    const a = analyzeRasterBytes(buildPng(600, 900, 2), 100);
    expect(a.embeddedDpi).toBeUndefined();
    expect(a.widthIn).toBeUndefined();
  });
});

describe("analyzeRasterBytes — JPEG", () => {
  it("reads dimensions, density, and YCbCr→RGB", () => {
    const jpg = buildJpeg(1800, 2700, 3, 300);
    const a = analyzeRasterBytes(jpg, jpg.length);
    expect(a.kind).toBe("jpg");
    expect(a.pixelWidth).toBe(1800);
    expect(a.pixelHeight).toBe(2700);
    expect(a.colorSpace).toBe("rgb");
    expect(a.embeddedDpi).toBe(300);
    expect(a.widthIn).toBeCloseTo(6.0, 3);
  });

  it("detects CMYK (4 components) and grayscale (1)", () => {
    expect(analyzeRasterBytes(buildJpeg(100, 100, 4, 300), 100).colorSpace).toBe("cmyk");
    expect(analyzeRasterBytes(buildJpeg(100, 100, 1, 300), 100).colorSpace).toBe("gray");
  });
});

describe("analyzeRasterBytes — other", () => {
  it("returns unknown for non-image bytes", () => {
    const a = analyzeRasterBytes(new Uint8Array([1, 2, 3, 4, 5, 6, 7, 8]), 8);
    expect(a.kind).toBe("unknown");
    expect(a.error).toBeTruthy();
  });
});
