import type { Metadata, Viewport } from "next";
import { Bricolage_Grotesque, Geist, Instrument_Serif, Playfair_Display } from "next/font/google";
import { PLATFORM_FEE_PERCENT } from "@/lib/mercadopago/platform-fee";
import { siteUrl } from "@/lib/site";
import "./globals.css";

const sans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const serif = Instrument_Serif({
  variable: "--font-serif",
  weight: "400",
  subsets: ["latin"],
});

const classic = Playfair_Display({
  variable: "--font-classic",
  subsets: ["latin"],
  preload: false,
});

const bold = Bricolage_Grotesque({
  variable: "--font-bold",
  subsets: ["latin"],
  preload: false,
});

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl()),
  title: {
    default: "Shopwag — Sua loja online, com link próprio",
    template: "%s · Shopwag",
  },
  description: `Crie o link da sua loja. O cliente compra no site com Pix ou cartão. Gratuito — só ${PLATFORM_FEE_PERCENT}% nas vendas.`,
  applicationName: "Shopwag",
  keywords: ["loja online", "vitrine", "Pix", "Mercado Pago", "catálogo", "Shopwag"],
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#050505",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="pt-BR" className={`${sans.variable} ${serif.variable} ${classic.variable} ${bold.variable} h-full antialiased`}>
      <body className="min-h-dvh">{children}</body>
    </html>
  );
}
