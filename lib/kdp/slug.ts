import type { Format, Paper } from "./calc";
import { PAPERBACK_TRIMS, HARDCOVER_TRIMS, isPageCountValid } from "./limits";

export type ParsedSlug = {
  format: Format;
  paper: Paper;
  pageCount: number;
  trimWidthIn: number;
  trimHeightIn: number;
};

const PAPER_SLUG: Record<string, Paper> = {
  white: "white",
  cream: "cream",
  "standard-color": "color-standard",
  "premium-color": "color-premium",
};

const PAPER_SLUG_REVERSE: Record<Paper, string> = {
  white: "white",
  cream: "cream",
  "color-standard": "standard-color",
  "color-premium": "premium-color",
};

const FORMAT_SLUG: Record<string, Format> = {
  paperback: "paperback",
  hardcover: "hardcover",
};

const SLUG_RE =
  /^(paperback|hardcover)-(white|cream|standard-color|premium-color)-(\d+)-pages(?:-([0-9.]+)x([0-9.]+))?$/;

export function parseSlug(slug: string): ParsedSlug | null {
  const m = SLUG_RE.exec(slug);
  if (!m) return null;
  const format = FORMAT_SLUG[m[1]];
  const paper = PAPER_SLUG[m[2]];
  const pageCount = Number(m[3]);
  if (!format || !paper) return null;
  if (!isPageCountValid(format, pageCount)) return null;

  let trimW: number;
  let trimH: number;
  if (m[4] && m[5]) {
    trimW = Number(m[4]);
    trimH = Number(m[5]);
    if (!Number.isFinite(trimW) || !Number.isFinite(trimH)) return null;
    if (trimW <= 0 || trimH <= 0 || trimW > 12 || trimH > 14) return null;
  } else {
    const def = format === "paperback"
      ? { widthIn: 6, heightIn: 9 }
      : { widthIn: 6, heightIn: 9 };
    trimW = def.widthIn;
    trimH = def.heightIn;
  }
  return { format, paper, pageCount, trimWidthIn: trimW, trimHeightIn: trimH };
}

export function buildSlug(input: ParsedSlug): string {
  const base = `${input.format}-${PAPER_SLUG_REVERSE[input.paper]}-${input.pageCount}-pages`;
  const isDefaultTrim = input.trimWidthIn === 6 && input.trimHeightIn === 9;
  return isDefaultTrim
    ? base
    : `${base}-${stripZero(input.trimWidthIn)}x${stripZero(input.trimHeightIn)}`;
}

function stripZero(n: number): string {
  return Number.isInteger(n) ? String(n) : String(n);
}

/** Curated page-count buckets for pSEO route generation. */
export function pSeoPageBuckets(format: Format): number[] {
  const buckets: number[] = [];
  if (format === "paperback") {
    buckets.push(24, 32);
    for (let p = 40; p <= 100; p += 4) buckets.push(p);
    for (let p = 110; p <= 400; p += 10) buckets.push(p);
    for (let p = 425; p <= 800; p += 25) buckets.push(p);
    buckets.push(828);
  } else {
    buckets.push(75, 100);
    for (let p = 110; p <= 400; p += 10) buckets.push(p);
    for (let p = 425; p <= 525; p += 25) buckets.push(p);
    buckets.push(550);
  }
  return Array.from(new Set(buckets)).sort((a, b) => a - b);
}

/** Returns ~3,200 curated pSEO slugs for generateStaticParams. */
export function curatedPseoSlugs(): string[] {
  const slugs: string[] = [];
  const trims = {
    paperback: PAPERBACK_TRIMS.filter((t) =>
      ["5x8", "5.5x8.5", "6x9", "7x10", "8.5x11"].includes(t.slug),
    ),
    hardcover: HARDCOVER_TRIMS.filter((t) =>
      ["5.5x8.5", "6x9", "7x10", "8.25x11", "8.5x11"].includes(t.slug),
    ),
  };
  const papers: Paper[] = ["white", "cream", "color-standard", "color-premium"];

  for (const format of ["paperback", "hardcover"] as const) {
    const buckets = pSeoPageBuckets(format);
    for (const trim of trims[format]) {
      for (const paper of papers) {
        for (const pages of buckets) {
          slugs.push(
            buildSlug({
              format,
              paper,
              pageCount: pages,
              trimWidthIn: trim.widthIn,
              trimHeightIn: trim.heightIn,
            }),
          );
        }
      }
    }
  }
  return Array.from(new Set(slugs));
}
