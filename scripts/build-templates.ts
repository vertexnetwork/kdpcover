/**
 * Build the deliverable template library.
 *
 * Run with: npm run build:templates
 *
 * Outputs (per tier):
 *   dist/templates/<tier>/<format>/<paper>/<trim>/*.svg   — print-ready SVG
 *   dist/templates/<tier>/<format>/<paper>/<trim>/*.pdf   — same geometry, PDF
 *   dist/templates/cheatsheet.html                        — single-page reference
 *
 * After running this, zip each tier (PowerShell on Windows):
 *   Compress-Archive -Path dist/templates/single     -DestinationPath dist/templates/single.zip
 *   Compress-Archive -Path dist/templates/universal  -DestinationPath dist/templates/universal.zip
 *   Compress-Archive -Path dist/templates/mega       -DestinationPath dist/templates/mega.zip
 *
 * Upload the three zips to Lemon Squeezy as the digital deliverable per
 * variant, then fill in NEXT_PUBLIC_LS_VARIANT_* envs in Vercel — the buy
 * buttons activate automatically.
 */

import { mkdirSync, writeFileSync, createWriteStream } from "node:fs";
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

type Tier = "single" | "universal" | "mega";

function ensureDir(path: string) {
  mkdirSync(path, { recursive: true });
}

function baseNameFor(format: Format, paper: Paper, pages: number, tw: number, th: number): string {
  return `kdp_${format}_${paper}_${pages}p_${tw}x${th}`;
}

const POINTS_PER_INCH = 72;

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

async function emit(tier: Tier, format: Format, paper: Paper, pages: number, tw: number, th: number) {
  const input = { format, paper, pageCount: pages, trimWidthIn: tw, trimHeightIn: th };
  const out = calcCover(input);
  const svg = buildTemplateSvg(input, out);

  const tierDir = join(OUT, tier);
  const subDir = join(tierDir, format, paper, `${tw}x${th}`);
  ensureDir(subDir);
  const base = baseNameFor(format, paper, pages, tw, th);
  writeFileSync(join(subDir, `${base}.svg`), svg, "utf8");
  await writePdfFromSvg(svg, out.fullCoverWidthIn, out.fullCoverHeightIn, join(subDir, `${base}.pdf`));
}

async function buildSingle(): Promise<number> {
  // Twelve canonical samples covering the most common (trim, paper, pages)
  // combos — we include this set with the "Single" SKU as a starter
  // library; buyers pick the file matching their book.
  const samples: { f: Format; p: Paper; pages: number; tw: number; th: number }[] = [
    { f: "paperback", p: "white", pages: 200, tw: 6, th: 9 },
    { f: "paperback", p: "white", pages: 300, tw: 6, th: 9 },
    { f: "paperback", p: "white", pages: 400, tw: 6, th: 9 },
    { f: "paperback", p: "cream", pages: 200, tw: 5.5, th: 8.5 },
    { f: "paperback", p: "cream", pages: 300, tw: 5.5, th: 8.5 },
    { f: "paperback", p: "cream", pages: 400, tw: 5.5, th: 8.5 },
    { f: "paperback", p: "white", pages: 250, tw: 5, th: 8 },
    { f: "paperback", p: "white", pages: 350, tw: 5, th: 8 },
    { f: "paperback", p: "color-premium", pages: 100, tw: 8.5, th: 11 },
    { f: "paperback", p: "color-premium", pages: 200, tw: 8.5, th: 11 },
    { f: "paperback", p: "white", pages: 220, tw: 7, th: 10 },
    { f: "paperback", p: "white", pages: 320, tw: 7, th: 10 },
  ];
  for (const s of samples) {
    await emit("single", s.f, s.p, s.pages, s.tw, s.th);
  }
  return samples.length;
}

async function buildPaperbackInto(tier: Tier): Promise<number> {
  // Every paperback combo across the 5 most-used trims and full page-count
  // grid. This is the hero SKU — the buyer never has to recompute spine
  // width again across the lifetime of their backlist.
  const trims = PAPERBACK_TRIMS.filter((t) =>
    ["5x8", "5.5x8.5", "6x9", "7x10", "8.5x11"].includes(t.slug),
  );
  const buckets = pSeoPageBuckets("paperback");
  let n = 0;
  for (const trim of trims) {
    for (const paper of ALL_PAPERS) {
      for (const pages of buckets) {
        await emit(tier, "paperback", paper, pages, trim.widthIn, trim.heightIn);
        n++;
      }
    }
  }
  return n;
}

async function buildUniversal(): Promise<number> {
  return buildPaperbackInto("universal");
}

async function buildMega(): Promise<number> {
  let n = await buildPaperbackInto("mega");
  // Hardcover across all KDP-supported case-laminate trims.
  const hcBuckets = pSeoPageBuckets("hardcover");
  for (const trim of HARDCOVER_TRIMS) {
    for (const paper of ALL_PAPERS) {
      for (const pages of hcBuckets) {
        await emit("mega", "hardcover", paper, pages, trim.widthIn, trim.heightIn);
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
  ensureDir(OUT);
  writeFileSync(join(OUT, "cheatsheet.html"), html, "utf8");
}

async function main() {
  ensureDir(OUT);
  const t0 = Date.now();
  const single = await buildSingle();
  const universal = await buildUniversal();
  const mega = await buildMega();
  buildCheatsheet();
  const seconds = ((Date.now() - t0) / 1000).toFixed(1);

  console.log(`✓ single:    ${single} covers (SVG + PDF)`);
  console.log(`✓ universal: ${universal} covers (SVG + PDF)`);
  console.log(`✓ mega:      ${mega} covers (SVG + PDF)`);
  console.log(`✓ cheatsheet.html`);
  console.log(`  emitted in ${seconds}s`);
  console.log("");
  console.log(`Output: ${OUT}`);
  console.log("");
  console.log("Next: zip each tier (Compress-Archive on Windows), upload to Lemon Squeezy.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
