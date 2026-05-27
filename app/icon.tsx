import { ImageResponse } from "next/og";

export const size = { width: 192, height: 192 };
export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: 192,
          height: 192,
          background: "linear-gradient(135deg, #059669 0%, #10b981 100%)",
          borderRadius: 40,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexDirection: "column",
          gap: 4,
        }}
      >
        {/* Dumbbell shape via CSS boxes */}
        <div style={{ display: "flex", alignItems: "center", gap: 0 }}>
          {/* Left weight */}
          <div
            style={{
              width: 28,
              height: 64,
              background: "white",
              borderRadius: 8,
              opacity: 0.95,
            }}
          />
          {/* Left collar */}
          <div
            style={{
              width: 12,
              height: 44,
              background: "rgba(255,255,255,0.7)",
              borderRadius: 4,
            }}
          />
          {/* Bar */}
          <div
            style={{
              width: 52,
              height: 20,
              background: "rgba(255,255,255,0.9)",
              borderRadius: 4,
            }}
          />
          {/* Right collar */}
          <div
            style={{
              width: 12,
              height: 44,
              background: "rgba(255,255,255,0.7)",
              borderRadius: 4,
            }}
          />
          {/* Right weight */}
          <div
            style={{
              width: 28,
              height: 64,
              background: "white",
              borderRadius: 8,
              opacity: 0.95,
            }}
          />
        </div>
      </div>
    ),
    { ...size }
  );
}
