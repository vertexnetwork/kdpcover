/**
 * KDP cover & spine width — pure formula engine.
 *
 * All multipliers are verified against KDP's cover-template generator.
 * Sources: see PLAN.md §3.4. No React imports allowed in this file.
 */

export type Format = "paperback" | "hardcover";
export type Paper = "white" | "cream" | "color-standard" | "color-premium";

export type CoverInput = {
  format: Format;
  paper: Paper;
  pageCount: number;
  trimWidthIn: number;
  trimHeightIn: number;
};

export type SafeZones = {
  top: number;
  bottom: number;
  outside: number;
  spineHinge: number;
};

export type BarcodeBox = {
  x: number;
  y: number;
  w: number;
  h: number;
};

export type CoverCalcOutput = {
  spineWidthIn: number;
  spineWidthMm: number;
  fullCoverWidthIn: number;
  fullCoverHeightIn: number;
  fullCoverWidthMm: number;
  fullCoverHeightMm: number;
  spineTextEligible: boolean;
  warnings: string[];
  barcodeBox: BarcodeBox;
  safeZones: SafeZones;
};

const IN_TO_MM = 25.4;

const SPINE_MULTIPLIER: Record<Format, Record<Paper, number>> = {
  paperback: {
    white: 0.002252,
    cream: 0.0025,
    "color-standard": 0.002252,
    "color-premium": 0.002347,
  },
  hardcover: {
    white: 0.002347,
    cream: 0.002347,
    "color-standard": 0.002347,
    "color-premium": 0.002347,
  },
};

const BLEED_IN = 0.125;
const HARDCOVER_HINGE_IN = 0.4;
const HARDCOVER_WRAP_IN = 0.51;
const HARDCOVER_OUTSIDE_SAFE_IN = 0.635;
const PAPERBACK_OUTSIDE_SAFE_IN = 0.125;
const SPINE_TEXT_MIN_PAGES = 79;

export function spineMultiplier(format: Format, paper: Paper): number {
  return SPINE_MULTIPLIER[format][paper];
}

export function spineWidthIn(input: Pick<CoverInput, "format" | "paper" | "pageCount">): number {
  return input.pageCount * spineMultiplier(input.format, input.paper);
}

export function calcCover(input: CoverInput): CoverCalcOutput {
  const { format, pageCount, trimWidthIn: tw, trimHeightIn: th } = input;
  const spine = spineWidthIn(input);
  const warnings: string[] = [];

  let fullW: number;
  let fullH: number;
  let safeZones: SafeZones;
  let barcodeBox: BarcodeBox;

  if (format === "paperback") {
    fullW = 2 * tw + spine + 2 * BLEED_IN;
    fullH = th + 2 * BLEED_IN;
    safeZones = {
      top: BLEED_IN + PAPERBACK_OUTSIDE_SAFE_IN,
      bottom: BLEED_IN + PAPERBACK_OUTSIDE_SAFE_IN,
      outside: BLEED_IN + PAPERBACK_OUTSIDE_SAFE_IN,
      spineHinge: 0,
    };
    barcodeBox = paperbackBarcodeBox({ fullW, fullH, tw, spine });
  } else {
    fullW = 2 * tw + spine + 2 * HARDCOVER_HINGE_IN + 2 * HARDCOVER_WRAP_IN;
    fullH = th + 2 * HARDCOVER_WRAP_IN;
    safeZones = {
      top: HARDCOVER_WRAP_IN + HARDCOVER_OUTSIDE_SAFE_IN,
      bottom: HARDCOVER_WRAP_IN + HARDCOVER_OUTSIDE_SAFE_IN,
      outside: HARDCOVER_WRAP_IN + HARDCOVER_OUTSIDE_SAFE_IN,
      spineHinge: HARDCOVER_HINGE_IN,
    };
    barcodeBox = hardcoverBarcodeBox({ fullW, fullH, tw, spine });
  }

  const spineTextEligible =
    pageCount >= SPINE_TEXT_MIN_PAGES &&
    (format === "paperback" || pageCount >= SPINE_TEXT_MIN_PAGES);

  return {
    spineWidthIn: round4(spine),
    spineWidthMm: round4(spine * IN_TO_MM),
    fullCoverWidthIn: round4(fullW),
    fullCoverHeightIn: round4(fullH),
    fullCoverWidthMm: round4(fullW * IN_TO_MM),
    fullCoverHeightMm: round4(fullH * IN_TO_MM),
    spineTextEligible,
    warnings,
    barcodeBox,
    safeZones,
  };
}

function paperbackBarcodeBox({
  fullW,
  fullH,
  tw,
  spine,
}: {
  fullW: number;
  fullH: number;
  tw: number;
  spine: number;
}): BarcodeBox {
  // 2" × 1.2" recommended; bottom-right of back cover (back is on the LEFT
  // of the unfolded layout). 0.25" from spine + trim edges, 0.76" from bottom.
  const w = 2;
  const h = 1.2;
  const x = BLEED_IN + tw - 0.25 - w; // 0.25" from inside (spine) edge of back
  const y = fullH - BLEED_IN - 0.76 - h;
  return { x: round4(x), y: round4(y), w, h };
  void spine;
  void fullW;
}

function hardcoverBarcodeBox({
  fullW,
  fullH,
  tw,
  spine,
}: {
  fullW: number;
  fullH: number;
  tw: number;
  spine: number;
}): BarcodeBox {
  const w = 2;
  const h = 1.2;
  const x = HARDCOVER_WRAP_IN + tw - 0.25 - w;
  const y = fullH - HARDCOVER_WRAP_IN - 0.76 - h;
  return { x: round4(x), y: round4(y), w, h };
  void spine;
  void fullW;
}

function round4(n: number): number {
  return Math.round(n * 10000) / 10000;
}

export const CONSTANTS = {
  IN_TO_MM,
  BLEED_IN,
  HARDCOVER_HINGE_IN,
  HARDCOVER_WRAP_IN,
  HARDCOVER_OUTSIDE_SAFE_IN,
  PAPERBACK_OUTSIDE_SAFE_IN,
  SPINE_TEXT_MIN_PAGES,
  SPINE_MULTIPLIER,
} as const;
