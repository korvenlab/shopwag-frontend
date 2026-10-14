import { NextResponse, type NextRequest } from "next/server";
import { siteUrl, subdomainSlug } from "@/lib/site";
import { updateSession } from "@/lib/supabase/proxy";

/** {slug}.wagoobot.com/produto/x vira /s/{slug}/produto/x por dentro. */
function storeSubdomain(request: NextRequest) {
  const slug = subdomainSlug(request.headers.get("host") ?? "");
  if (!slug) return null;
  const path = request.nextUrl.pathname;
  if (path.startsWith("/dashboard") || path === "/login" || path === "/cadastro") {
    return NextResponse.redirect(new URL(path, siteUrl()));
  }
  if (path === `/s/${slug}` || path.startsWith(`/s/${slug}/`)) return NextResponse.next();
  if (path.startsWith("/s/")) return new NextResponse("Não encontrado", { status: 404 });
  const url = request.nextUrl.clone();
  url.pathname = path === "/" ? `/s/${slug}` : `/s/${slug}${path}`;
  return NextResponse.rewrite(url);
}

export async function proxy(request: NextRequest) {
  return storeSubdomain(request) ?? updateSession(request);
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
