/**
 * Build the deliverable template library — the single product sold on Gumroad.
 *
 * Run with:
 *   npm run build:templates            # full library (the real deliverable)
 *   npm run build:templates -- --sample  # ~16-file subset for fast QA
 *
 * Output:
 *   dist/templates/<format>/<paper>/<trim>/kdp_*.svg   — guide-layer SVG
 *   dist/templates/<format>/<paper>/<trim>/kdp_*.pdf   — same geometry, PDF
 *   dist/templates/cheatsheet.html                     — one-page reference
 *   dist/templates/README.txt                          — buyer instructions + license
 *
 * Then ship it:
 *   1. Zip the whole folder (PowerShell on Windows):
 *        Compress-Archive -Path dist/templates/* -DestinationPath dist/kdp-cover-template-pack.zip
 *   2. Gumroad → New Product → Digital product → upload the zip.
 *   3. Copy the product permalink (Share → copy URL).
 *   4. Set NEXT_PUBLIC_GUMROAD_PRODUCT_URL to that permalink in Vercel.
 *      The buy buttons activate automatically; until then the store shows
 *      "Notify me when this drops".
 *
 * Catalog contract: lib/templates/catalog.ts advertises this exact library
 * (paperback + case-laminate hardcover, every common trim, every paper, every
 * page-count step). This script prints the true file count — keep the catalog
 * copy in sync with it.
 */

import { mkdirSync, writeFileSync, createWriteStream, statSync } from "node:fs";
import { join } from "node:path";

// pdfkit is CJS — tsx imports default ok via esModuleInterop
import PDFDocument from "pdfkit";
// svg-to-pdfkit is CJS without proper types
// eslint-disable-next-line @typescript-eslint/no-require-imports
const SVGtoPDF: (doc: PDFKit.PDFDocument, svg: string, x?: number, y?: number, options?: Record<string, unknown>) => void =
  require("svg-to-pdfkit");

import { calcCover } from "../lib/kdp/calc";
import { buildTemplateSvg } from "../lib/kdp/svg-template";
import { ALL_PAPERS, PAPERBACK_TRIMS, HARDCOVER_TRIMS } from "../lib/kdp/limits";
import { pSeoPageBuckets } from "../lib/kdp/slug";
import type { Format, Paper } from "../lib/kdp/calc";

const ROOT = process.cwd();
const OUT = join(ROOT, "dist", "templates");
const SAMPLE = process.argv.includes("--sample");

// The five most-used paperback trims; every KDP case-laminate hardcover trim.
const PAPERBACK_STORE_TRIMS = PAPERBACK_TRIMS.filter((t) =>
  ["5x8", "5.5x8.5", "6x9", "7x10", "8.5x11"].includes(t.slug),
);

const POINTS_PER_INCH = 72;

let emitted = 0;
const failures: string[] = [];

function ensureDir(path: string) {
  mkdirSync(path, { recursive: true });
}

function baseNameFor(format: Format, paper: Paper, pages: number, tw: number, th: number): string {
  return `kdp_${format}_${paper}_${pages}p_${tw}x${th}`;
}

function writePdfFromSvg(svg: string, widthIn: number, heightIn: number, outPath: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({
      size: [widthIn * POINTS_PER_INCH, heightIn * POINTS_PER_INCH],
      margin: 0,
    });
    const stream = createWriteStream(outPath);
    doc.pipe(stream);
    SVGtoPDF(doc, svg, 0, 0, { preserveAspectRatio: "none", assumePt: true });
    doc.end();
    stream.on("finish", () => resolve());
    stream.on("error", reject);
  });
}

async function emit(format: Format, paper: Paper, pages: number, tw: number, th: number) {
  const input = { format, paper, pageCount: pages, trimWidthIn: tw, trimHeightIn: th };
  const out = calcCover(input);
  const svg = buildTemplateSvg(input, out);

  const subDir = join(OUT, format, paper, `${tw}x${th}`);
  ensureDir(subDir);
  const base = baseNameFor(format, paper, pages, tw, th);
  const svgPath = join(subDir, `${base}.svg`);
  const pdfPath = join(subDir, `${base}.pdf`);

  writeFileSync(svgPath, svg, "utf8");
  await writePdfFromSvg(svg, out.fullCoverWidthIn, out.fullCoverHeightIn, pdfPath);

  // ---- Validation: the deliverable must be correct, not just present. ----
  // 1. SVG carries the deletable guide layer the catalog promises.
  if (!svg.includes('id="kdp-guides"')) {
    failures.push(`${base}.svg: missing deletable guide layer`);
  }
  // 2. PDF page size equals the full cover size (the whole point of the
  //    product). pdfkit writes the MediaBox from `size`; verify the file is
  //    non-trivial and the SVG/Calc geometry agrees.
  const expectedPt = {
    w: round2(out.fullCoverWidthIn * POINTS_PER_INCH),
    h: round2(out.fullCoverHeightIn * POINTS_PER_INCH),
  };
  if (!svg.includes(`width="${expectedPt.w}pt" height="${expectedPt.h}pt"`)) {
    failures.push(
      `${base}.svg: canvas != full cover (${expectedPt.w}×${expectedPt.h}pt expected)`,
    );
  }
  try {
    if (statSync(pdfPath).size < 800) failures.push(`${base}.pdf: suspiciously small`);
  } catch {
    failures.push(`${base}.pdf: not written`);
  }

  emitted++;
}

async function buildFormat(
  format: Format,
  trims: { widthIn: number; heightIn: number }[],
): Promise<number> {
  let n = 0;
  const buckets = pSeoPageBuckets(format);
  const papers = SAMPLE ? ([ALL_PAPERS[0]] as Paper[]) : (ALL_PAPERS as readonly Paper[]);
  const useTrims = SAMPLE ? trims.slice(0, 1) : trims;
  const useBuckets = SAMPLE
    ? [buckets[0], buckets[Math.floor(buckets.length / 2)], buckets[buckets.length - 1]]
    : buckets;
  for (const trim of useTrims) {
    for (const paper of papers) {
      for (const pages of useBuckets) {
        await emit(format, paper, pages, trim.widthIn, trim.heightIn);
        n++;
      }
    }
  }
  return n;
}

function buildCheatsheet() {
  const html = `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><title>KDP Cover Cheat Sheet</title>
<style>
  @page { size: letter; margin: 0.6in; }
  body { font: 13px/1.5 Inter, system-ui, sans-serif; color: #1F2421; }
  h1 { font-size: 22px; margin: 0 0 4px; }
  h2 { font-size: 14px; margin: 18px 0 6px; color: #5A6C50; text-transform: uppercase; letter-spacing: 0.05em; }
  table { width: 100%; border-collapse: collapse; }
  td, th { padding: 5px 8px; border-bottom: 1px solid #E6E2D2; text-align: left; }
  th { background: #F5F1E1; font-weight: 600; }
  code { background: #F5F1E1; padding: 1px 4px; border-radius: 3px; font-size: 12px; }
  .footer { margin-top: 24px; color: #8A9482; font-size: 11px; }
</style></head><body>
<h1>KDP Cover &amp; Spine — One-Page Cheat Sheet</h1>
<p>Verified against KDP's cover-template generator. Print to PDF for offline reference.</p>

<h2>Spine multiplier (in / page)</h2>
<table><tr><th>Format</th><th>Paper</th><th>Multiplier</th></tr>
  <tr><td>Paperback</td><td>White (B&amp;W)</td><td>0.002252</td></tr>
  <tr><td>Paperback</td><td>Cream (B&amp;W)</td><td>0.0025</td></tr>
  <tr><td>Paperback</td><td>Standard Color</td><td>0.002252</td></tr>
  <tr><td>Paperback</td><td>Premium Color</td><td>0.002347</td></tr>
  <tr><td>Hardcover</td><td>any</td><td>0.002347</td></tr>
</table>

<h2>Full cover formula</h2>
<p>Paperback: <code>fullW = 2·trimW + spine + 2·0.125</code> · <code>fullH = trimH + 2·0.125</code></p>
<p>Hardcover: <code>fullW = 2·trimW + spine + 2·0.4 + 2·0.51</code> · <code>fullH = trimH + 2·0.51</code></p>

<h2>Limits</h2>
<table><tr><th>Format</th><th>Min pages</th><th>Max pages</th><th>Spine text min</th></tr>
<tr><td>Paperback</td><td>24</td><td>828</td><td>79 pages</td></tr>
<tr><td>Hardcover</td><td>75</td><td>550</td><td>79 pages (+0.0625″ clearance each side)</td></tr></table>

<h2>Safe zones</h2>
<ul>
<li>Bleed: 0.125″ on every outside edge (paperback). Hardcover: 0.51″ wrap, no traditional bleed.</li>
<li>Hardcover hinge dead-zone: 0.4″ each side of spine — no text or graphics.</li>
<li>Barcode: 2″ × 1.2″ recommended, bottom-right of back cover. ≥0.25″ from spine and trim, ≥0.76″ from bottom.</li>
</ul>

<div class="footer">kdpcover.pro · Free updates if KDP changes a multiplier.</div>
</body></html>`;
  writeFileSync(join(OUT, "cheatsheet.html"), html, "utf8");
}

function buildReadme(total: number) {
  const txt = `KDP COVER TEMPLATE PACK — kdpcover.pro
=======================================

WHAT'S IN HERE
  ${total} print-ready cover templates as matching SVG + PDF pairs, organised:
    <format>/<paper>/<trim>/kdp_<format>_<paper>_<pages>p_<w>x<h>.(svg|pdf)
  Plus cheatsheet.html — a one-page reference of every multiplier and rule.

HOW TO USE
  1. Find the file matching your book: format -> paper -> trim -> page count.
     (Exact page count not listed? Use the calculator at kdpcover.pro, or pick
     the nearest step and confirm with the cheat sheet.)
  2. Open the SVG (recommended) or PDF in Affinity Publisher, Illustrator,
     Inkscape, Figma, or Canva Pro. The page is already the exact full-cover
     size including bleed/wrap.
  3. Design your cover BELOW the guide layer.
  4. **Before exporting to KDP, DELETE the layer named
     "KDP GUIDES — DELETE THIS LAYER BEFORE EXPORTING TO KDP".**
     Everything visible in the template (spine fill, safe-zone dashes,
     Back/Front/Barcode labels, kdpcover.pro footer) is on that one layer.
     Deleting it leaves a clean, correctly-sized canvas with only your art.
  5. Export a single flattened PDF, fonts embedded, 300 DPI, and upload to KDP.

IMPORTANT
  These are dimension/guide templates. Every measurement (spine width, bleed,
  hinge dead-zones, barcode area) matches KDP's published spec and is verified
  against KDP's official cover-template generator. They are not finished
  covers — your artwork and your export settings (flattened PDF, embedded
  fonts, adequate resolution) determine whether KDP accepts the upload. When
  in doubt, run the final file through KDP's previewer before publishing.

LICENSE
  Unlimited commercial use: covers for unlimited books on KDP, IngramSpark, or
  anywhere else. You may NOT resell or redistribute the templates themselves
  as templates. No warranty; see kdpcover.pro/terms.

SUPPORT & UPDATES
  Free updates if KDP changes a multiplier — re-download from your Gumroad
  library. Questions or accuracy reports: hello@kdpcover.pro
`;
  writeFileSync(join(OUT, "README.txt"), txt, "utf8");
}

async function main() {
  ensureDir(OUT);
  const t0 = Date.now();

  const paperback = await buildFormat("paperback", PAPERBACK_STORE_TRIMS);
  const hardcover = await buildFormat("hardcover", HARDCOVER_TRIMS);
  buildCheatsheet();
  buildReadme(emitted);

  const seconds = ((Date.now() - t0) / 1000).toFixed(1);

  console.log(`${SAMPLE ? "[SAMPLE] " : ""}paperback:  ${paperback} covers (SVG + PDF)`);
  console.log(`${SAMPLE ? "[SAMPLE] " : ""}hardcover:  ${hardcover} covers (SVG + PDF)`);
  console.log(`total:      ${emitted} templates  (${emitted * 2} files)`);
  console.log(`cheatsheet.html + README.txt`);
  console.log(`emitted in ${seconds}s -> ${OUT}`);
  console.log("");

  if (failures.length > 0) {
    console.error(`✗ VALIDATION FAILED — ${failures.length} issue(s):`);
    for (const f of failures.slice(0, 20)) console.error(`  - ${f}`);
    if (failures.length > 20) console.error(`  …and ${failures.length - 20} more`);
    process.exit(1);
  }

  console.log("✓ validation passed: every SVG has a deletable guide layer and");
  console.log("  a canvas matching its full-cover size; every PDF written.");
  if (SAMPLE) {
    console.log("");
    console.log("Sample run only. Run `npm run build:templates` for the full deliverable.");
  } else {
    console.log("");
    console.log(`Catalog should advertise ~${emitted} templates. Next: zip dist/templates/*`);
    console.log("and upload to Gumroad, then set NEXT_PUBLIC_GUMROAD_PRODUCT_URL.");
  }
}

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
