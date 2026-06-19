import { analyzeRasterBytes } from "./analyze-raster";
import type { FileAnalysis } from "./types";

// Browser-only entry point. Sniffs the file by magic bytes (extension is a
// fallback only), then dispatches. The mupdf WASM is loaded lazily via dynamic
// import() — only when a PDF is actually analyzed — so the raster path and the
// server never pull it in.

// pHYs/tRNS (PNG) and SOF/JFIF (JPEG) all sit near the file start; 256 KB is a
// generous header window that avoids reading a multi-hundred-MB cover in full.
const RASTER_HEADER_BYTES = 256 * 1024;

export async function analyzeFile(file: File): Promise<FileAnalysis> {
  const byteSize = file.size;

  let head: Uint8Array;
  try {
    head = new Uint8Array(await file.slice(0, 16).arrayBuffer());
  } catch {
    return { kind: "unknown", byteSize, error: "Could not read the file." };
  }

  const isPdf = head[0] === 0x25 && head[1] === 0x50 && head[2] === 0x44 && head[3] === 0x46; // %PDF
  const isPng = head[0] === 0x89 && head[1] === 0x50;
  const isJpg = head[0] === 0xff && head[1] === 0xd8;
  const name = file.name.toLowerCase();

  if (isPdf || name.endsWith(".pdf")) {
    try {
      const buf = await file.arrayBuffer();
      const { analyzePdf } = await import("./analyze-pdf");
      return await analyzePdf(buf, byteSize);
    } catch (e) {
      return {
        kind: "pdf",
        byteSize,
        error: e instanceof Error ? e.message : "The PDF engine failed to load.",
      };
    }
  }

  if (isPng || isJpg || name.endsWith(".png") || name.endsWith(".jpg") || name.endsWith(".jpeg")) {
    try {
      const slice = await file.slice(0, RASTER_HEADER_BYTES).arrayBuffer();
      return analyzeRasterBytes(new Uint8Array(slice), byteSize);
    } catch (e) {
      return {
        kind: "unknown",
        byteSize,
        error: e instanceof Error ? e.message : "Could not read the image.",
      };
    }
  }

  return {
    kind: "unknown",
    byteSize,
    error: "Unsupported file type — upload a PDF, PNG, or JPG.",
  };
}
