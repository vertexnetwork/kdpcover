import * as mupdf from "mupdf";
import type { ColorSpaceKind, FileAnalysis, PdfFont } from "./types";

// mupdf-wasm PDF analysis. Browser-only — imported via dynamic import() from a
// client component so the WASM never loads on the server. Everything past the
// page-size read is best-effort and individually guarded: a quirk in one PDF's
// resource tree degrades fonts/color to "unknown" rather than failing the whole
// check. The size read (the load-bearing signal) stays robust.

const PT_PER_IN = 72;

function nameOf(obj: mupdf.PDFObject): string {
  try {
    return obj.isName() ? obj.asName() : "";
  } catch {
    return "";
  }
}

// Map a PDF /ColorSpace object to our coarse kind. Handles Device*, CalRGB/Gray,
// and ICCBased (via component count N). Indexed/Separation/DeviceN are left
// unknown rather than guessed.
function colorSpaceKind(cs: mupdf.PDFObject): ColorSpaceKind | "" {
  try {
    if (cs.isName()) {
      const n = cs.asName();
      if (n === "DeviceRGB" || n === "CalRGB") return "rgb";
      if (n === "DeviceCMYK") return "cmyk";
      if (n === "DeviceGray" || n === "CalGray") return "gray";
      return "";
    }
    if (cs.isArray() && cs.length > 0) {
      const head = nameOf(cs.get(0));
      if (head === "ICCBased") {
        const stream = cs.get(1).resolve();
        const N = stream.get("N");
        const n = N.isNull() ? 0 : N.asNumber();
        if (n === 4) return "cmyk";
        if (n === 3) return "rgb";
        if (n === 1) return "gray";
      }
      if (head === "CalRGB") return "rgb";
      if (head === "CalGray") return "gray";
    }
  } catch {
    /* fall through */
  }
  return "";
}

function collectFonts(resources: mupdf.PDFObject): PdfFont[] | undefined {
  try {
    const fontDict = resources.get("Font");
    if (!fontDict.isDictionary()) return [];
    const fonts: PdfFont[] = [];
    fontDict.forEach((ref) => {
      try {
        const font = ref.resolve();
        let target = font;
        if (nameOf(font.get("Subtype")) === "Type0") {
          const desc = font.get("DescendantFonts");
          if (desc.isArray() && desc.length > 0) target = desc.get(0).resolve();
        }
        const fd = target.get("FontDescriptor");
        let embedded = false;
        if (fd.isDictionary()) {
          embedded =
            !fd.get("FontFile").isNull() ||
            !fd.get("FontFile2").isNull() ||
            !fd.get("FontFile3").isNull();
        }
        const base = font.get("BaseFont");
        fonts.push({ name: nameOf(base) || "(font)", embedded });
      } catch {
        /* skip this font entry */
      }
    });
    return fonts;
  } catch {
    return undefined;
  }
}

function inspectImages(resources: mupdf.PDFObject): {
  hasRasterImages: boolean;
  colorSpace?: ColorSpaceKind;
  hasTransparency: boolean;
} {
  let hasRasterImages = false;
  let hasTransparency = false;
  let sawCmyk = false;
  let sawRgb = false;
  let sawGray = false;
  try {
    const xobj = resources.get("XObject");
    if (xobj.isDictionary()) {
      xobj.forEach((ref) => {
        try {
          const x = ref.resolve();
          if (nameOf(x.get("Subtype")) !== "Image") return;
          hasRasterImages = true;
          const kind = colorSpaceKind(x.get("ColorSpace").resolve());
          if (kind === "cmyk") sawCmyk = true;
          else if (kind === "rgb") sawRgb = true;
          else if (kind === "gray") sawGray = true;
          if (!x.get("SMask").isNull()) hasTransparency = true;
        } catch {
          /* skip this xobject */
        }
      });
    }
  } catch {
    /* no XObject dict */
  }
  const colorSpace: ColorSpaceKind | undefined = sawCmyk
    ? "cmyk"
    : sawRgb
      ? "rgb"
      : sawGray
        ? "gray"
        : undefined;
  return { hasRasterImages, colorSpace, hasTransparency };
}

export async function analyzePdf(data: ArrayBuffer, byteSize: number): Promise<FileAnalysis> {
  try {
    const doc = mupdf.Document.openDocument(data, "application/pdf");
    const pageCount = doc.countPages();
    const result: FileAnalysis = { kind: "pdf", byteSize, pageCount };

    if (pageCount < 1) return result;

    const page = doc.loadPage(0);
    // Page size from the bounds, in inches.
    try {
      const b = page.getBounds() as unknown as number[];
      if (b && b.length === 4) {
        result.widthIn = (b[2] - b[0]) / PT_PER_IN;
        result.heightIn = (b[3] - b[1]) / PT_PER_IN;
      }
    } catch {
      /* size unknown — evaluator will warn */
    }

    // PDF object inspection: resources → fonts, images, color, transparency.
    const pdfPage = page as mupdf.PDFPage;
    if (typeof pdfPage.getObject === "function") {
      try {
        const pageObj = pdfPage.getObject();
        const resources = pageObj.getInheritable("Resources");
        if (resources.isDictionary()) {
          result.fonts = collectFonts(resources);
          const img = inspectImages(resources);
          result.hasRasterImages = img.hasRasterImages;
          if (img.colorSpace) result.colorSpace = img.colorSpace;
          if (img.hasTransparency) result.hasTransparency = true;
        }
        // Page-level transparency group.
        const group = pageObj.get("Group");
        if (group.isDictionary() && nameOf(group.get("S")) === "Transparency") {
          result.hasTransparency = true;
        }
      } catch {
        /* resource walk failed — keep the size-only result */
      }
    }

    return result;
  } catch (e) {
    return {
      kind: "pdf",
      byteSize,
      error: e instanceof Error ? e.message : "Could not parse PDF",
    };
  }
}
