import { Suspense } from "react";
import Link from "next/link";
import { ProductList } from "@/components/dashboard/product-list";
import { getOwnStore, listOwnProducts } from "@/features/merchant/queries";
import { SCHEMA_MISSING, catchSchema } from "@/lib/schema-error";

export default function ProductsPage() {
  return (
    <Suspense fallback={<p className="px-5 py-8 text-sm text-mute">Carregando produtos…</p>}>
      <Products />
    </Suspense>
  );
}

async function Products() {
  const store = await catchSchema(() => getOwnStore());
  if (store === SCHEMA_MISSING) return null;
  if (!store) {
    return (
      <div className="px-5 pt-8">
        <h1 className="font-serif text-4xl">Primeiro, a loja</h1>
        <Link href="/dashboard/loja" className="mt-4 inline-block text-sm underline underline-offset-4">
          Cadastrar loja
        </Link>
      </div>
    );
  }
  const products = await listOwnProducts(store.id);
  return <ProductList lojaId={store.id} products={products} />;
}
