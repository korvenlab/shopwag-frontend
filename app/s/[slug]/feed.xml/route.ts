import { loadCatalog, productFeed } from "@/features/catalog/feeds";

export async function GET(_request: Request, { params }: RouteContext<"/s/[slug]/feed.xml">) {
  const { slug } = await params;
  const catalog = await loadCatalog(slug);
  if (!catalog) return new Response("Loja não encontrada", { status: 404 });
  return new Response(productFeed(catalog.store, catalog.products), {
    headers: {
      "content-type": "application/xml; charset=utf-8",
      "cache-control": "public, s-maxage=3600, stale-while-revalidate=86400",
    },
  });
}
