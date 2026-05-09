import { ImageResponse } from "next/og";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

// Mirrors app/icon.svg at 180×180 for iOS home-screen install. iOS rounds
// the corners itself, so we ship the square mark untreated.
export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          background: "#1F2421",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <div style={{ display: "flex", height: 90 }}>
          <div style={{ width: 56, height: 90, background: "#9CAF88" }} />
          <div style={{ width: 12, height: 90, background: "#C97B5C" }} />
          <div style={{ width: 56, height: 90, background: "#9CAF88" }} />
        </div>
      </div>
    ),
    { ...size },
  );
}
