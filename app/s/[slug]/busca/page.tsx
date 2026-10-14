import { Suspense } from "react";
import { notFound } from "next/navigation";
import { CatalogSkeleton } from "@/components/store/catalog-skeleton";
import { SearchView } from "@/components/store/search-view";
import { SchemaMissing } from "@/components/schema-missing";
import { getStoreBySlug, listPublicProducts } from "@/features/catalog/queries";
import { isSoldOut } from "@/features/catalog/stock";
import { SCHEMA_MISSING, catchSchema } from "@/lib/schema-error";

export default function SearchPage({ params }: PageProps<"/s/[slug]/busca">) {
  return (
    <Suspense fallback={<CatalogSkeleton />}>
      <Search params={params} />
    </Suspense>
  );
}

async function Search({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const data = await catchSchema(async () => {
    const store = await getStoreBySlug(slug);
    if (!store) return null;
    const all = await listPublicProducts(store.id);
    const products = store.esconder_esgotados ? all.filter((product) => !isSoldOut(product)) : all;
    return { store, products };
  });
  if (data === SCHEMA_MISSING) return <SchemaMissing />;
  if (!data) notFound();
  return <SearchView slug={slug} products={data.products} />;
}
