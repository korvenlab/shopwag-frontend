import { ImageResponse } from "next/og";
import { PLATFORM_FEE_PERCENT } from "@/lib/mercadopago/platform-fee";

export const alt = "Shopwag — Sua loja online, com link próprio";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: "#050505",
          color: "#f4f1ea",
          padding: "64px 72px",
          fontFamily: "Georgia, 'Times New Roman', serif",
        }}
      >
        <div
          style={{
            display: "flex",
            width: "100%",
            height: 2,
            background: "#f4f1ea",
            boxShadow: "0 0 24px rgba(244,241,234,0.85)",
          }}
        />

        <div style={{ display: "flex", flexDirection: "column", gap: 28, marginTop: 48 }}>
          <div
            style={{
              display: "flex",
              fontSize: 28,
              letterSpacing: "0.28em",
              textTransform: "uppercase",
              color: "#9c9c94",
              fontFamily: "ui-sans-serif, system-ui, sans-serif",
            }}
          >
            Shopwag
          </div>
          <div
            style={{
              display: "flex",
              maxWidth: 900,
              fontSize: 76,
              lineHeight: 0.95,
              letterSpacing: "-0.03em",
            }}
          >
            Sua loja online, com link próprio.
          </div>
          <div
            style={{
              display: "flex",
              maxWidth: 720,
              fontSize: 30,
              lineHeight: 1.35,
              color: "#9c9c94",
              fontFamily: "ui-sans-serif, system-ui, sans-serif",
            }}
          >
            O cliente compra no site com Pix ou cartão. Gratuito — só {PLATFORM_FEE_PERCENT}% nas vendas.
          </div>
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            width: "100%",
            marginTop: 40,
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              border: "1px solid rgba(244,241,234,0.2)",
              borderRadius: 999,
              padding: "14px 28px",
              fontSize: 26,
              fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace",
              color: "rgba(244,241,234,0.88)",
            }}
          >
            sualoja.wagoobot.com
          </div>
          <div
            style={{
              display: "flex",
              fontSize: 22,
              color: "#9c9c94",
              fontFamily: "ui-sans-serif, system-ui, sans-serif",
            }}
          >
            shop.wagoobot.com
          </div>
        </div>
      </div>
    ),
    { ...size },
  );
}
