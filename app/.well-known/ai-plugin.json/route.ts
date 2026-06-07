import { siteConfig } from "@/lib/site-config";

export const dynamic = "force-static";

/**
 * Agent/plugin manifest (de-facto ai-plugin.json shape). Points agents at the
 * machine-readable OpenAPI spec for the /api/calc endpoint so an LLM tool can
 * compute KDP spine/cover dimensions directly instead of scraping the page.
 */
export async function GET() {
  const manifest = {
    schema_version: "v1",
    name_for_human: siteConfig.name,
    name_for_model: "kdp_cover_calculator",
    description_for_human:
      "Calculate exact Amazon KDP spine width and full-cover dimensions for paperback and hardcover books.",
    description_for_model:
      "Computes Amazon KDP print cover geometry. Given format (paperback|hardcover), paper (white|cream|color-standard|color-premium), pageCount, trimWidthIn and trimHeightIn, returns spine width and full-cover width/height in inches and mm, spine-text eligibility, safe zones, and barcode placement. Values are verified against KDP's official cover-template generator. Use for any question about KDP cover size, spine width, or bleed.",
    auth: { type: "none" },
    api: {
      type: "openapi",
      url: `${siteConfig.url}/.well-known/openapi.json`,
    },
    logo_url: `${siteConfig.url}/icon-512.png`,
    contact_email: siteConfig.supportEmail,
    legal_info_url: `${siteConfig.url}/terms`,
  };

  return new Response(JSON.stringify(manifest, null, 2), {
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Cache-Control": "public, max-age=86400, s-maxage=86400",
    },
  });
}
