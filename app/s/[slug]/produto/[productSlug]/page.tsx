import { Suspense } from "react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ProductDetail } from "@/components/store/product-detail";
import { SchemaMissing } from "@/components/schema-missing";
import { getPublicProduct, getStoreBySlug } from "@/features/catalog/queries";
import { SCHEMA_MISSING, catchSchema } from "@/lib/schema-error";
import { storeUrl } from "@/lib/site";

export async function generateMetadata({ params }: PageProps<"/s/[slug]/produto/[productSlug]">): Promise<Metadata> {
  const { slug, productSlug } = await params;
  const store = await getStoreBySlug(slug).catch(() => null);
  if (!store) return {};
  const product = await getPublicProduct(store.id, productSlug).catch(() => null);
  if (!product) return {};
  const description = product.descricao?.trim().slice(0, 160) || `${product.nome} em ${store.nome}.`;
  const image = product.produto_imagens[0]?.url;
  return {
    title: product.nome,
    description,
    alternates: { canonical: storeUrl(store, `/produto/${product.slug}`) },
    openGraph: {
      title: product.nome,
      description,
      url: storeUrl(store, `/produto/${product.slug}`),
      images: image ? [{ url: image }] : undefined,
    },
  };
}

export default function ProductPage({ params }: PageProps<"/s/[slug]/produto/[productSlug]">) {
  return (
    <Suspense fallback={<p className="px-5 py-8 text-sm text-mute">Abrindo peça…</p>}>
      <Product params={params} />
    </Suspense>
  );
}

async function Product({
  params,
}: {
  params: Promise<{ slug: string; productSlug: string }>;
}) {
  const { slug, productSlug } = await params;
  const data = await catchSchema(async () => {
    const store = await getStoreBySlug(slug);
    if (!store) return null;
    const product = await getPublicProduct(store.id, productSlug);
    return { store, product };
  });
  if (data === SCHEMA_MISSING) return <SchemaMissing />;
  if (!data?.store || !data.product) notFound();
  return <ProductDetail slug={slug} product={data.product} />;
}
