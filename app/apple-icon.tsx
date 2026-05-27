import { ImageResponse } from "next/og";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: 180,
          height: 180,
          background: "linear-gradient(135deg, #059669 0%, #10b981 100%)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 0 }}>
          <div style={{ width: 26, height: 60, background: "white", borderRadius: 8 }} />
          <div style={{ width: 11, height: 42, background: "rgba(255,255,255,0.7)", borderRadius: 4 }} />
          <div style={{ width: 48, height: 18, background: "rgba(255,255,255,0.9)", borderRadius: 4 }} />
          <div style={{ width: 11, height: 42, background: "rgba(255,255,255,0.7)", borderRadius: 4 }} />
          <div style={{ width: 26, height: 60, background: "white", borderRadius: 8 }} />
        </div>
      </div>
    ),
    { ...size }
  );
}
