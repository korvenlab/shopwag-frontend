import type { Metadata } from "next";
import { LandingPage } from "@/components/marketing/landing-page";
import { PLATFORM_FEE_PERCENT } from "@/lib/mercadopago/platform-fee";
import { siteUrl } from "@/lib/site";

const title = "Shopwag — Sua loja online, com link próprio";
const description = `Crie o link da sua loja. O cliente compra no site com Pix ou cartão. Gratuito para usar — só ${PLATFORM_FEE_PERCENT}% nas vendas. A taxa do Mercado Pago pode ir para o cliente.`;

export const metadata: Metadata = {
  title: { absolute: title },
  description,
  alternates: { canonical: siteUrl() },
  openGraph: {
    type: "website",
    locale: "pt_BR",
    siteName: "Shopwag",
    title,
    description,
    url: siteUrl(),
  },
  twitter: {
    card: "summary_large_image",
    title,
    description,
  },
};

export default function Home() {
  return <LandingPage />;
}
