// Shared types for the Cover Pass-Check engine. The analyzers (browser-only)
// produce a FileAnalysis; the pure evaluator turns that + the calculator's
// target geometry into a PreflightReport. No DOM/React imports here.

export type FileKind = "pdf" | "png" | "jpg" | "unknown";

export type ColorSpaceKind = "cmyk" | "rgb" | "gray" | "unknown";

export type PdfFont = { name: string; embedded: boolean };

/** Raw, format-specific facts extracted from an uploaded file. */
export type FileAnalysis = {
  kind: FileKind;
  /** File size in bytes. */
  byteSize: number;
  /** Physical page size in inches — PDF from the page box; raster only when an
   *  embedded density (DPI) is present. Undefined means "unknown physical size". */
  widthIn?: number;
  heightIn?: number;
  /** Raster pixel dimensions. */
  pixelWidth?: number;
  pixelHeight?: number;
  /** Embedded density in DPI, when the file declares one. */
  embeddedDpi?: number;
  /** PDF page count. */
  pageCount?: number;
  /** PDF: lowest DPI across sampled embedded raster images, at the page's
   *  physical size. Undefined when the PDF is vector-only or not sampled. */
  minImageDpi?: number;
  /** PDF: at least one raster image XObject is present (so "vector-only" is
   *  false even when per-image DPI couldn't be measured). */
  hasRasterImages?: boolean;
  /** Dominant color space. */
  colorSpace?: ColorSpaceKind;
  /** Raster alpha / PDF soft-mask present. */
  hasTransparency?: boolean;
  /** PDF fonts and whether each is embedded. */
  fonts?: PdfFont[];
  /** Set when parsing failed; the evaluator surfaces it as a hard fail. */
  error?: string;
};

export type CheckStatus = "pass" | "warn" | "fail";

export type PreflightCheck = {
  id: string;
  label: string;
  status: CheckStatus;
  /** One-line human result. */
  detail: string;
  /** What to do about it, when not a pass. */
  fix?: string;
  /** Advisory checks never push the overall verdict to fail. */
  advisory?: boolean;
};

export type PreflightReport = {
  /** Worst non-advisory status: fail > warn > pass. */
  overall: CheckStatus;
  checks: PreflightCheck[];
  analysis: FileAnalysis;
};
