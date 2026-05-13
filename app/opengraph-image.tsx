import { ImageResponse } from "next/og";
import { siteConfig } from "@/lib/site-config";

export const runtime = "edge";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          padding: 64,
          background: siteConfig.theme.colors.bg,
          color: siteConfig.theme.colors.onBg,
          fontFamily: "Inter, system-ui, sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div
            style={{
              width: 16,
              height: 16,
              background: siteConfig.theme.colors.accent,
              borderRadius: 2,
            }}
          />
          <div style={{ fontSize: 28, fontWeight: 600 }}>{siteConfig.name}</div>
        </div>
        <div style={{ marginTop: 96, fontSize: 84, fontWeight: 700, lineHeight: 1.05 }}>
          {siteConfig.tagline}
        </div>
        <div
          style={{
            marginTop: 24,
            fontSize: 28,
            color: siteConfig.theme.colors.muted,
            maxWidth: 900,
          }}
        >
          {siteConfig.description}
        </div>
        <div style={{ marginTop: "auto", fontSize: 22, color: siteConfig.theme.colors.success }}>
          {siteConfig.domain}
        </div>
      </div>
    ),
    { ...size },
  );
}
