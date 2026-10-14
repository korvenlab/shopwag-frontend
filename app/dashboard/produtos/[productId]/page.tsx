import { Suspense } from "react";
import { notFound } from "next/navigation";
import { ProductForm } from "@/components/dashboard/product-form";
import { getOwnProduct, getOwnStore } from "@/features/merchant/queries";
import { SCHEMA_MISSING, catchSchema } from "@/lib/schema-error";

export default function EditProductPage({ params }: PageProps<"/dashboard/produtos/[productId]">) {
  return (
    <Suspense fallback={<p className="px-5 py-8 text-sm text-mute">Abrindo peça…</p>}>
      <Edit params={params} />
    </Suspense>
  );
}

async function Edit({ params }: { params: Promise<{ productId: string }> }) {
  const { productId } = await params;
  const store = await catchSchema(() => getOwnStore());
  if (store === SCHEMA_MISSING) return null;
  if (!store) notFound();
  const product = await getOwnProduct(store.id, productId);
  if (!product) notFound();
  return <ProductForm lojaId={store.id} product={product} />;
}
