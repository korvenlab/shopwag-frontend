import type { Metadata } from "next";
import { LandingPage } from "@/components/marketing/landing-page";
import { PLATFORM_FEE_PERCENT } from "@/lib/mercadopago/platform-fee";

export const metadata: Metadata = {
  title: "Shopwag — A vitrine que vende no WhatsApp",
  description: `Crie um link próprio para a loja, monte o catálogo e receba Pix ou cartão. Gratuito para usar — só ${PLATFORM_FEE_PERCENT}% nas vendas. A taxa do Mercado Pago pode ir para o cliente.`,
};

export default function Home() {
  return <LandingPage />;
}
