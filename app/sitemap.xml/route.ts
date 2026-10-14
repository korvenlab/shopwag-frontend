import { connection } from "next/server";
import { sitemapXml } from "@/features/catalog/feeds";
import { createPublicClient } from "@/lib/supabase/public";
import { STORE_DOMAIN, siteUrl } from "@/lib/site";

/** Com subdomínio por loja, cada {slug}.wagoobot.com publica o próprio sitemap. */
export async function GET() {
  await connection();
  const base = siteUrl();
  const entries = [{ url: base, priority: 0.6 }];
  if (!STORE_DOMAIN) {
    const { data } = await createPublicClient()
      .from("lojas")
      .select("slug, produtos (slug, ativo)")
      .eq("seo_indexar", true)
      .limit(1000);
    const stores = (data ?? []) as Array<{ slug: string; produtos: Array<{ slug: string; ativo: boolean }> }>;
    for (const store of stores) {
      entries.push({ url: `${base}/s/${store.slug}`, priority: 1 });
      for (const product of store.produtos) {
        if (product.ativo) entries.push({ url: `${base}/s/${store.slug}/produto/${product.slug}`, priority: 0.8 });
      }
    }
  }
  return new Response(sitemapXml(entries), {
    headers: {
      "content-type": "application/xml; charset=utf-8",
      "cache-control": "public, s-maxage=3600, stale-while-revalidate=86400",
    },
  });
}
