import { Suspense } from "react";
import { redirect } from "next/navigation";
import { ProductForm } from "@/components/dashboard/product-form";
import { getOwnStore } from "@/features/merchant/queries";
import { SCHEMA_MISSING, catchSchema } from "@/lib/schema-error";

export default function NewProductPage() {
  return (
    <Suspense fallback={<p className="px-5 py-8 text-sm text-mute">Abrindo formulário…</p>}>
      <NewProduct />
    </Suspense>
  );
}

async function NewProduct() {
  const store = await catchSchema(() => getOwnStore());
  if (store === SCHEMA_MISSING) return null;
  if (!store) redirect("/dashboard/loja");
  return <ProductForm lojaId={store.id} />;
}
