import type { CoverCalcOutput, CoverInput } from "@kdp/calc";
import type { CheckStatus, FileAnalysis, PreflightCheck, PreflightReport } from "./types";
import {
  HARDCOVER_WRAP_IN,
  MIN_DPI,
  PAPERBACK_BLEED_IN,
  SIZE_HARD_MB,
  SIZE_REC_MB,
  SIZE_TOL_IN,
  WARN_DPI,
  bytesToMb,
  effectiveDpi,
  matchesEitherOrientation,
  near,
} from "./dpi";

const inch = (n: number) => `${n.toFixed(3)}″`;
const ASPECT_TOL = 0.02; // 2% — proportion check for DPI-less rasters

function worst(checks: PreflightCheck[]): CheckStatus {
  let overall: CheckStatus = "pass";
  for (const c of checks) {
    if (c.advisory) continue;
    if (c.status === "fail") return "fail";
    if (c.status === "warn") overall = "warn";
  }
  return overall;
}

/**
 * The pure Pass-Check decision: given the analyzed file, the calculator's target
 * geometry, and the buyer's book spec, produce an ordered report. No DOM, no
 * fetch — fully unit-testable. `calc` must be the calcCover() output for `input`.
 */
export function evaluatePreflight(
  analysis: FileAnalysis,
  calc: CoverCalcOutput,
  input: CoverInput,
): PreflightReport {
  const checks: PreflightCheck[] = [];
  const targetW = calc.fullCoverWidthIn;
  const targetH = calc.fullCoverHeightIn;
  const isPdf = analysis.kind === "pdf";
  const isRaster = analysis.kind === "png" || analysis.kind === "jpg";
  const formatWord = input.format === "hardcover" ? "hardcover" : "paperback";
  const marginWord = input.format === "hardcover" ? "wrap" : "bleed";
  const outerMargin = input.format === "hardcover" ? HARDCOVER_WRAP_IN : PAPERBACK_BLEED_IN;
  const trimLabel = `${input.trimWidthIn}×${input.trimHeightIn}″`;

  // Unreadable file → single hard fail; nothing else can be trusted.
  if (analysis.error || analysis.kind === "unknown") {
    checks.push({
      id: "file-readable",
      label: "File readable",
      status: "fail",
      detail: analysis.error
        ? `Couldn't read this file: ${analysis.error}`
        : "Unrecognized file type.",
      fix: "Upload a print-ready PDF (recommended), or a PNG/JPG cover image.",
    });
    return { overall: "fail", checks, analysis };
  }

  // 1. File format
  checks.push(
    isPdf
      ? {
          id: "file-format",
          label: "File format",
          status: "pass",
          detail: "PDF — the format KDP wants for a print cover.",
        }
      : {
          id: "file-format",
          label: "File format",
          status: "warn",
          detail: "This is an image (PNG/JPG); checks below use it directly.",
          fix: "KDP's print cover upload expects a single flattened PDF — export one before you submit.",
        },
  );

  // 2. Single-page (PDF only)
  if (isPdf) {
    const pages = analysis.pageCount ?? 1;
    checks.push(
      pages === 1
        ? {
            id: "single-page",
            label: "Single-page PDF",
            status: "pass",
            detail: "One flattened page (back + spine + front).",
          }
        : {
            id: "single-page",
            label: "Single-page PDF",
            status: "fail",
            detail: `PDF has ${pages} pages. A KDP print cover must be a single page.`,
            fix: "Combine back, spine, and front onto one flattened page.",
          },
    );
  }

  // 3. Full-cover size (orientation folded in)
  const hasPhysical =
    typeof analysis.widthIn === "number" && typeof analysis.heightIn === "number";
  const pxW = analysis.pixelWidth;
  const pxH = analysis.pixelHeight;

  if (hasPhysical) {
    const fw = analysis.widthIn as number;
    const fh = analysis.heightIn as number;
    const exact = near(fw, targetW, SIZE_TOL_IN) && near(fh, targetH, SIZE_TOL_IN);
    const rotated = near(fw, targetH, SIZE_TOL_IN) && near(fh, targetW, SIZE_TOL_IN);
    if (exact) {
      checks.push({
        id: "full-cover-size",
        label: "Full-cover size",
        status: "pass",
        detail: `${inch(fw)} × ${inch(fh)} matches the required full-cover size.`,
      });
    } else if (rotated) {
      checks.push({
        id: "full-cover-size",
        label: "Full-cover size",
        status: "warn",
        detail: `${inch(fw)} × ${inch(fh)} matches the target but is rotated 90°.`,
        fix: `Rotate so the page is ${inch(targetW)} × ${inch(targetH)} (width × height).`,
      });
    } else {
      const close =
        near(fw, targetW, 2 * SIZE_TOL_IN) && near(fh, targetH, 2 * SIZE_TOL_IN);
      checks.push({
        id: "full-cover-size",
        label: "Full-cover size",
        status: close ? "warn" : "fail",
        detail: `Found ${inch(fw)} × ${inch(fh)}; KDP needs ${inch(targetW)} × ${inch(targetH)} for a ${input.pageCount}-page ${trimLabel} ${formatWord}.`,
        fix: `Resize the document to exactly ${inch(targetW)} × ${inch(targetH)}.`,
      });
    }
  } else if (isRaster && pxW && pxH) {
    const aspectFound = pxW / pxH;
    const aspectTarget = targetW / targetH;
    const ok = near(aspectFound, aspectTarget, ASPECT_TOL);
    const swapped = near(aspectFound, targetH / targetW, ASPECT_TOL);
    checks.push({
      id: "full-cover-size",
      label: "Full-cover proportions",
      status: ok ? "pass" : swapped ? "warn" : "fail",
      detail: ok
        ? `${pxW}×${pxH}px matches the ${inch(targetW)} × ${inch(targetH)} full-cover shape.`
        : swapped
          ? `${pxW}×${pxH}px matches the target but is rotated 90°.`
          : `${pxW}×${pxH}px (ratio ${aspectFound.toFixed(3)}) doesn't match the full-cover ratio ${aspectTarget.toFixed(3)}.`,
      fix: ok
        ? undefined
        : `Match the ${inch(targetW)} × ${inch(targetH)} full-cover shape (no embedded DPI, so size is judged by proportion + resolution).`,
    });
  } else {
    checks.push({
      id: "full-cover-size",
      label: "Full-cover size",
      status: "warn",
      detail: "Couldn't read the file's dimensions.",
      fix: "Upload a PDF, or a PNG/JPG with standard headers.",
    });
  }

  // 4. Bleed / wrap present (only with a physical size to compare)
  if (hasPhysical) {
    const fw = analysis.widthIn as number;
    const fh = analysis.heightIn as number;
    const withBleed = matchesEitherOrientation(fw, fh, targetW, targetH, SIZE_TOL_IN);
    const noBleedW = targetW - 2 * outerMargin;
    const noBleedH = targetH - 2 * outerMargin;
    const trimOnly = matchesEitherOrientation(fw, fh, noBleedW, noBleedH, SIZE_TOL_IN);
    if (withBleed) {
      checks.push({
        id: "bleed-present",
        label: `${marginWord[0].toUpperCase()}${marginWord.slice(1)} present`,
        status: "pass",
        detail: `Includes the ${outerMargin}″ ${marginWord} on every edge.`,
      });
    } else if (trimOnly) {
      checks.push({
        id: "bleed-present",
        label: `${marginWord[0].toUpperCase()}${marginWord.slice(1)} present`,
        status: "fail",
        detail: `File is trim-sized — the ${outerMargin}″ ${marginWord} is missing on every edge.`,
        fix: `Add ${outerMargin}″ ${marginWord} on all four sides (final size ${inch(targetW)} × ${inch(targetH)}).`,
      });
    } else {
      checks.push({
        id: "bleed-present",
        label: `${marginWord[0].toUpperCase()}${marginWord.slice(1)} present`,
        status: "warn",
        detail: `Couldn't confirm the ${outerMargin}″ ${marginWord} from the file size.`,
        fix: `Make sure the cover extends ${outerMargin}″ past the trim on every edge.`,
      });
    }
  }

  // 5. Resolution / DPI
  if (isRaster && pxW && pxH) {
    const dpi = Math.min(effectiveDpi(pxW, targetW), effectiveDpi(pxH, targetH));
    const status: CheckStatus = dpi >= MIN_DPI ? "pass" : dpi >= WARN_DPI ? "warn" : "fail";
    checks.push({
      id: "resolution-dpi",
      label: "Resolution",
      status,
      detail: `≈ ${Math.round(dpi)} DPI at the full-cover size (${pxW}×${pxH}px).`,
      fix:
        status === "pass"
          ? undefined
          : `Re-export at ≥ ${Math.round(targetW * MIN_DPI)}×${Math.round(targetH * MIN_DPI)}px (300 DPI), or supply a PDF.`,
    });
  } else if (isPdf) {
    if (typeof analysis.minImageDpi === "number") {
      const dpi = analysis.minImageDpi;
      const status: CheckStatus =
        dpi >= MIN_DPI ? "pass" : dpi >= WARN_DPI ? "warn" : "fail";
      checks.push({
        id: "resolution-dpi",
        label: "Resolution",
        status,
        detail: `Lowest embedded image ≈ ${Math.round(dpi)} DPI.`,
        fix: status === "pass" ? undefined : "Replace low-res images with ≥300 DPI versions.",
      });
    } else if (analysis.hasRasterImages) {
      checks.push({
        id: "resolution-dpi",
        label: "Resolution",
        status: "warn",
        advisory: true,
        detail: "Contains placed image(s); couldn't auto-measure their DPI here.",
        fix: "Confirm every placed image is ≥ 300 DPI at its final printed size.",
      });
    } else {
      checks.push({
        id: "resolution-dpi",
        label: "Resolution",
        status: "pass",
        detail: "Vector / text PDF — resolution-independent.",
      });
    }
  }

  // 6. Fonts embedded (PDF, when font info is available)
  if (isPdf && analysis.fonts) {
    if (analysis.fonts.length === 0) {
      checks.push({
        id: "fonts-embedded",
        label: "Fonts embedded",
        status: "pass",
        detail: "No embedded text fonts (artwork is outlined or raster).",
      });
    } else {
      const missing = analysis.fonts.filter((f) => !f.embedded);
      checks.push(
        missing.length === 0
          ? {
              id: "fonts-embedded",
              label: "Fonts embedded",
              status: "pass",
              detail: `All ${analysis.fonts.length} font(s) embedded.`,
            }
          : {
              id: "fonts-embedded",
              label: "Fonts embedded",
              status: "fail",
              detail: `${missing.length} font(s) not embedded: ${missing
                .map((f) => f.name)
                .slice(0, 4)
                .join(", ")}.`,
              fix: "Embed all fonts, or convert text to outlines before exporting.",
            },
      );
    }
  }

  // 7. Color space
  const cs = analysis.colorSpace;
  if (cs && cs !== "unknown") {
    if (cs === "rgb") {
      checks.push({
        id: "color-space",
        label: "Color space",
        status: "warn",
        detail: analysis.hasTransparency
          ? "RGB with transparency. KDP prefers CMYK and a flattened file."
          : "RGB. KDP accepts it but prefers CMYK; colors may shift on press.",
        fix: "Convert to CMYK and flatten transparency for predictable print color.",
      });
    } else {
      checks.push({
        id: "color-space",
        label: "Color space",
        status: analysis.hasTransparency ? "warn" : "pass",
        detail: analysis.hasTransparency
          ? `${cs.toUpperCase()} with transparency — flatten before export.`
          : `${cs.toUpperCase()} — print-ready.`,
        fix: analysis.hasTransparency ? "Flatten transparency before export." : undefined,
      });
    }
  } else {
    checks.push({
      id: "color-space",
      label: "Color space",
      status: "pass",
      advisory: true,
      detail: "Couldn't read the color space — confirm CMYK (or RGB) and no stray transparency.",
    });
  }

  // 8. File size
  const mb = bytesToMb(analysis.byteSize);
  checks.push({
    id: "file-size",
    label: "File size",
    status: mb <= SIZE_REC_MB ? "pass" : mb <= SIZE_HARD_MB ? "warn" : "fail",
    detail:
      mb <= SIZE_REC_MB
        ? `${mb.toFixed(1)} MB — within KDP's recommended ≤ ${SIZE_REC_MB} MB.`
        : mb <= SIZE_HARD_MB
          ? `${mb.toFixed(1)} MB — over the ${SIZE_REC_MB} MB recommendation but under the ${SIZE_HARD_MB} MB limit.`
          : `${mb.toFixed(1)} MB — over KDP's ${SIZE_HARD_MB} MB hard limit.`,
    fix:
      mb <= SIZE_HARD_MB
        ? mb <= SIZE_REC_MB
          ? undefined
          : "Downsample images to 300 DPI to slim the file."
        : "Downsample / flatten to get under 650 MB.",
  });

  // 9. Spine-text eligibility (advisory)
  checks.push({
    id: "spine-text",
    label: "Spine text",
    status: calc.spineTextEligible ? "pass" : "warn",
    advisory: true,
    detail: calc.spineTextEligible
      ? `Spine is wide enough for text (${input.pageCount}p, spine ${calc.spineWidthIn.toFixed(3)}″).`
      : `Spine too narrow for text/logo at ${input.pageCount}p (KDP needs ≥ 79 pages). Keep the spine artwork-only.`,
  });

  // 10. Barcode area (advisory)
  checks.push({
    id: "barcode-area",
    label: "Barcode area",
    status: "pass",
    advisory: true,
    detail:
      "Leave a 2″ × 1.2″ clear area at the bottom-right of the back cover for KDP's barcode.",
  });

  return { overall: worst(checks), checks, analysis };
}
