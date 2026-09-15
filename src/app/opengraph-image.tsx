import { ImageResponse } from "next/og";

export const alt = "Explore AI with us. OpenAI Student Collective at the University of Alberta.";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function Image() {
  return new ImageResponse(
    <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", justifyContent: "center", padding: "76px", color: "#faf9ff", background: "radial-gradient(ellipse at 90% 20%, #245d83 0%, transparent 65%), radial-gradient(ellipse at 0% 90%, #603496 0%, #111425 70%)" }}>
      <div style={{ display: "flex", fontSize: 26, color: "#d9d0f5", marginBottom: 48 }}>OpenAI Student Collective</div>
      <div style={{ display: "flex", fontSize: 96, letterSpacing: -5, lineHeight: 1.05 }}>Explore AI with us.</div>
      <div style={{ display: "flex", fontSize: 30, marginTop: 40, color: "#d5e3f2" }}>University of Alberta</div>
      <div style={{ position: "absolute", width: 440, height: 440, right: -170, top: -150, border: "2px solid #c6b4ff66", borderRadius: "50%", display: "flex" }} />
    </div>, size,
  );
}
