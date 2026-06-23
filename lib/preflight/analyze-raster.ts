import type { FileAnalysis } from "./types";

// Header-only PNG/JPEG parsing — pixel dimensions, embedded density (DPI),
// color type, and transparency. Pure (operates on a Uint8Array), so it's
// unit-testable in node and never decodes the full image. Only the first tens
// of KB are needed; callers pass a sliced buffer for large files.

const PNG_SIG = [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a];

function u32be(b: Uint8Array, o: number): number {
  return ((b[o] << 24) | (b[o + 1] << 16) | (b[o + 2] << 8) | b[o + 3]) >>> 0;
}
function u16be(b: Uint8Array, o: number): number {
  return (b[o] << 8) | b[o + 1];
}

function isPng(b: Uint8Array): boolean {
  return PNG_SIG.every((v, i) => b[i] === v);
}
function isJpeg(b: Uint8Array): boolean {
  return b[0] === 0xff && b[1] === 0xd8;
}

function parsePng(b: Uint8Array, byteSize: number): FileAnalysis {
  // IHDR is always the first chunk: data begins at offset 16.
  const width = u32be(b, 16);
  const height = u32be(b, 20);
  const colorType = b[25];
  let hasTransparency = colorType === 4 || colorType === 6;
  let embeddedDpi: number | undefined;

  // Walk chunks for pHYs (density) and tRNS (palette/RGB transparency), which
  // both precede IDAT.
  let off = 8;
  while (off + 8 <= b.length) {
    const len = u32be(b, off);
    const type = String.fromCharCode(b[off + 4], b[off + 5], b[off + 6], b[off + 7]);
    const dataOff = off + 8;
    if (type === "IDAT" || type === "IEND") break;
    if (type === "pHYs" && dataOff + 9 <= b.length) {
      const ppuX = u32be(b, dataOff);
      const unit = b[dataOff + 8];
      if (unit === 1 && ppuX > 0) embeddedDpi = ppuX * 0.0254; // px/metre → px/inch
    }
    if (type === "tRNS") hasTransparency = true;
    const next = dataOff + len + 4; // + CRC
    if (next <= off) break;
    off = next;
  }

  const result: FileAnalysis = {
    kind: "png",
    byteSize,
    pixelWidth: width,
    pixelHeight: height,
    colorSpace: colorType === 0 || colorType === 4 ? "gray" : "rgb",
    hasTransparency,
  };
  if (embeddedDpi && embeddedDpi > 1) {
    result.embeddedDpi = embeddedDpi;
    result.widthIn = width / embeddedDpi;
    result.heightIn = height / embeddedDpi;
  }
  return result;
}

function parseJpeg(b: Uint8Array, byteSize: number): FileAnalysis {
  let width: number | undefined;
  let height: number | undefined;
  let components = 0;
  let embeddedDpi: number | undefined;
  let adobeCmyk = false;

  let off = 2;
  while (off + 4 <= b.length) {
    if (b[off] !== 0xff) {
      off++;
      continue;
    }
    const marker = b[off + 1];
    // Standalone markers (no length).
    if (marker === 0xd8 || marker === 0xd9 || (marker >= 0xd0 && marker <= 0xd7) || marker === 0x01) {
      off += 2;
      continue;
    }
    const segLen = u16be(b, off + 2);
    if (segLen < 2) break;
    const data = off + 4;

    if (marker === 0xe0 && data + 9 <= b.length) {
      // APP0 / JFIF: identifier(5) version(2) units(1) Xdensity(2) Ydensity(2)
      const units = b[data + 7];
      const xden = u16be(b, data + 8);
      if (xden > 0) {
        if (units === 1) embeddedDpi = xden; // dots per inch
        else if (units === 2) embeddedDpi = xden * 2.54; // dots per cm → per inch
      }
    } else if (marker === 0xee) {
      adobeCmyk = true; // APP14 Adobe marker — present on CMYK/YCCK JPEGs
    } else if (
      marker >= 0xc0 &&
      marker <= 0xcf &&
      marker !== 0xc4 &&
      marker !== 0xc8 &&
      marker !== 0xcc &&
      data + 6 <= b.length
    ) {
      // SOFn: precision(1) height(2) width(2) components(1)
      height = u16be(b, data + 1);
      width = u16be(b, data + 3);
      components = b[data + 5];
      break; // SOF carries everything we need
    }
    off += 2 + segLen;
  }

  const result: FileAnalysis = {
    kind: "jpg",
    byteSize,
    pixelWidth: width,
    pixelHeight: height,
    colorSpace: components === 1 ? "gray" : components === 4 || adobeCmyk ? "cmyk" : "rgb",
    hasTransparency: false, // JPEG has no alpha channel
  };
  if (embeddedDpi && embeddedDpi > 1 && width && height) {
    result.embeddedDpi = embeddedDpi;
    result.widthIn = width / embeddedDpi;
    result.heightIn = height / embeddedDpi;
  }
  return result;
}

/** Parse PNG/JPEG header bytes. Returns kind "unknown" with an error for other
 *  inputs so the evaluator can surface a clean failure. */
export function analyzeRasterBytes(bytes: Uint8Array, byteSize: number): FileAnalysis {
  try {
    if (isPng(bytes)) return parsePng(bytes, byteSize);
    if (isJpeg(bytes)) return parseJpeg(bytes, byteSize);
    return { kind: "unknown", byteSize, error: "not a PNG or JPEG" };
  } catch (e) {
    return { kind: "unknown", byteSize, error: e instanceof Error ? e.message : "parse error" };
  }
}
