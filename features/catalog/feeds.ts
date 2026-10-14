import { getStoreBySlug, listPublicProducts } from "@/features/catalog/queries";
import { isSoldOut } from "@/features/catalog/stock";
import type { Loja, Produto } from "@/features/domain/types";
import { storeUrl } from "@/lib/site";

export function xmlEscape(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function price(cents: number) {
  return `${(cents / 100).toFixed(2)} BRL`;
}

export async function loadCatalog(slug: string) {
  const store = await getStoreBySlug(slug).catch(() => null);
  if (!store) return null;
  const products = await listPublicProducts(store.id).catch(() => [] as Produto[]);
  return { store, products };
}

function feedItem(store: Loja, product: Produto) {
  const [cover, ...extra] = product.produto_imagens;
  const onSale = product.preco_de_centavos != null && product.preco_de_centavos > product.preco_centavos;
  const tag = (name: string, value: string) => `<${name}>${xmlEscape(value)}</${name}>`;
  return [
    "<item>",
    tag("g:id", product.id),
    tag("g:title", product.nome.slice(0, 150)),
    tag("g:description", (product.descricao || product.nome).slice(0, 5000)),
    tag("g:link", storeUrl(store, `/produto/${product.slug}`)),
    cover ? tag("g:image_link", cover.url) : "",
    ...extra.slice(0, 10).map((image) => tag("g:additional_image_link", image.url)),
    tag("g:availability", isSoldOut(product) ? "out of stock" : "in stock"),
    tag("g:condition", "new"),
    tag("g:price", price(onSale ? product.preco_de_centavos! : product.preco_centavos)),
    onSale ? tag("g:sale_price", price(product.preco_centavos)) : "",
    tag("g:brand", store.nome),
    tag("g:product_type", product.categoria || "Geral"),
    tag("g:identifier_exists", "no"),
    "</item>",
  ]
    .filter(Boolean)
    .join("");
}

/** RSS 2.0 com o namespace do Google, aceito pela Meta (Instagram/Facebook) e pelo Merchant Center. */
export function productFeed(store: Loja, products: Produto[]) {
  const items = products.filter((product) => product.produto_imagens.length > 0).map((product) => feedItem(store, product));
  return [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<rss version="2.0" xmlns:g="http://base.google.com/ns/1.0">',
    "<channel>",
    `<title>${xmlEscape(store.nome)}</title>`,
    `<link>${xmlEscape(storeUrl(store))}</link>`,
    `<description>${xmlEscape(store.descricao || store.nome)}</description>`,
    ...items,
    "</channel>",
    "</rss>",
  ].join("\n");
}

export function storeSitemapEntries(store: Loja, products: Produto[]) {
  return [
    { url: storeUrl(store), priority: 1 },
    ...products.map((product) => ({ url: storeUrl(store, `/produto/${product.slug}`), priority: 0.8 })),
  ];
}

export function sitemapXml(entries: Array<{ url: string; priority: number }>) {
  return [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    ...entries.map((entry) => `<url><loc>${xmlEscape(entry.url)}</loc><priority>${entry.priority}</priority></url>`),
    "</urlset>",
  ].join("\n");
}
