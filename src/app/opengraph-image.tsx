import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "TUMAN VPN — Свободный интернет";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(135deg, #0A0A0A 0%, #111 50%, #0A0A0A 100%)",
          fontFamily: "sans-serif",
        }}
      >
        {/* Accent glow */}
        <div
          style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: 500,
            height: 500,
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(107,140,255,0.15) 0%, transparent 70%)",
          }}
        />

        <div
          style={{
            fontSize: 80,
            fontWeight: 900,
            background: "linear-gradient(135deg, #6B8CFF, #7C4DFF)",
            backgroundClip: "text",
            color: "transparent",
            lineHeight: 1.1,
          }}
        >
          TUMAN
        </div>
        <div
          style={{
            fontSize: 32,
            color: "#fff",
            fontWeight: 700,
            marginTop: 16,
          }}
        >
          Свободный интернет
        </div>
        <div
          style={{
            fontSize: 20,
            color: "#888",
            marginTop: 16,
          }}
        >
          YouTube, Instagram, Discord — без ограничений. 3 дня бесплатно.
        </div>
      </div>
    ),
    { ...size }
  );
}
