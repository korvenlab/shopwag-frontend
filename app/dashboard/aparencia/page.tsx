import { Suspense } from "react";
import Link from "next/link";
import { StoreAppearance } from "@/components/dashboard/store-appearance";
import { StoreContact } from "@/components/dashboard/store-contact";
import { StoreLanding } from "@/components/dashboard/store-landing";
import { StoreProductLook } from "@/components/dashboard/store-product-look";
import { StoreShowcase } from "@/components/dashboard/store-showcase";
import { getOwnStore, listOwnProducts } from "@/features/merchant/queries";
import { SCHEMA_MISSING, catchSchema } from "@/lib/schema-error";

const SECTIONS = [
  { id: "tema", label: "Tema" },
  { id: "landing", label: "Landing" },
  { id: "produtos", label: "Produtos" },
  { id: "banners", label: "Banners" },
  { id: "contato", label: "Rodapé" },
];

export default function AppearanceSettingsPage() {
  return (
    <Suspense fallback={<p className="px-5 py-8 text-sm text-mute">Carregando aparência…</p>}>
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
  const products = await listOwnProducts(store.id).catch(() => []);
  const categories = Array.from(
    new Set(products.map((product) => product.categoria?.trim()).filter((name): name is string => Boolean(name))),
  ).sort((a, b) => a.localeCompare(b, "pt-BR"));
  return (
    <>
      <div className="px-5 pt-6 lg:sticky lg:top-0 lg:z-20 lg:bg-ink lg:pb-3">
        <h1 className="font-serif text-4xl">Aparência</h1>
        <nav className="no-scrollbar -mx-5 mt-4 flex gap-2 overflow-x-auto px-5 lg:flex-wrap" aria-label="Seções">
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
      <StoreAppearance store={store} />
      <StoreLanding store={store} categories={categories} />
      <StoreProductLook store={store} />
      <StoreShowcase store={store} />
      <StoreContact store={store} />
    </>
  );
}
