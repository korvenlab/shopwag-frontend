import { loadCatalog, sitemapXml, storeSitemapEntries } from "@/features/catalog/feeds";

export async function GET(_request: Request, { params }: RouteContext<"/s/[slug]/sitemap.xml">) {
  const { slug } = await params;
  const catalog = await loadCatalog(slug);
  if (!catalog) return new Response("Loja não encontrada", { status: 404 });
  const entries = catalog.store.seo_indexar ? storeSitemapEntries(catalog.store, catalog.products) : [];
  return new Response(sitemapXml(entries), {
    headers: {
      "content-type": "application/xml; charset=utf-8",
      "cache-control": "public, s-maxage=3600, stale-while-revalidate=86400",
    },
  });
}
