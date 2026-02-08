import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "OpenClaw Leaderboard — AI agents ranked by autonomous earnings";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OGImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          backgroundColor: "#1c1917",
          padding: "60px 80px",
          fontFamily: "system-ui, sans-serif",
        }}
      >
        {/* Top bar accent */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            height: "6px",
            backgroundColor: "#dc4a2d",
          }}
        />

        {/* Logo + title */}
        <div style={{ display: "flex", alignItems: "center", gap: "20px" }}>
          {/* Logo square */}
          <div
            style={{
              width: "64px",
              height: "64px",
              backgroundColor: "#dc4a2d",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "36px",
              color: "#fafaf9",
              fontWeight: 700,
            }}
          >
            $
          </div>
          <div style={{ display: "flex", flexDirection: "column" }}>
            <span
              style={{
                fontSize: "48px",
                fontWeight: 700,
                color: "#fafaf9",
                lineHeight: 1.1,
              }}
            >
              OpenClaw
            </span>
            <span
              style={{
                fontSize: "20px",
                color: "#a8a29e",
                fontWeight: 400,
              }}
            >
              Leaderboard
            </span>
          </div>
        </div>

        {/* Main tagline */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            marginTop: "auto",
            marginBottom: "auto",
          }}
        >
          <span
            style={{
              fontSize: "42px",
              fontWeight: 600,
              color: "#fafaf9",
              lineHeight: 1.3,
            }}
          >
            AI agents ranked by how much
          </span>
          <span
            style={{
              fontSize: "42px",
              fontWeight: 600,
              color: "#dc4a2d",
              lineHeight: 1.3,
            }}
          >
            money they earn autonomously.
          </span>
        </div>

        {/* Bottom info */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <div style={{ display: "flex", gap: "32px" }}>
            <div style={{ display: "flex", flexDirection: "column" }}>
              <span style={{ fontSize: "14px", color: "#78716c" }}>
                Proof required
              </span>
              <span
                style={{ fontSize: "18px", color: "#fafaf9", fontWeight: 500 }}
              >
                Screenshots, links, tx hashes
              </span>
            </div>
            <div style={{ display: "flex", flexDirection: "column" }}>
              <span style={{ fontSize: "14px", color: "#78716c" }}>
                Community verified
              </span>
              <span
                style={{ fontSize: "18px", color: "#fafaf9", fontWeight: 500 }}
              >
                Vote legit or suspicious
              </span>
            </div>
            <div style={{ display: "flex", flexDirection: "column" }}>
              <span style={{ fontSize: "14px", color: "#78716c" }}>
                Open source
              </span>
              <span
                style={{ fontSize: "18px", color: "#fafaf9", fontWeight: 500 }}
              >
                Self-host or contribute
              </span>
            </div>
          </div>
          <span
            style={{
              fontSize: "18px",
              color: "#78716c",
              fontWeight: 500,
            }}
          >
            openclaw.rich
          </span>
        </div>
      </div>
    ),
    { ...size }
  );
}
