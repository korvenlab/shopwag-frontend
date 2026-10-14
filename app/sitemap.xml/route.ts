import { connection } from "next/server";
import { sitemapXml } from "@/features/catalog/feeds";
import { createPublicClient } from "@/lib/supabase/public";
import { siteUrl } from "@/lib/site";

export async function GET() {
  await connection();
  const base = siteUrl();
  const { data } = await createPublicClient()
    .from("lojas")
    .select("slug, produtos (slug, ativo)")
    .eq("seo_indexar", true)
    .is("dominio", null)
    .limit(1000);
  const stores = (data ?? []) as Array<{ slug: string; produtos: Array<{ slug: string; ativo: boolean }> }>;
  const entries = [
    { url: base, priority: 0.6 },
    ...stores.flatMap((store) => [
      { url: `${base}/s/${store.slug}`, priority: 1 },
      ...store.produtos
        .filter((product) => product.ativo)
        .map((product) => ({ url: `${base}/s/${store.slug}/produto/${product.slug}`, priority: 0.8 })),
    ]),
  ];
  return new Response(sitemapXml(entries), {
    headers: {
      "content-type": "application/xml; charset=utf-8",
      "cache-control": "public, s-maxage=3600, stale-while-revalidate=86400",
    },
  });
}
