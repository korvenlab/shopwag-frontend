import { Suspense } from "react";
import Link from "next/link";
import { StoreAddress } from "@/components/dashboard/store-address";
import { StoreContact } from "@/components/dashboard/store-contact";
import { StoreHours } from "@/components/dashboard/store-hours";
import { StoreCatalogSettings, StoreSeo } from "@/components/dashboard/store-seo";
import { StoreShipping } from "@/components/dashboard/store-shipping";
import { StoreShowcase } from "@/components/dashboard/store-showcase";
import { getOwnStore, listShippingRanges } from "@/features/merchant/queries";
import { SCHEMA_MISSING, catchSchema } from "@/lib/schema-error";
import { storeUrl } from "@/lib/site";

const SECTIONS = [
  { id: "endereco", label: "Link" },
  { id: "vitrine", label: "Banners" },
  { id: "entrega", label: "Frete" },
  { id: "horario", label: "Horário" },
  { id: "contato", label: "Rodapé" },
  { id: "catalogo", label: "Catálogo" },
  { id: "seo", label: "Google" },
];

export default function ShowcaseSettingsPage() {
  return (
    <Suspense fallback={<p className="px-5 py-8 text-sm text-mute">Carregando vitrine…</p>}>
      <Settings />
    </Suspense>
  );
}

async function Settings() {
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
  const ranges = await listShippingRanges(store.id);
  return (
    <>
      <div className="px-5 pt-6">
        <h1 className="font-serif text-4xl">Vitrine</h1>
        <nav className="no-scrollbar -mx-5 mt-4 flex gap-2 overflow-x-auto px-5" aria-label="Seções">
          {SECTIONS.map((section) => (
            <a
              key={section.id}
              href={`#${section.id}`}
              className="shrink-0 rounded-full border border-paper/15 px-4 py-2 text-xs transition hover:border-paper/50"
            >
              {section.label}
            </a>
          ))}
        </nav>
      </div>
      <StoreAddress store={store} />
      <StoreShowcase store={store} />
      <StoreShipping store={store} ranges={ranges} />
      <StoreHours store={store} />
      <StoreContact store={store} />
      <StoreCatalogSettings store={store} publicUrl={storeUrl(store)} />
      <StoreSeo store={store} />
    </>
  );
}
