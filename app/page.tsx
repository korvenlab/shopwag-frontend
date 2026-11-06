import type { Metadata } from "next";
import { LandingPage } from "@/components/marketing/landing-page";
import { siteUrl } from "@/lib/site";

const title = "Shopwag — Sua loja online, com link próprio";
const description =
  "Crie o link da sua loja. O cliente compra no site com Pix ou cartão. Gratuito para usar — sem mensalidade.";

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
