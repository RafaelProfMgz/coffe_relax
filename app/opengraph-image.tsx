import { ImageResponse } from "next/og";
import { SITE } from "@/lib/site";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = `${SITE.name} — ${SITE.tagline}`;

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: "0 90px",
          // Satori só entende gradientes simples — nada de radial elíptico aqui
          backgroundImage: "linear-gradient(135deg, #fbf4e6 0%, #f7f0e2 45%, #f0dcc6 100%)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 26, marginBottom: 16 }}>
          <div
            style={{
              width: 104,
              height: 104,
              borderRadius: 30,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              background: "linear-gradient(150deg, #c65a1e, #7a3b12)",
              fontSize: 58,
            }}
          >
            ☕
          </div>
          <div style={{ display: "flex", flexDirection: "column" }}>
            <div style={{ fontSize: 82, color: "#362f28", letterSpacing: -2, lineHeight: 1 }}>
              {SITE.name}
            </div>
            <div style={{ fontSize: 30, color: "#9b8d7a", marginTop: 10 }}>{SITE.url.replace("https://", "")}</div>
          </div>
        </div>

        {/* Satori exige um único filho aqui — texto montado numa string só */}
        <div style={{ display: "flex", fontSize: 40, color: "#6d6051", maxWidth: 940, lineHeight: 1.35 }}>
          {`${SITE.tagline} — sons relaxantes ao vivo, playlist do YouTube e pomodoro. Sem contas, sem rastreamento.`}
        </div>

        <div style={{ display: "flex", gap: 14, marginTop: 40 }}>
          {["🌧 chuva", "🔥 lareira", "☕ cafeteria", "📻 lo-fi", "⏱ pomodoro"].map((tag) => (
            <div
              key={tag}
              style={{
                fontSize: 26,
                color: "#c65a1e",
                padding: "12px 26px",
                borderRadius: 999,
                background: "#f0d4bd",
              }}
            >
              {tag}
            </div>
          ))}
        </div>
      </div>
    ),
    size
  );
}
