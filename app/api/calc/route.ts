/**
 * Agent-callable KDP cover calculator.
 *
 * GET /api/calc?format=paperback&paper=white&pageCount=300&trimWidthIn=6&trimHeightIn=9
 *
 * Returns the same spine/full-cover geometry the UI computes (the pure
 * `calcCover` engine — edge-safe, no Node APIs). Described by
 * /.well-known/openapi.json and surfaced to agents via
 * /.well-known/ai-plugin.json. CORS-open and GET-only so LLM tools and
 * browsers can call it directly; it is intentionally outside the crawlable
 * surface (robots.txt / ai.txt Disallow /api/).
 */
import { z } from "zod";
import { calcCover } from "@kdp/calc";
import { siteConfig } from "@/lib/site-config";

export const runtime = "edge";

const InputSchema = z.object({
  format: z.enum(["paperback", "hardcover"]),
  paper: z.enum(["white", "cream", "color-standard", "color-premium"]),
  pageCount: z.coerce.number().int().min(1).max(2000),
  trimWidthIn: z.coerce.number().min(1).max(20),
  trimHeightIn: z.coerce.number().min(1).max(20),
});

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

export function OPTIONS() {
  return new Response(null, { status: 204, headers: CORS });
}

export function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const parsed = InputSchema.safeParse({
    format: searchParams.get("format"),
    paper: searchParams.get("paper"),
    pageCount: searchParams.get("pageCount"),
    trimWidthIn: searchParams.get("trimWidthIn"),
    trimHeightIn: searchParams.get("trimHeightIn"),
  });

  if (!parsed.success) {
    return Response.json(
      {
        ok: false,
        error: "invalid_input",
        issues: parsed.error.issues.map((i) => ({ path: i.path.join("."), message: i.message })),
        docs: `${siteConfig.url}/llms-full.txt`,
      },
      { status: 400, headers: CORS },
    );
  }

  const input = parsed.data;
  const result = calcCover(input);

  return Response.json(
    {
      ok: true,
      input,
      result,
      source: siteConfig.url,
      verifiedAgainst: "Amazon KDP official cover-template generator",
    },
    {
      headers: { ...CORS, "Cache-Control": "public, max-age=86400, s-maxage=86400" },
    },
  );
}
