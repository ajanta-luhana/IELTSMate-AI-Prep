import { ImageResponse } from "next/og";

export const alt = "IELTSMate: your free AI IELTS coach";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

/** Link-preview card shown when the site is shared (LinkedIn, WhatsApp, Slack). Generated at build time. */
export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: 72,
          color: "white",
          background: "linear-gradient(135deg, #101728 0%, #1d2a63 55%, #2b3fc9 100%)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center" }}>
          <div
            style={{
              width: 56,
              height: 56,
              borderRadius: 14,
              background: "rgba(255,255,255,0.18)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 26,
              fontWeight: 700,
            }}
          >
            IM
          </div>
          <div style={{ marginLeft: 16, fontSize: 36, fontWeight: 700 }}>IELTSMate</div>
        </div>

        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ fontSize: 76, fontWeight: 700, lineHeight: 1.08 }}>IELTS doesn&apos;t have to be scary.</div>
          <div style={{ marginTop: 24, fontSize: 32, color: "rgba(255,255,255,0.78)" }}>
            Free AI coach for Speaking, Writing, Reading and Listening.
          </div>
        </div>

        <div style={{ display: "flex", fontSize: 24, color: "rgba(255,255,255,0.7)" }}>
          Estimated practice bands. Not official IELTS scores.
        </div>
      </div>
    ),
    { ...size },
  );
}
