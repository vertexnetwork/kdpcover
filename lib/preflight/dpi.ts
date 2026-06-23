// Tolerances and small numeric helpers for the Pass-Check evaluator. Kept
// separate so tests can import the exact constants the engine uses.

/** Dimension match tolerance — 1/16". Covers rounding + CropBox/MediaBox jitter. */
export const SIZE_TOL_IN = 0.0625;

/** Bleed-inference tolerance — 1/32". */
export const BLEED_TOL_IN = 0.03125;

export const MIN_DPI = 300;
export const WARN_DPI = 250;

export const SIZE_REC_MB = 40;
export const SIZE_HARD_MB = 650;

/** Outer margins KDP wraps around the trim, mirrored from lib/kdp/calc.ts. Used
 *  to infer whether bleed/wrap is present from the finished file's size. */
export const PAPERBACK_BLEED_IN = 0.125;
export const HARDCOVER_WRAP_IN = 0.51;

export const PT_PER_IN = 72;

export function bytesToMb(bytes: number): number {
  return bytes / (1024 * 1024);
}

export function effectiveDpi(pixels: number, physicalIn: number): number {
  if (physicalIn <= 0) return 0;
  return pixels / physicalIn;
}

/** True when |a - b| is within tol. */
export function near(a: number, b: number, tol: number): boolean {
  return Math.abs(a - b) <= tol;
}

/** True when (w,h) matches (tw,th) in either orientation, within tol. */
export function matchesEitherOrientation(
  w: number,
  h: number,
  tw: number,
  th: number,
  tol: number,
): boolean {
  return (near(w, tw, tol) && near(h, th, tol)) || (near(w, th, tol) && near(h, tw, tol));
}
