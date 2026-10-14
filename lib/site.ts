import type { Loja } from "@/features/domain/types";

export const MAIN_HOST = "shopwag-frontend.vercel.app";

export function siteUrl() {
  const fromEnv = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (fromEnv) return fromEnv.replace(/\/$/, "");
  const production = process.env.VERCEL_PROJECT_PRODUCTION_URL;
  if (production) return `https://${production}`;
  return process.env.NODE_ENV === "production" ? `https://${MAIN_HOST}` : "http://localhost:3000";
}

/** Endereço público da vitrine: o domínio próprio quando existir. */
export function storeUrl(store: Pick<Loja, "slug" | "dominio">, path = "") {
  if (store.dominio) return `https://${store.dominio}${path}`;
  return `${siteUrl()}/s/${store.slug}${path}`;
}
