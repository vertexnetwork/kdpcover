import { ImageResponse } from "next/og";
import { siteConfig } from "@/lib/site-config";
import { calcCover, type Format, type Paper } from "@kdp/calc";

export const runtime = "edge";

const VALID_FORMATS = new Set<Format>(["paperback", "hardcover"]);
const VALID_PAPERS = new Set<Paper>(["white", "cream", "color-standard", "color-premium"]);

export async function GET(req: Request) {
  const url = new URL(req.url);
  const f = url.searchParams.get("f");
  const p = url.searchParams.get("p");
  const pg = Number(url.searchParams.get("pg") ?? "200");
  const tw = Number(url.searchParams.get("tw") ?? "6");
  const th = Number(url.searchParams.get("th") ?? "9");

  if (!f || !VALID_FORMATS.has(f as Format)) return badRequest("bad format");
  if (!p || !VALID_PAPERS.has(p as Paper)) return badRequest("bad paper");
  if (!Number.isFinite(pg) || !Number.isFinite(tw) || !Number.isFinite(th)) return badRequest("bad numbers");

  const out = calcCover({
    format: f as Format,
    paper: p as Paper,
    pageCount: pg,
    trimWidthIn: tw,
    trimHeightIn: th,
  });

  const { colors } = siteConfig.theme;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          padding: 64,
          background: colors.bg,
          color: colors.onBg,
          fontFamily: "Inter, system-ui, sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ width: 16, height: 16, background: colors.accent, borderRadius: 2 }} />
          <div style={{ fontSize: 28, fontWeight: 600 }}>{siteConfig.name}</div>
        </div>
        <div style={{ marginTop: 64, fontSize: 24, color: colors.muted }}>
          {f === "paperback" ? "Paperback" : "Hardcover"} · {pg} pages · {tw}″ × {th}″
        </div>
        <div style={{ marginTop: 24, fontSize: 96, lineHeight: 1, fontWeight: 700 }}>
          Spine: {out.spineWidthIn.toFixed(4)} in
        </div>
        <div style={{ marginTop: 12, fontSize: 36, color: colors.success }}>
          {out.spineWidthMm.toFixed(2)} mm · Full cover {out.fullCoverWidthIn.toFixed(2)} × {out.fullCoverHeightIn.toFixed(2)} in
        </div>
        <div style={{ marginTop: "auto", fontSize: 22, color: colors.muted }}>
          {siteConfig.tagline}
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
      headers: {
        "Cache-Control": "public, immutable, max-age=31536000",
      },
    },
  );
}

function badRequest(msg: string) {
  return new Response(msg, { status: 400 });
}
