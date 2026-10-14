import { Suspense } from "react";
import { notFound } from "next/navigation";
import { CatalogSkeleton } from "@/components/store/catalog-skeleton";
import { CatalogView } from "@/components/store/catalog-view";
import { SchemaMissing } from "@/components/schema-missing";
import { getStoreBySlug, listBestSellers, listPublicProducts } from "@/features/catalog/queries";
import { isSoldOut } from "@/features/catalog/stock";
import type { Produto } from "@/features/domain/types";
import { SCHEMA_MISSING, catchSchema } from "@/lib/schema-error";

export default function StorePage({ params }: PageProps<"/s/[slug]">) {
  return (
    <Suspense fallback={<CatalogSkeleton />}>
      <Catalog params={params} />
    </Suspense>
  );
}

async function Catalog({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const data = await catchSchema(async () => {
    const store = await getStoreBySlug(slug);
    if (!store) return null;
    const [all, bestIds] = await Promise.all([listPublicProducts(store.id), listBestSellers(store.id)]);
    const products = store.esconder_esgotados ? all.filter((product) => !isSoldOut(product)) : all;
    const byId = new Map(products.map((product) => [product.id, product]));
    const bestSellers = bestIds.map((id) => byId.get(id)).filter((product): product is Produto => Boolean(product));
    return { store, products, bestSellers };
  });
  if (data === SCHEMA_MISSING) return <SchemaMissing />;
  if (!data) notFound();
  return <CatalogView store={data.store} products={data.products} bestSellers={data.bestSellers} />;
}
