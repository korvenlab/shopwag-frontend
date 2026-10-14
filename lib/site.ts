import type { Loja } from "@/features/domain/types";

export const MAIN_HOST = "shopwag-frontend.vercel.app";

/** Domínio das vitrines: cada loja abre em {slug}.STORE_DOMAIN. Vazio = só /s/{slug}. */
export const STORE_DOMAIN = (process.env.NEXT_PUBLIC_STORE_DOMAIN ?? "").trim().toLowerCase();

export const RESERVED_SUBDOMAINS = new Set([
  "www",
  "app",
  "api",
  "admin",
  "painel",
  "dashboard",
  "mail",
  "email",
  "smtp",
  "ftp",
  "blog",
  "ajuda",
  "suporte",
  "status",
  "cdn",
  "static",
  "wagoo",
  "shopwag",
]);

export function siteUrl() {
  const fromEnv = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (fromEnv) return fromEnv.replace(/\/$/, "");
  const production = process.env.VERCEL_PROJECT_PRODUCTION_URL;
  if (production) return `https://${production}`;
  return process.env.NODE_ENV === "production" ? `https://${MAIN_HOST}` : "http://localhost:3000";
}

/** Slug da loja quando o acesso vem por {slug}.STORE_DOMAIN. */
export function subdomainSlug(host: string) {
  if (!STORE_DOMAIN) return null;
  const clean = host.split(":")[0].toLowerCase();
  if (!clean.endsWith(`.${STORE_DOMAIN}`)) return null;
  const sub = clean.slice(0, -(STORE_DOMAIN.length + 1));
  if (!sub || sub.includes(".") || RESERVED_SUBDOMAINS.has(sub)) return null;
  return sub;
}

export function storeHost(slug: string) {
  return STORE_DOMAIN && !RESERVED_SUBDOMAINS.has(slug) ? `${slug}.${STORE_DOMAIN}` : null;
}

/** Endereço público da vitrine. */
export function storeUrl(store: Pick<Loja, "slug">, path = "") {
  const host = storeHost(store.slug);
  if (host) return `https://${host}${path}`;
  return `${siteUrl()}/s/${store.slug}${path}`;
}
