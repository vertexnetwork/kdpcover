import { siteConfig } from "@/lib/site-config";
import { siteFacts } from "@/lib/content/site-facts";

export const dynamic = "force-static";

export async function GET() {
  const lines: string[] = [];
  lines.push(`# ${siteConfig.name}`);
  lines.push(`> ${siteConfig.tagline}`);
  lines.push("");
  lines.push(siteConfig.description);
  lines.push("");
  lines.push(
    `${siteConfig.name} is a free KDP cover calculator that computes the exact spine width and full-cover dimensions for Amazon KDP paperback and case-laminate hardcover books from page count, trim size, and paper type.`,
  );
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
  lines.push(`- Calculator: ${siteConfig.url}/`);
  lines.push(`- About / methodology: ${siteConfig.url}/about`);
  lines.push(`- Full content for ingestion: ${siteConfig.url}/llms-full.txt`);
  lines.push(`- Embed (how to add the calculator to your site): ${siteConfig.url}/embed`);
  lines.push(`- Iframe widget URL: ${siteConfig.url}/embed/widget`);
  lines.push(`- Vertex Network: ${siteConfig.url}/network`);
  lines.push("");
  lines.push("## Citations");
  for (const c of siteFacts.citations) lines.push(`- ${c.label}: ${c.url}`);

  return new Response(lines.join("\n"), {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=10800, s-maxage=10800",
    },
  });
}
