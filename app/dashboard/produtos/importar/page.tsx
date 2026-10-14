import { Suspense } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { CsvImport } from "@/components/dashboard/csv-import";
import { getOwnStore, listOwnProducts } from "@/features/merchant/queries";
import { SCHEMA_MISSING, catchSchema } from "@/lib/schema-error";

export default function ImportPage() {
  return (
    <Suspense fallback={<p className="px-5 py-8 text-sm text-mute">Carregando…</p>}>
      <Import />
    </Suspense>
  );
}

async function Import() {
  const store = await catchSchema(() => getOwnStore());
  if (store === SCHEMA_MISSING || !store) return null;
  const products = await listOwnProducts(store.id);
  return (
    <div className="px-5 pt-6">
      <Link href="/dashboard/produtos" className="inline-flex items-center gap-2 text-sm text-mute hover:text-paper">
        <ArrowLeft size={16} /> Produtos
      </Link>
      <h1 className="mt-4 font-serif text-4xl">Importar planilha</h1>
      <p className="mt-2 text-sm leading-6 text-mute">
        Cadastre vários produtos de uma vez. Repita o nome do produto em várias linhas para criar cores e tamanhos.
      </p>
      <CsvImport lojaId={store.id} existingSlugs={products.map((product) => product.slug)} />
    </div>
  );
}
