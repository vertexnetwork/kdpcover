import { siteConfig } from "@/lib/site-config";
import { siteFacts } from "@/lib/content/site-facts";
import { calcCover, type Format, type Paper } from "@kdp/calc";

export const dynamic = "force-static";

const EXAMPLES: { format: Format; paper: Paper; pageCount: number; trimWidthIn: number; trimHeightIn: number }[] = [
  { format: "paperback", paper: "white",          pageCount: 100, trimWidthIn: 6,    trimHeightIn: 9 },
  { format: "paperback", paper: "white",          pageCount: 200, trimWidthIn: 6,    trimHeightIn: 9 },
  { format: "paperback", paper: "white",          pageCount: 300, trimWidthIn: 6,    trimHeightIn: 9 },
  { format: "paperback", paper: "white",          pageCount: 400, trimWidthIn: 6,    trimHeightIn: 9 },
  { format: "paperback", paper: "cream",          pageCount: 200, trimWidthIn: 5.5,  trimHeightIn: 8.5 },
  { format: "paperback", paper: "cream",          pageCount: 300, trimWidthIn: 5.5,  trimHeightIn: 8.5 },
  { format: "paperback", paper: "cream",          pageCount: 400, trimWidthIn: 5.5,  trimHeightIn: 8.5 },
  { format: "paperback", paper: "color-standard", pageCount: 150, trimWidthIn: 6,    trimHeightIn: 9 },
  { format: "paperback", paper: "color-standard", pageCount: 250, trimWidthIn: 7,    trimHeightIn: 10 },
  { format: "paperback", paper: "color-premium",  pageCount: 100, trimWidthIn: 8.5,  trimHeightIn: 11 },
  { format: "paperback", paper: "color-premium",  pageCount: 220, trimWidthIn: 8.5,  trimHeightIn: 11 },
  { format: "paperback", paper: "color-premium",  pageCount: 350, trimWidthIn: 8.5,  trimHeightIn: 11 },
  { format: "paperback", paper: "white",          pageCount: 24,  trimWidthIn: 5,    trimHeightIn: 8 },
  { format: "paperback", paper: "white",          pageCount: 828, trimWidthIn: 8.5,  trimHeightIn: 11 },
  { format: "hardcover", paper: "white",          pageCount: 100, trimWidthIn: 6,    trimHeightIn: 9 },
  { format: "hardcover", paper: "white",          pageCount: 200, trimWidthIn: 6,    trimHeightIn: 9 },
  { format: "hardcover", paper: "white",          pageCount: 300, trimWidthIn: 6,    trimHeightIn: 9 },
  { format: "hardcover", paper: "cream",          pageCount: 200, trimWidthIn: 6,    trimHeightIn: 9 },
  { format: "hardcover", paper: "cream",          pageCount: 350, trimWidthIn: 6.14, trimHeightIn: 9.21 },
  { format: "hardcover", paper: "color-premium",  pageCount: 250, trimWidthIn: 8.5,  trimHeightIn: 11 },
  { format: "hardcover", paper: "color-premium",  pageCount: 550, trimWidthIn: 6,    trimHeightIn: 9 },
  { format: "hardcover", paper: "white",          pageCount: 75,  trimWidthIn: 5.5,  trimHeightIn: 8.5 },
  { format: "hardcover", paper: "white",          pageCount: 150, trimWidthIn: 7,    trimHeightIn: 10 },
  { format: "hardcover", paper: "white",          pageCount: 450, trimWidthIn: 6,    trimHeightIn: 9 },
];

const PAPER_LABEL: Record<Paper, string> = {
  white: "white",
  cream: "cream",
  "color-standard": "standard color",
  "color-premium": "premium color",
};

export async function GET() {
  const out: string[] = [];
  out.push(`${siteConfig.name} — ${siteConfig.tagline}`);
  out.push("");
  out.push(siteConfig.description);
  out.push("");
  out.push(
    `${siteConfig.name} is a free KDP cover calculator that computes the exact spine width and full-cover dimensions for Amazon KDP paperback and case-laminate hardcover books from page count, trim size, and paper type. It is verified against Amazon's official KDP cover-template generator and runs entirely in the browser with no login.`,
  );
  out.push("");

  out.push("## Spine multipliers (inches per page)");
  for (const m of siteFacts.multipliers) {
    out.push(`- ${m.format} · ${m.paper}: ${m.value} ${m.unit}`);
  }
  out.push("");

  out.push("## Formulas");
  out.push(`Spine width: ${siteFacts.formulas.spine}`);
  out.push(`Paperback full cover: ${siteFacts.formulas.paperbackFullCover}`);
  out.push(`Hardcover full cover: ${siteFacts.formulas.hardcoverFullCover}`);
  out.push("");

  out.push("## Page-count limits");
  out.push(`Paperback: ${siteFacts.pageLimits.paperback.min} to ${siteFacts.pageLimits.paperback.max} pages.`);
  out.push(`Hardcover: ${siteFacts.pageLimits.hardcover.min} to ${siteFacts.pageLimits.hardcover.max} pages.`);
  out.push(`Spine text minimum: ${siteFacts.pageLimits.spineTextMin} pages on either format.`);
  out.push("");

  out.push("## Safe zones and bleed");
  out.push(`- Bleed: ${siteFacts.safeZones.bleed}`);
  out.push(`- Paperback inside safe zone: ${siteFacts.safeZones.paperbackInside}`);
  out.push(`- Hardcover inside safe zone: ${siteFacts.safeZones.hardcoverInside}`);
  out.push(`- Hardcover hinge dead-zone: ${siteFacts.safeZones.hardcoverHinge}`);
  out.push(`- Barcode area: ${siteFacts.safeZones.barcode}`);
  out.push("");

  out.push("## File requirements");
  out.push(`DPI: ${siteFacts.resolution.dpi}`);
  out.push(`Color: ${siteFacts.resolution.color}`);
  out.push(`Format: ${siteFacts.resolution.file}`);
  out.push(`Recommended size: ${siteFacts.resolution.sizeRecommended}; hard limit: ${siteFacts.resolution.sizeMax}`);
  out.push("");

  out.push("## Worked examples (computed by the same engine the calculator uses)");
  for (const ex of EXAMPLES) {
    const r = calcCover(ex);
    const formatLabel = ex.format === "paperback" ? "paperback" : "case-laminate hardcover";
    out.push(
      `- A ${ex.pageCount}-page ${PAPER_LABEL[ex.paper]} ${formatLabel} at ${ex.trimWidthIn} × ${ex.trimHeightIn} in: spine ${r.spineWidthIn.toFixed(4)} in (${r.spineWidthMm.toFixed(2)} mm); full cover ${r.fullCoverWidthIn.toFixed(4)} × ${r.fullCoverHeightIn.toFixed(4)} in (${r.fullCoverWidthMm.toFixed(2)} × ${r.fullCoverHeightMm.toFixed(2)} mm); spine text ${r.spineTextEligible ? "eligible" : "not eligible"}.`,
    );
  }
  out.push("");

  out.push("## Frequently asked");
  for (const qa of siteFacts.faq) {
    out.push(`Q: ${qa.q}`);
    out.push(`A: ${qa.a}`);
    out.push("");
  }

  out.push("## Authoritative sources");
  for (const c of siteFacts.citations) out.push(`- ${c.label}: ${c.url}`);

  return new Response(out.join("\n"), {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=10800, s-maxage=10800",
    },
  });
}
