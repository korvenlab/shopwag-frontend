import { Suspense } from "react";
import { notFound } from "next/navigation";
import { CatalogView } from "@/components/store/catalog-view";
import { SchemaMissing } from "@/components/schema-missing";
import { getStoreBySlug, listPublicProducts } from "@/features/catalog/queries";
import { SCHEMA_MISSING, catchSchema } from "@/lib/schema-error";

export default function StorePage({ params }: PageProps<"/s/[slug]">) {
  return (
    <Suspense fallback={<p className="px-5 py-8 text-sm text-mute">Abrindo vitrine…</p>}>
      <Catalog params={params} />
    </Suspense>
  );
}

async function Catalog({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const data = await catchSchema(async () => {
    const store = await getStoreBySlug(slug);
    if (!store) return null;
    const products = await listPublicProducts(store.id);
    return { store, products };
  });
  if (data === SCHEMA_MISSING) return <SchemaMissing />;
  if (!data) notFound();
  return <CatalogView store={data.store} products={data.products} />;
}
