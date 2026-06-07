/**
 * Rasterises app/icon.svg into the multi-size favicon set expected by spec §6:
 *   public/favicon-16.png
 *   public/favicon-32.png
 *   public/icon-192.png
 *   public/icon-512.png
 *   public/apple-touch-icon-180.png
 *   public/favicon.ico   (multi-res 16/32/48, PNG-encoded entries)
 *
 * Uses `sharp` (added as a devDependency). The .ico is assembled in-process by
 * wrapping sharp's PNG buffers in an ICONDIR container — PNG-in-ICO is valid
 * for every browser shipped since IE11/Vista, so no external tool is needed.
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

/** ICO sizes embedded in favicon.ico (PNG-encoded entries). */
const ICO_SIZES = [16, 32, 48];

/**
 * Build a .ico from PNG buffers. Layout: 6-byte ICONDIR + 16-byte ICONDIRENTRY
 * per image + the raw PNG payloads. A dimension of 256 is encoded as 0 per spec
 * (not relevant here, max is 48). PNG-in-ICO is supported everywhere modern.
 */
function buildIco(images: { size: number; png: Buffer }[]): Buffer {
  const header = Buffer.alloc(6);
  header.writeUInt16LE(0, 0); // reserved
  header.writeUInt16LE(1, 2); // type: 1 = icon
  header.writeUInt16LE(images.length, 4);

  const entries: Buffer[] = [];
  let offset = 6 + images.length * 16;
  for (const { size, png } of images) {
    const entry = Buffer.alloc(16);
    entry.writeUInt8(size >= 256 ? 0 : size, 0); // width
    entry.writeUInt8(size >= 256 ? 0 : size, 1); // height
    entry.writeUInt8(0, 2); // palette count
    entry.writeUInt8(0, 3); // reserved
    entry.writeUInt16LE(1, 4); // color planes
    entry.writeUInt16LE(32, 6); // bits per pixel
    entry.writeUInt32LE(png.length, 8); // bytes in resource
    entry.writeUInt32LE(offset, 12); // offset of PNG data
    entries.push(entry);
    offset += png.length;
  }

  return Buffer.concat([header, ...entries, ...images.map((i) => i.png)]);
}

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

  const icoImages = await Promise.all(
    ICO_SIZES.map(async (size) => ({
      size,
      png: await sharp(svg, { density: 384 }).resize(size, size).png({ compressionLevel: 9 }).toBuffer(),
    })),
  );
  fs.writeFileSync(path.join(OUT_DIR, "favicon.ico"), buildIco(icoImages));
  console.log(`[favicon] favicon.ico (${ICO_SIZES.join("/")})`);
}

void main();
