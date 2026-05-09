import type { Format, Paper } from "./calc";

export type TrimSize = {
  widthIn: number;
  heightIn: number;
  label: string; // e.g. "6\" × 9\""
  slug: string; // e.g. "6x9"
  formats: Format[];
};

export const PAPERBACK_TRIMS: TrimSize[] = [
  { widthIn: 5, heightIn: 8, label: '5" × 8"', slug: "5x8", formats: ["paperback"] },
  { widthIn: 5.06, heightIn: 7.81, label: '5.06" × 7.81"', slug: "5.06x7.81", formats: ["paperback"] },
  { widthIn: 5.25, heightIn: 8, label: '5.25" × 8"', slug: "5.25x8", formats: ["paperback"] },
  { widthIn: 5.5, heightIn: 8.5, label: '5.5" × 8.5"', slug: "5.5x8.5", formats: ["paperback"] },
  { widthIn: 6, heightIn: 9, label: '6" × 9"', slug: "6x9", formats: ["paperback", "hardcover"] },
  { widthIn: 6.14, heightIn: 9.21, label: '6.14" × 9.21"', slug: "6.14x9.21", formats: ["paperback"] },
  { widthIn: 6.69, heightIn: 9.61, label: '6.69" × 9.61"', slug: "6.69x9.61", formats: ["paperback"] },
  { widthIn: 7, heightIn: 10, label: '7" × 10"', slug: "7x10", formats: ["paperback"] },
  { widthIn: 7.44, heightIn: 9.69, label: '7.44" × 9.69"', slug: "7.44x9.69", formats: ["paperback"] },
  { widthIn: 7.5, heightIn: 9.25, label: '7.5" × 9.25"', slug: "7.5x9.25", formats: ["paperback"] },
  { widthIn: 8, heightIn: 10, label: '8" × 10"', slug: "8x10", formats: ["paperback"] },
  { widthIn: 8.25, heightIn: 6, label: '8.25" × 6"', slug: "8.25x6", formats: ["paperback"] },
  { widthIn: 8.25, heightIn: 8.25, label: '8.25" × 8.25"', slug: "8.25x8.25", formats: ["paperback"] },
  { widthIn: 8.5, heightIn: 8.5, label: '8.5" × 8.5"', slug: "8.5x8.5", formats: ["paperback"] },
  { widthIn: 8.5, heightIn: 11, label: '8.5" × 11"', slug: "8.5x11", formats: ["paperback"] },
];

export const HARDCOVER_TRIMS: TrimSize[] = [
  { widthIn: 5.5, heightIn: 8.5, label: '5.5" × 8.5"', slug: "5.5x8.5", formats: ["hardcover"] },
  { widthIn: 6, heightIn: 9, label: '6" × 9"', slug: "6x9", formats: ["paperback", "hardcover"] },
  { widthIn: 6.14, heightIn: 9.21, label: '6.14" × 9.21"', slug: "6.14x9.21", formats: ["hardcover"] },
  { widthIn: 7, heightIn: 10, label: '7" × 10"', slug: "7x10", formats: ["hardcover"] },
  { widthIn: 8.25, heightIn: 11, label: '8.25" × 11"', slug: "8.25x11", formats: ["hardcover"] },
  { widthIn: 8.5, heightIn: 11, label: '8.5" × 11"', slug: "8.5x11", formats: ["hardcover"] },
];

export const ALL_TRIMS = [
  ...PAPERBACK_TRIMS,
  ...HARDCOVER_TRIMS.filter((h) => !PAPERBACK_TRIMS.some((p) => p.slug === h.slug)),
];

export function trimsForFormat(format: Format): TrimSize[] {
  return format === "paperback" ? PAPERBACK_TRIMS : HARDCOVER_TRIMS;
}

export function pageCountBounds(format: Format): { min: number; max: number } {
  return format === "paperback" ? { min: 24, max: 828 } : { min: 75, max: 550 };
}

export const PAPER_LABEL: Record<Paper, string> = {
  white: "White",
  cream: "Cream",
  "color-standard": "Standard Color",
  "color-premium": "Premium Color",
};

export const FORMAT_LABEL: Record<Format, string> = {
  paperback: "Paperback",
  hardcover: "Hardcover",
};

export function paperOptionsForFormat(format: Format): Paper[] {
  if (format === "hardcover") return ["white", "cream", "color-standard", "color-premium"];
  return ["white", "cream", "color-standard", "color-premium"];
}

export function isPageCountValid(format: Format, pages: number): boolean {
  const { min, max } = pageCountBounds(format);
  return Number.isFinite(pages) && pages >= min && pages <= max;
}
