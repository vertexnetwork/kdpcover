import { siteFacts } from "@/lib/content/site-facts";

export const dynamic = "force-static";

export async function GET() {
  const out: string[] = [];
  out.push(`${siteFacts.site.name} — ${siteFacts.site.tagline}`);
  out.push("");
  out.push(siteFacts.site.description);
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
      "Cache-Control": "public, max-age=3600",
    },
  });
}
