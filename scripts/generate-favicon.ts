/**
 * Rasterises app/icon.svg into the multi-size favicon set expected by spec §6:
 *   public/favicon-16.png
 *   public/favicon-32.png
 *   public/icon-192.png
 *   public/icon-512.png
 *   public/apple-touch-icon-180.png
 *
 * Uses `sharp` (added as a devDependency). `favicon.ico` should be checked in
 * separately — generate once via an external tool (e.g., realfavicongenerator)
 * since sharp does not emit .ico cleanly.
 *
 * Runs at `prebuild`. Skips silently if sharp is unavailable so CI for
 * unrelated changes does not break on missing optional dependency.
 */
import fs from "node:fs";
import path from "node:path";

const ROOT = process.cwd();
const SVG = path.join(ROOT, "app", "icon.svg");
const OUT_DIR = path.join(ROOT, "public");

const sizes: { name: string; size: number }[] = [
  { name: "favicon-16.png", size: 16 },
  { name: "favicon-32.png", size: 32 },
  { name: "icon-192.png", size: 192 },
  { name: "icon-512.png", size: 512 },
  { name: "apple-touch-icon-180.png", size: 180 },
];

async function main(): Promise<void> {
  if (!fs.existsSync(SVG)) {
    console.warn("[favicon] app/icon.svg not found — skipping");
    return;
  }
  let sharp: typeof import("sharp");
  try {
    sharp = (await import("sharp")).default as unknown as typeof import("sharp");
  } catch {
    console.warn("[favicon] `sharp` not installed — skipping (run `pnpm add -D sharp` to enable)");
    return;
  }
  const svg = fs.readFileSync(SVG);
  fs.mkdirSync(OUT_DIR, { recursive: true });
  for (const { name, size } of sizes) {
    const out = path.join(OUT_DIR, name);
    await sharp(svg, { density: 384 }).resize(size, size).png({ compressionLevel: 9 }).toFile(out);
    console.log(`[favicon] ${name} (${size}×${size})`);
  }
}

void main();
