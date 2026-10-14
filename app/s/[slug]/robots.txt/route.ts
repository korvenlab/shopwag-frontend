import { getStoreBySlug } from "@/features/catalog/queries";
import { storeUrl } from "@/lib/site";

/** Usado no domínio próprio da loja (o proxy reescreve /robots.txt para cá). */
export async function GET(_request: Request, { params }: RouteContext<"/s/[slug]/robots.txt">) {
  const { slug } = await params;
  const store = await getStoreBySlug(slug).catch(() => null);
  const body =
    store && store.seo_indexar
      ? `User-agent: *\nAllow: /\nDisallow: /checkout\nDisallow: /pedido/\nDisallow: /sacola\n\nSitemap: ${storeUrl(store, "/sitemap.xml")}\n`
      : "User-agent: *\nDisallow: /\n";
  return new Response(body, { headers: { "content-type": "text/plain; charset=utf-8" } });
}
