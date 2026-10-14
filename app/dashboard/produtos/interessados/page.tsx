import { Suspense } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { InterestedList } from "@/components/dashboard/interested-list";
import { getOwnStore, listInterested } from "@/features/merchant/queries";
import { SCHEMA_MISSING, catchSchema } from "@/lib/schema-error";
import { storeUrl } from "@/lib/site";

export default function InterestedPage() {
  return (
    <Suspense fallback={<p className="px-5 py-8 text-sm text-mute">Carregando…</p>}>
      <Interested />
    </Suspense>
  );
}

async function Interested() {
  const store = await catchSchema(() => getOwnStore());
  if (store === SCHEMA_MISSING || !store) return null;
  const people = await listInterested(store.id);
  return (
    <div className="px-5 pt-6">
      <Link href="/dashboard/produtos" className="inline-flex items-center gap-2 text-sm text-mute hover:text-paper">
        <ArrowLeft size={16} /> Produtos
      </Link>
      <h1 className="mt-4 font-serif text-4xl">Avise-me</h1>
      <p className="mt-2 text-sm leading-6 text-mute">
        Clientes que pediram aviso quando um produto esgotado voltar. Chame pelo WhatsApp quando repor o estoque.
      </p>
      <InterestedList people={people} storeName={store.nome} productBaseUrl={storeUrl(store, "/produto/")} />
    </div>
  );
}
