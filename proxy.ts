import { NextResponse, type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/proxy";

const PLATFORM_HOST = /(^localhost$)|(^127\.0\.0\.1$)|(\.vercel\.app$)|(^shopwag\.com\.br$)/;
const DOMAIN_TTL_MS = 5 * 60 * 1000;
const domainCache = new Map<string, { slug: string | null; at: number }>();

async function slugForDomain(host: string) {
  const hit = domainCache.get(host);
  if (hit && Date.now() - hit.at < DOMAIN_TTL_MS) return hit.slug;
  const url = new URL("/rest/v1/lojas", process.env.NEXT_PUBLIC_SUPABASE_URL);
  url.searchParams.set("select", "slug");
  url.searchParams.set("dominio", `eq.${host}`);
  url.searchParams.set("limit", "1");
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!;
  const response = await fetch(url, { headers: { apikey: key, authorization: `Bearer ${key}` } }).catch(() => null);
  const rows = response?.ok ? ((await response.json()) as Array<{ slug: string }>) : [];
  const slug = rows[0]?.slug ?? null;
  domainCache.set(host, { slug, at: Date.now() });
  return slug;
}

/** Domínio próprio: www.loja.com.br/produto/x vira /s/{slug}/produto/x por dentro. */
async function customDomain(request: NextRequest) {
  const host = (request.headers.get("host") ?? "").split(":")[0].toLowerCase();
  if (!host || PLATFORM_HOST.test(host)) return null;
  const slug = await slugForDomain(host);
  if (!slug) return null;
  const path = request.nextUrl.pathname;
  if (path.startsWith("/s/")) return null;
  if (path.startsWith("/dashboard") || path === "/login" || path === "/cadastro") {
    return NextResponse.redirect(new URL(path, "https://shopwag-frontend.vercel.app"));
  }
  const url = request.nextUrl.clone();
  url.pathname = path === "/" ? `/s/${slug}` : `/s/${slug}${path}`;
  return NextResponse.rewrite(url);
}

export async function proxy(request: NextRequest) {
  return (await customDomain(request)) ?? updateSession(request);
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
