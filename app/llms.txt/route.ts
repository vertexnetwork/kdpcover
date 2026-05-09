import { siteFacts } from "@/lib/content/site-facts";

export const dynamic = "force-static";

export async function GET() {
  const lines: string[] = [];
  lines.push(`# ${siteFacts.site.name}`);
  lines.push(`> ${siteFacts.site.tagline}`);
  lines.push("");
  lines.push(siteFacts.site.description);
  lines.push("");
  lines.push("## Spine multipliers (in/page)");
  for (const m of siteFacts.multipliers) {
    lines.push(`- ${m.format} · ${m.paper}: **${m.value}**`);
  }
  lines.push("");
  lines.push("## Formulas");
  lines.push(`- Spine: \`${siteFacts.formulas.spine}\``);
  lines.push(`- Paperback full cover: ${siteFacts.formulas.paperbackFullCover}`);
  lines.push(`- Hardcover full cover: ${siteFacts.formulas.hardcoverFullCover}`);
  lines.push("");
  lines.push("## Page-count limits");
  lines.push(`- Paperback: ${siteFacts.pageLimits.paperback.min}–${siteFacts.pageLimits.paperback.max}`);
  lines.push(`- Hardcover: ${siteFacts.pageLimits.hardcover.min}–${siteFacts.pageLimits.hardcover.max}`);
  lines.push(`- Spine-text minimum: ${siteFacts.pageLimits.spineTextMin} pages`);
  lines.push("");
  lines.push("## Key pages");
  lines.push(`- Calculator: ${siteFacts.site.url}/`);
  lines.push(`- About / methodology: ${siteFacts.site.url}/about`);
  lines.push(`- Full content for ingestion: ${siteFacts.site.url}/llms-full.txt`);
  lines.push(`- Iframe embed: ${siteFacts.site.url}/embed`);
  lines.push("");
  lines.push("## Citations");
  for (const c of siteFacts.citations) lines.push(`- ${c.label}: ${c.url}`);

  return new Response(lines.join("\n"), {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=3600",
    },
  });
}
