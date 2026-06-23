// Build the Gumroad listing imagery for Cover Pass-Check: cover (1280×720),
// thumbnail (600×600), and five previews (1280×800). Generated as SVG strings
// and rasterized to PNG via sharp.
//
// Copy is hand-tuned for conversion: every image leads with a specific, painful
// failure (a trim-sized RGB file with an unembedded font that KDP would reject)
// rather than a feature list. Buyers self-identify with the rejection before
// they evaluate the product. Mirrors the etsy-margin pattern.
//
// Usage: `npm run build:images`
// Outputs: temp/gumroad-product/{cover,thumbnail,preview-1..5}.png

import fs from "node:fs";
import path from "node:path";
import sharp from "sharp";

const OUT_DIR = path.resolve("temp/gumroad-product");

// kdpcover.pro palette — mirrors lib/site-config.ts theme tokens.
const C = {
  ink: "#1F2421", // onBg
  ink2: "#2B322D",
  ivory: "#FBF7EB", // bg
  cream: "#FFFFFF", // surface
  cream2: "#F5F1E1",
  warm: "#C97B5C", // accent
  warmDark: "#B15D3D", // danger / warm-500
  warm50: "#FAEDE4",
  sage400: "#9CAF88", // brand mark
  sage500: "#82986D", // muted
  sage200: "#CDD9B8", // border
  sage700: "#4F5D40", // success
  sage50: "#EEF2E6",
  white: "#FFFFFF",
};
// Verdict colors
const PASS = C.sage700;
const WARN = C.warm;
const FAIL = C.warmDark;

const SANS = "Helvetica, Arial, sans-serif";
const SERIF = "Georgia, 'Times New Roman', serif";

type TextOpts = {
  size: number;
  weight?: number;
  fill?: string;
  letterSpacing?: number;
  italic?: boolean;
  anchor?: "start" | "middle" | "end";
  serif?: boolean;
};

function escapeXml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function svg(width: number, height: number, body: string): string {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">${body}</svg>`;
}

function rect(x: number, y: number, w: number, h: number, fill: string, opts?: { rx?: number; stroke?: string; strokeW?: number }): string {
  const rx = opts?.rx ? `rx="${opts.rx}"` : "";
  const stroke = opts?.stroke ? `stroke="${opts.stroke}" stroke-width="${opts.strokeW ?? 1}"` : "";
  return `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${fill}" ${rx} ${stroke}/>`;
}

function line(x1: number, y1: number, x2: number, y2: number, stroke: string, width = 1): string {
  return `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${stroke}" stroke-width="${width}"/>`;
}

function circle(cx: number, cy: number, r: number, fill: string): string {
  return `<circle cx="${cx}" cy="${cy}" r="${r}" fill="${fill}"/>`;
}

function text(x: number, y: number, t: string, opts: TextOpts): string {
  const w = opts.weight ?? 400;
  const f = opts.fill ?? C.ink;
  const ls = opts.letterSpacing ? `letter-spacing="${opts.letterSpacing}"` : "";
  const style = opts.italic ? `font-style="italic"` : "";
  const anchor = opts.anchor ?? "start";
  const family = opts.serif ? SERIF : SANS;
  return `<text x="${x}" y="${y}" font-family="${family}" font-size="${opts.size}" font-weight="${w}" fill="${f}" ${ls} ${style} text-anchor="${anchor}">${escapeXml(t)}</text>`;
}

async function writePng(filename: string, svgString: string, dir = OUT_DIR) {
  const out = path.join(dir, filename);
  fs.mkdirSync(dir, { recursive: true });
  await sharp(Buffer.from(svgString)).png().toFile(out);
  console.log(`wrote ${out}`);
}

// A status verdict pill: colored disc + white glyph (✓ / ! / ✕).
function verdictIcon(cx: number, cy: number, status: "pass" | "warn" | "fail"): string {
  const color = status === "pass" ? PASS : status === "warn" ? WARN : FAIL;
  const glyph = status === "pass" ? "✓" : status === "warn" ? "!" : "✕";
  return (
    circle(cx, cy, 13, color) +
    text(cx, cy + 5, glyph, { size: 15, weight: 800, fill: C.white, anchor: "middle" })
  );
}

// --- Cover (1280×720) -------------------------------------------------------

function buildCover(): string {
  const W = 1280;
  const H = 720;
  const pad = 96;
  const sidebarW = 320;
  const e: string[] = [];

  e.push(rect(0, 0, W, H, C.ink));
  e.push(rect(W - sidebarW, 0, sidebarW, H, C.sage400));

  // Sidebar
  const sx = W - sidebarW;
  e.push(text(sx + sidebarW / 2, 222, "$19", { size: 108, weight: 800, fill: C.ink, anchor: "middle", serif: true }));
  e.push(text(sx + sidebarW / 2, 260, "ONE-TIME · INSTANT ACCESS", { size: 12, weight: 700, fill: C.sage700, letterSpacing: 2, anchor: "middle" }));
  e.push(line(sx + 56, 296, sx + sidebarW - 56, 296, C.sage700, 1));
  const bullets = [
    "In-browser file checker",
    "Size · bleed · DPI · fonts · color",
    "2,500-template bonus pack",
    "Author + Studio versions",
    "7-day refund",
    "Lifetime access + updates",
  ];
  let by = 352;
  for (const b of bullets) {
    e.push(text(sx + 46, by, "→", { size: 16, weight: 800, fill: C.sage700 }));
    e.push(text(sx + 72, by, b, { size: 15, weight: 500, fill: C.ink }));
    by += 38;
  }

  // Main
  e.push(text(pad, 100, "FOR SELF-PUBLISHING AUTHORS", { size: 13, weight: 700, fill: C.sage400, letterSpacing: 4 }));
  e.push(text(pad, 196, "Will KDP", { size: 58, weight: 800, fill: C.white, serif: true }));
  e.push(text(pad, 262, "reject your", { size: 58, weight: 800, fill: C.white, serif: true }));
  e.push(text(pad, 352, "cover?", { size: 100, weight: 800, fill: C.warm, serif: true }));

  e.push(text(pad, 410, "Check the size, bleed, fonts, and color KDP", { size: 21, fill: C.sage200 }));
  e.push(text(pad, 440, "rejects covers over — before you upload.", { size: 21, fill: C.sage200 }));

  e.push(line(pad, 506, pad + 96, 506, C.sage400, 3));
  e.push(text(pad, 552, "Cover Pass-Check", { size: 34, weight: 800, fill: C.white, serif: true }));
  e.push(text(pad, 584, "Pass KDP's review on the first try.", { size: 18, italic: true, fill: C.sage200 }));

  e.push(text(pad, H - 48, "KDPCOVER.PRO · 2026 EDITION", { size: 13, weight: 600, fill: C.sage200, letterSpacing: 3 }));

  return svg(W, H, e.join(""));
}

// --- Thumbnail (600×600) ----------------------------------------------------

function buildThumbnail(): string {
  const W = 600;
  const H = 600;
  const e: string[] = [];
  e.push(rect(0, 0, W, H, C.ink));
  e.push(circle(W / 2, 190, 56, C.sage400));
  e.push(text(W / 2, 212, "✓", { size: 70, weight: 800, fill: C.ink, anchor: "middle" }));
  e.push(text(W / 2, 350, "PASS-CHECK", { size: 62, weight: 800, fill: C.white, anchor: "middle", serif: true, letterSpacing: 1 }));
  e.push(text(W / 2, 404, "your KDP cover before you upload", { size: 22, fill: C.sage200, anchor: "middle" }));
  e.push(line(W / 2 - 60, 446, W / 2 + 60, 446, C.warm, 3));
  e.push(text(W / 2, 520, "kdpcover.pro", { size: 20, weight: 600, fill: C.sage400, anchor: "middle", letterSpacing: 2 }));
  return svg(W, H, e.join(""));
}

// --- Preview 1: the Pass-Check report (the painkiller) ----------------------

function buildPreviewReport(): string {
  const W = 1280;
  const H = 800;
  const pad = 80;
  const e: string[] = [];
  e.push(rect(0, 0, W, H, C.ivory));

  e.push(text(pad, 84, "THE PASS-CHECK REPORT", { size: 13, weight: 700, fill: C.warm, letterSpacing: 4 }));
  e.push(text(pad, 144, "Your cover, checked against", { size: 44, weight: 800, fill: C.ink, serif: true }));
  e.push(text(pad, 196, "KDP's exact spec.", { size: 44, weight: 800, fill: C.ink, serif: true }));
  e.push(text(pad, 240, "Upload your finished file. Every requirement verified — problems flagged with the fix.", { size: 17, italic: true, fill: C.sage500 }));

  // Report card
  const cx = pad;
  const cy = 286;
  const cw = W - pad * 2;
  e.push(rect(cx, cy, cw, 432, C.white, { rx: 14, stroke: C.sage200, strokeW: 2 }));
  // banner
  e.push(rect(cx, cy, cw, 60, C.warm50, { rx: 14 }));
  e.push(rect(cx, cy + 30, cw, 30, C.warm50)); // square off bottom of banner
  e.push(verdictIcon(cx + 34, cy + 30, "fail"));
  e.push(text(cx + 58, cy + 36, "KDP will likely reject this", { size: 22, weight: 800, fill: C.warmDark, serif: true }));

  const rows: Array<["pass" | "warn" | "fail", string, string]> = [
    ["fail", "Full-cover size", "Found 12.68 × 9.00 in; KDP needs 12.93 × 9.25 in for a 300-page 6×9 paperback"],
    ["fail", "Bleed present", "File is trim-sized — the 0.125\" bleed is missing on every edge"],
    ["fail", "Fonts embedded", "1 font not embedded: Helvetica"],
    ["warn", "Color space", "RGB. KDP prefers CMYK; colors may shift on press"],
    ["pass", "Single-page PDF", "One flattened page (back + spine + front)"],
    ["pass", "File size", "8.9 MB — within KDP's recommended ≤ 40 MB"],
  ];
  let ry = cy + 96;
  for (const [status, label, detail] of rows) {
    e.push(verdictIcon(cx + 34, ry, status));
    e.push(text(cx + 60, ry - 3, label, { size: 17, weight: 700, fill: C.ink }));
    e.push(text(cx + 60, ry + 19, detail, { size: 14, fill: C.sage500 }));
    ry += 54;
  }

  // punchline band
  const py = cy + 432 + 24;
  e.push(rect(cx, py, cw, 50, C.sage400, { rx: 10 }));
  e.push(text(cx + 26, py + 32, "4 problems found — and exactly how to fix each.", { size: 19, weight: 800, fill: C.ink }));
  e.push(text(cx + cw - 26, py + 32, "Caught in your browser, before KDP sees it.", { size: 16, weight: 700, fill: C.ink, anchor: "end" }));

  return svg(W, H, e.join(""));
}

// --- Preview 2: what's inside -----------------------------------------------

function buildPreviewIncluded(): string {
  const W = 1280;
  const H = 800;
  const pad = 80;
  const e: string[] = [];
  e.push(rect(0, 0, W, H, C.ink));

  e.push(text(pad, 92, "WHAT YOU GET", { size: 13, weight: 700, fill: C.sage400, letterSpacing: 4 }));
  e.push(text(pad, 152, "One purchase. Everything you need", { size: 46, weight: 800, fill: C.white, serif: true }));
  e.push(text(pad, 204, "to pass KDP review.", { size: 46, weight: 800, fill: C.white, serif: true }));

  const cards: Array<[string, string, string]> = [
    ["IN-BROWSER\nFILE CHECKER", "All", "KDP cover rules"],
    ["AUTO-VERIFIED\nCHECKS", "7", "size · bleed · DPI · fonts · color · pages · file-size"],
    ["BONUS\nTEMPLATE PACK", "2,500+", "ready-to-design SVG + PDF"],
  ];
  const cardW = 348;
  const gap = 36;
  const startX = pad;
  const cardY = 290;
  cards.forEach(([title, big, sub], i) => {
    const x = startX + i * (cardW + gap);
    e.push(rect(x, cardY, cardW, 320, C.ink2, { rx: 14, stroke: C.sage700, strokeW: 1 }));
    const titleLines = title.split("\n");
    titleLines.forEach((tl, j) => {
      e.push(text(x + 32, cardY + 56 + j * 26, tl, { size: 15, weight: 700, fill: C.sage400, letterSpacing: 2 }));
    });
    e.push(text(x + 32, cardY + 196, big, { size: 76, weight: 800, fill: C.white, serif: true }));
    const subLines = wrapText(sub, 26);
    subLines.forEach((sl, j) => {
      e.push(text(x + 32, cardY + 244 + j * 24, sl, { size: 16, fill: C.sage200 }));
    });
  });

  e.push(text(pad, 690, "Checked entirely in your browser — your cover file is never uploaded.", { size: 18, italic: true, fill: C.sage400 }));

  return svg(W, H, e.join(""));
}

function wrapText(s: string, maxChars: number): string[] {
  const words = s.split(/\s+/);
  const lines: string[] = [];
  let current = "";
  for (const word of words) {
    const tentative = current ? `${current} ${word}` : word;
    if (tentative.length > maxChars && current) {
      lines.push(current);
      current = word;
    } else {
      current = tentative;
    }
  }
  if (current) lines.push(current);
  return lines;
}

// --- Preview 3: the #1 rejection, worked ------------------------------------

function buildPreviewWorked(): string {
  const W = 1280;
  const H = 800;
  const pad = 80;
  const e: string[] = [];
  e.push(rect(0, 0, W, H, C.ivory));

  e.push(text(pad, 92, "THE #1 REASON KDP REJECTS COVERS", { size: 13, weight: 700, fill: C.warm, letterSpacing: 3 }));
  e.push(text(pad, 152, "Wrong full-cover size.", { size: 46, weight: 800, fill: C.ink, serif: true }));
  e.push(text(pad, 198, "Your design tool gives you the trim. KDP wants the trim + bleed + spine.", { size: 18, italic: true, fill: C.sage500 }));

  // Two panels: what you exported vs what KDP needs
  const panelW = 520;
  const py = 260;
  const ph = 300;
  // left — exported (wrong)
  e.push(rect(pad, py, panelW, ph, C.white, { rx: 14, stroke: C.sage200, strokeW: 2 }));
  e.push(text(pad + 32, py + 50, "WHAT YOU EXPORTED", { size: 13, weight: 700, fill: C.warmDark, letterSpacing: 2 }));
  e.push(text(pad + 32, py + 130, "12.68 × 9.00 in", { size: 48, weight: 800, fill: C.ink, serif: true }));
  e.push(text(pad + 32, py + 168, "trim only — no bleed", { size: 17, fill: C.sage500 }));
  e.push(verdictIcon(pad + 46, py + 232, "fail"));
  e.push(text(pad + 72, py + 237, "Rejected: 0.125\" bleed missing", { size: 16, weight: 600, fill: C.warmDark }));

  // right — needed (right)
  const rx = pad + panelW + 40;
  e.push(rect(rx, py, panelW, ph, C.white, { rx: 14, stroke: C.sage400, strokeW: 2 }));
  e.push(text(rx + 32, py + 50, "WHAT KDP NEEDS", { size: 13, weight: 700, fill: C.sage700, letterSpacing: 2 }));
  e.push(text(rx + 32, py + 130, "12.93 × 9.25 in", { size: 48, weight: 800, fill: C.ink, serif: true }));
  e.push(text(rx + 32, py + 168, "300-page 6×9 white paperback", { size: 17, fill: C.sage500 }));
  e.push(verdictIcon(rx + 46, py + 232, "pass"));
  e.push(text(rx + 72, py + 237, "Passes: spine + bleed included", { size: 16, weight: 600, fill: C.sage700 }));

  // punchline
  e.push(rect(pad, 620, W - pad * 2, 56, C.sage400, { rx: 10 }));
  e.push(text(W / 2, 655, "A 0.25-inch gap is a multi-day rejection. Pass-Check catches it in 2 seconds.", { size: 20, weight: 800, fill: C.ink, anchor: "middle" }));

  return svg(W, H, e.join(""));
}

// --- Preview 4: Author vs Studio --------------------------------------------

function buildPreviewTiers(): string {
  const W = 1280;
  const H = 800;
  const pad = 80;
  const e: string[] = [];
  e.push(rect(0, 0, W, H, C.ink));

  e.push(text(pad, 92, "TWO VERSIONS", { size: 13, weight: 700, fill: C.sage400, letterSpacing: 4 }));
  e.push(text(pad, 152, "One product. Pick at checkout.", { size: 46, weight: 800, fill: C.white, serif: true }));

  const tiers: Array<[string, string, string, string[]]> = [
    ["AUTHOR", "$19", "For your book launch.", ["Check one cover at a time", "Every check, with the fix", "2,500-template bonus pack", "Lifetime access + updates"]],
    ["STUDIO", "$49", "For volume publishers.", ["Everything in Author", "Batch mode — a whole folder at once", "Worst-first table + CSV export", "Built to ship at scale"]],
  ];
  const cardW = 520;
  const gap = 40;
  const cardY = 240;
  tiers.forEach(([name, price, blurb, feats], i) => {
    const x = pad + i * (cardW + gap);
    const accent = i === 1 ? C.warm : C.sage400;
    e.push(rect(x, cardY, cardW, 400, C.ink2, { rx: 16, stroke: accent, strokeW: i === 1 ? 2 : 1 }));
    e.push(text(x + 36, cardY + 60, name, { size: 16, weight: 700, fill: accent, letterSpacing: 3 }));
    e.push(text(x + cardW - 36, cardY + 76, price, { size: 60, weight: 800, fill: C.white, anchor: "end", serif: true }));
    e.push(text(x + 36, cardY + 104, blurb, { size: 17, italic: true, fill: C.sage200 }));
    let fy = cardY + 160;
    for (const f of feats) {
      e.push(text(x + 36, fy, "✓", { size: 16, weight: 800, fill: accent }));
      e.push(text(x + 62, fy, f, { size: 17, fill: C.white }));
      fy += 44;
    }
  });

  e.push(text(W / 2, 700, "Same in-browser checker. Studio just unlocks batch mode for many covers.", { size: 18, italic: true, fill: C.sage400, anchor: "middle" }));

  return svg(W, H, e.join(""));
}

// --- Preview 5: how it works + privacy --------------------------------------

function buildPreviewHow(): string {
  const W = 1280;
  const H = 800;
  const pad = 80;
  const e: string[] = [];
  e.push(rect(0, 0, W, H, C.ivory));

  e.push(text(pad, 92, "HOW IT WORKS", { size: 13, weight: 700, fill: C.warm, letterSpacing: 4 }));
  e.push(text(pad, 152, "Three steps. No login. No upload.", { size: 46, weight: 800, fill: C.ink, serif: true }));

  const steps: Array<[string, string, string]> = [
    ["1", "Set your book", "Format, trim, paper, page count — the same inputs as the free calculator."],
    ["2", "Drop your cover", "PDF, PNG, or JPG. It's read in your browser and never leaves your device."],
    ["3", "Get the verdict", "A pass/fail report with the exact fix for anything KDP would reject."],
  ];
  const cardW = 348;
  const gap = 36;
  const cardY = 250;
  steps.forEach(([n, title, body], i) => {
    const x = pad + i * (cardW + gap);
    e.push(rect(x, cardY, cardW, 300, C.white, { rx: 14, stroke: C.sage200, strokeW: 2 }));
    e.push(circle(x + 60, cardY + 70, 28, C.sage400));
    e.push(text(x + 60, cardY + 80, n, { size: 30, weight: 800, fill: C.ink, anchor: "middle", serif: true }));
    e.push(text(x + 32, cardY + 150, title, { size: 24, weight: 800, fill: C.ink, serif: true }));
    const lines = wrapText(body, 34);
    lines.forEach((l, j) => {
      e.push(text(x + 32, cardY + 188 + j * 24, l, { size: 16, fill: C.sage500 }));
    });
  });

  e.push(rect(pad, 620, W - pad * 2, 56, C.ink, { rx: 10 }));
  e.push(text(W / 2, 655, "Your cover file never touches a server. Privacy-first, like the free calculator.", { size: 19, weight: 700, fill: C.sage400, anchor: "middle" }));

  return svg(W, H, e.join(""));
}

async function main() {
  await writePng("cover.png", buildCover());
  await writePng("thumbnail.png", buildThumbnail());
  // Gumroad shows previews in upload order — lead with the report (the
  // painkiller), then the worked rejection, what's inside, tiers, how-it-works.
  await writePng("preview-1.png", buildPreviewReport());
  await writePng("preview-2.png", buildPreviewWorked());
  await writePng("preview-3.png", buildPreviewIncluded());
  await writePng("preview-4.png", buildPreviewTiers());
  await writePng("preview-5.png", buildPreviewHow());
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
