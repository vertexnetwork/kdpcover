import { ImageResponse } from "next/og";
import { siteConfig } from "@/lib/site-config";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          background: siteConfig.brand.markBgColor,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <div style={{ display: "flex", height: 90 }}>
          <div style={{ width: 56, height: 90, background: siteConfig.brand.markColor }} />
          <div style={{ width: 12, height: 90, background: siteConfig.brand.markAccentColor }} />
          <div style={{ width: 56, height: 90, background: siteConfig.brand.markColor }} />
        </div>
      </div>
    ),
    { ...size },
  );
}
