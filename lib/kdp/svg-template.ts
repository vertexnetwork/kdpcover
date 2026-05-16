import type { CoverInput, CoverCalcOutput } from "./calc";
import { calcCover } from "./calc";

const SAGE = "#9CAF88";
const WARM = "#C97B5C";
const INK = "#1F2421";
const HINGE = "#C97B5C";

const POINTS_PER_INCH = 72;

/**
 * Build a print-ready SVG template (in points / 72 DPI). Geometry is the
 * unfolded layout: back panel | spine | front panel, with bleed/wrap, safe
 * zones, hinge dead-zones (hardcover), and barcode placeholder.
 *
 * Importable in Affinity Publisher, Illustrator, Inkscape, Figma. Strokes are
 * thin and stylesheet-free so the file drops cleanly into any layout app.
 */
export function buildTemplateSvg(input: CoverInput, output?: CoverCalcOutput): string {
  const out = output ?? calcCover(input);
  const { format, trimWidthIn: tw } = input;
  const { fullCoverWidthIn: W, fullCoverHeightIn: H, spineWidthIn: S, safeZones, barcodeBox } = out;

  const w = W * POINTS_PER_INCH;
  const h = H * POINTS_PER_INCH;
  const edge = format === "paperback" ? 0.125 : 0.51;
  const safeInset = format === "paperback" ? 0.125 : 0.635;

  // Anchor panels in inches relative to (0,0); convert when emitting.
  const backX = edge;
  const panelY = edge;
  const panelH = H - 2 * edge;
  const spineX = backX + tw;
  const frontX = spineX + S;

  const inToPt = (v: number) => round2(v * POINTS_PER_INCH);

  const layers: string[] = [];

  layers.push(
    `<rect x="0" y="0" width="${round2(w)}" height="${round2(h)}" fill="#FBF7EB" stroke="${INK}" stroke-width="0.5"/>`,
  );

  if (format === "hardcover") {
    layers.push(
      `<rect x="${inToPt(backX)}" y="${inToPt(panelY)}" width="${inToPt(W - 2 * edge)}" height="${inToPt(panelH)}" fill="none" stroke="${SAGE}" stroke-width="0.5" stroke-dasharray="4 4"/>`,
    );
  }

  layers.push(
    `<rect x="${inToPt(backX)}" y="${inToPt(panelY)}" width="${inToPt(tw)}" height="${inToPt(panelH)}" fill="none" stroke="${INK}" stroke-width="0.75"/>`,
    `<rect x="${inToPt(spineX)}" y="${inToPt(panelY)}" width="${inToPt(S)}" height="${inToPt(panelH)}" fill="${SAGE}" fill-opacity="0.12" stroke="${INK}" stroke-width="0.75"/>`,
    `<rect x="${inToPt(frontX)}" y="${inToPt(panelY)}" width="${inToPt(tw)}" height="${inToPt(panelH)}" fill="none" stroke="${INK}" stroke-width="0.75"/>`,
  );

  layers.push(
    `<rect x="${inToPt(backX + safeInset)}" y="${inToPt(panelY + safeInset)}" width="${inToPt(tw - 2 * safeInset)}" height="${inToPt(panelH - 2 * safeInset)}" fill="none" stroke="${WARM}" stroke-width="0.5" stroke-dasharray="3 3"/>`,
    `<rect x="${inToPt(frontX + safeInset)}" y="${inToPt(panelY + safeInset)}" width="${inToPt(tw - 2 * safeInset)}" height="${inToPt(panelH - 2 * safeInset)}" fill="none" stroke="${WARM}" stroke-width="0.5" stroke-dasharray="3 3"/>`,
  );

  if (format === "hardcover" && safeZones.spineHinge > 0) {
    layers.push(
      `<rect x="${inToPt(spineX - safeZones.spineHinge)}" y="${inToPt(panelY)}" width="${inToPt(safeZones.spineHinge)}" height="${inToPt(panelH)}" fill="${HINGE}" fill-opacity="0.12"/>`,
      `<rect x="${inToPt(spineX + S)}" y="${inToPt(panelY)}" width="${inToPt(safeZones.spineHinge)}" height="${inToPt(panelH)}" fill="${HINGE}" fill-opacity="0.12"/>`,
    );
  }

  layers.push(
    `<rect x="${inToPt(barcodeBox.x)}" y="${inToPt(barcodeBox.y)}" width="${inToPt(barcodeBox.w)}" height="${inToPt(barcodeBox.h)}" fill="${INK}" fill-opacity="0.06" stroke="${INK}" stroke-width="0.5"/>`,
    `<text x="${inToPt(barcodeBox.x + barcodeBox.w / 2)}" y="${inToPt(barcodeBox.y + barcodeBox.h / 2)}" font-family="Inter, system-ui, sans-serif" font-size="9" text-anchor="middle" dominant-baseline="middle" fill="${INK}" fill-opacity="0.6">Barcode 2.0 × 1.2 in</text>`,
  );

  layers.push(
    `<text x="${inToPt(backX + tw / 2)}" y="${inToPt(panelY) - 4}" font-family="Inter, system-ui, sans-serif" font-size="9" text-anchor="middle" fill="${INK}" fill-opacity="0.7">Back</text>`,
    `<text x="${inToPt(frontX + tw / 2)}" y="${inToPt(panelY) - 4}" font-family="Inter, system-ui, sans-serif" font-size="9" text-anchor="middle" fill="${INK}" fill-opacity="0.7">Front</text>`,
  );

  if (S >= 0.25) {
    const cx = inToPt(spineX + S / 2);
    const cy = inToPt(panelY + panelH / 2);
    layers.push(
      `<text x="${cx}" y="${cy}" font-family="Inter, system-ui, sans-serif" font-size="9" text-anchor="middle" dominant-baseline="middle" fill="${INK}" fill-opacity="0.7" transform="rotate(-90 ${cx} ${cy})">Spine ${out.spineWidthIn.toFixed(4)} in</text>`,
    );
  }

  layers.push(
    `<text x="${inToPt(W / 2)}" y="${round2(h) - 6}" font-family="Inter, system-ui, sans-serif" font-size="8" text-anchor="middle" fill="${INK}" fill-opacity="0.5">${format === "paperback" ? "Paperback" : "Hardcover"} · ${input.paper} · ${input.pageCount} pp · ${input.trimWidthIn} × ${input.trimHeightIn} in · spine ${out.spineWidthIn.toFixed(4)} in (${out.spineWidthMm.toFixed(2)} mm) · kdpcover.pro</text>`,
  );

  // Everything above is guide artwork. It lives in ONE named layer that
  // Inkscape, Illustrator, and Affinity Publisher all expose as a deletable
  // layer/group (Inkscape via inkscape:groupmode/label; Illustrator &
  // Affinity via the top-level <g id>). Deleting it leaves a correctly-sized,
  // empty canvas for the buyer's own cover artwork — so the "toggle off the
  // guides before export" promise is literally true.
  const guideLabel = "KDP GUIDES — DELETE THIS LAYER BEFORE EXPORTING TO KDP";

  return [
    `<?xml version="1.0" encoding="UTF-8"?>`,
    `<svg xmlns="http://www.w3.org/2000/svg" xmlns:inkscape="http://www.inkscape.org/namespaces/inkscape" width="${round2(w)}pt" height="${round2(h)}pt" viewBox="0 0 ${round2(w)} ${round2(h)}">`,
    `  <title>KDP ${format} ${input.paper} ${input.pageCount}pp ${input.trimWidthIn}×${input.trimHeightIn} cover template</title>`,
    `  <desc>Full cover ${out.fullCoverWidthIn.toFixed(4)} × ${out.fullCoverHeightIn.toFixed(4)} in, spine ${out.spineWidthIn.toFixed(4)} in (${out.spineWidthMm.toFixed(2)} mm). The visible guides are on one layer named "${guideLabel}". Place your artwork below it, then delete the guide layer before exporting your final PDF to KDP. Generated by kdpcover.pro.</desc>`,
    `  <g id="kdp-guides" inkscape:groupmode="layer" inkscape:label="${guideLabel}">`,
    ...layers.map((l) => `    ${l}`),
    `  </g>`,
    `</svg>`,
  ].join("\n");
}

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}
