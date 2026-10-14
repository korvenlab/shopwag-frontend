"use client";

import { useMemo, useState } from "react";
import { ProductCard } from "@/components/store/product-card";
import type { Loja, Produto } from "@/features/domain/types";

export function CatalogView({ store, products }: { store: Loja; products: Produto[] }) {
  const categories = useMemo(
    () => ["Tudo", ...Array.from(new Set(products.map((product) => product.categoria)))],
    [products],
  );
  const [category, setCategory] = useState("Tudo");
  const visible =
    category === "Tudo" ? products : products.filter((product) => product.categoria === category);
  const featured = products.filter((product) => product.destaque);
  const collection = category === "Tudo" ? products.filter((product) => !product.destaque) : visible;
  const showCollection = collection.length > 0 || category !== "Tudo" || featured.length === 0;

  return (
    <div>
      <header className="px-5 pt-6">
        {store.capa_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={store.capa_url}
            alt=""
            className="mb-5 aspect-[16/9] w-full rounded-3xl object-cover"
          />
        ) : null}
        <p className="text-[11px] uppercase tracking-[0.22em] text-mute">Vitrine</p>
        <h1 className="mt-2 font-serif text-5xl leading-none">{store.nome}</h1>
        {store.descricao ? (
          <p className="mt-4 text-sm leading-6 text-mute">{store.descricao}</p>
        ) : null}
      </header>

      <div className="mt-6 flex gap-2 overflow-x-auto px-5 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {categories.map((item) => (
          <button
            key={item}
            type="button"
            onClick={() => setCategory(item)}
            className={`h-10 shrink-0 rounded-full px-4 text-sm ${
              category === item ? "bg-paper text-ink" : "border border-white/15 text-paper"
            }`}
          >
            {item}
          </button>
        ))}
      </div>

      {featured.length > 0 && category === "Tudo" ? (
        <section className="mt-8 px-5">
          <h2 className="text-[11px] uppercase tracking-[0.18em] text-mute">Em destaque</h2>
          <div className="mt-3 grid grid-cols-2 gap-4">
            {featured.map((product) => (
              <ProductCard key={product.id} storeSlug={store.slug} product={product} />
            ))}
          </div>
        </section>
      ) : null}

      {showCollection ? (
        <section className="mt-8 px-5">
          <h2 className="text-[11px] uppercase tracking-[0.18em] text-mute">
            {category === "Tudo" ? "Coleção" : category}
          </h2>
          {collection.length === 0 ? (
            <p className="mt-6 text-sm text-mute">Nada nesta seleção ainda.</p>
          ) : (
            <div className="mt-3 grid grid-cols-2 gap-4">
              {collection.map((product) => (
                <ProductCard key={product.id} storeSlug={store.slug} product={product} />
              ))}
            </div>
          )}
        </section>
      ) : null}
    </div>
  );
}
