import { ImageResponse } from "next/og";
import { siteConfig } from "../../src/site-config";

const imageSize = {
  width: 1200,
  height: 630
};

export function GET() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: "linear-gradient(135deg, #ffffff 0%, #eef7fb 54%, #e8eef7 100%)",
          color: "#172033",
          padding: "72px"
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "18px" }}>
          <div
            style={{
              width: "72px",
              height: "72px",
              borderRadius: "18px",
              background: "#172033",
              color: "#ffffff",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "32px",
              fontWeight: 900
            }}
          >
            BV
          </div>
          <div style={{ fontSize: "34px", fontWeight: 800 }}>{siteConfig.name}</div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          <div style={{ fontSize: "76px", fontWeight: 900, letterSpacing: 0 }}>Find BV IDs fast</div>
          <div style={{ color: "#53627a", fontSize: "34px", lineHeight: 1.35 }}>
            Search your Bilibili videos and copy BV codes from Creator Center.
          </div>
        </div>

        <div style={{ display: "flex", gap: "14px", color: "#0086bd", fontSize: "28px", fontWeight: 800 }}>
          <span>Bookmarklet</span>
          <span>Creator Tool</span>
          <span>Open Source</span>
        </div>
      </div>
    ),
    imageSize
  );
}
