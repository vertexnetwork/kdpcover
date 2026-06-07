import { siteConfig } from "@/lib/site-config";

export const dynamic = "force-static";

/**
 * OpenAPI 3.1 description of the agent-callable calculator (GET /api/calc).
 * Referenced by /.well-known/ai-plugin.json.
 */
export async function GET() {
  const spec = {
    openapi: "3.1.0",
    info: {
      title: `${siteConfig.name} API`,
      version: "1.0.0",
      description:
        "Compute Amazon KDP paperback and case-laminate hardcover cover dimensions (spine width, full cover, safe zones, barcode placement).",
      contact: { email: siteConfig.supportEmail, url: `${siteConfig.url}/contact` },
    },
    servers: [{ url: siteConfig.url }],
    paths: {
      "/api/calc": {
        get: {
          operationId: "calcKdpCover",
          summary: "Calculate KDP spine width and full-cover dimensions",
          parameters: [
            {
              name: "format",
              in: "query",
              required: true,
              schema: { type: "string", enum: ["paperback", "hardcover"] },
            },
            {
              name: "paper",
              in: "query",
              required: true,
              schema: {
                type: "string",
                enum: ["white", "cream", "color-standard", "color-premium"],
              },
            },
            {
              name: "pageCount",
              in: "query",
              required: true,
              schema: { type: "integer", minimum: 1, maximum: 2000 },
            },
            {
              name: "trimWidthIn",
              in: "query",
              required: true,
              schema: { type: "number", minimum: 1, maximum: 20 },
            },
            {
              name: "trimHeightIn",
              in: "query",
              required: true,
              schema: { type: "number", minimum: 1, maximum: 20 },
            },
          ],
          responses: {
            "200": {
              description: "Computed cover geometry",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      ok: { type: "boolean" },
                      result: {
                        type: "object",
                        properties: {
                          spineWidthIn: { type: "number" },
                          spineWidthMm: { type: "number" },
                          fullCoverWidthIn: { type: "number" },
                          fullCoverHeightIn: { type: "number" },
                          fullCoverWidthMm: { type: "number" },
                          fullCoverHeightMm: { type: "number" },
                          spineTextEligible: { type: "boolean" },
                          warnings: { type: "array", items: { type: "string" } },
                        },
                      },
                    },
                  },
                },
              },
            },
            "400": { description: "Invalid input" },
          },
        },
      },
    },
  };

  return new Response(JSON.stringify(spec, null, 2), {
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Cache-Control": "public, max-age=86400, s-maxage=86400",
    },
  });
}
