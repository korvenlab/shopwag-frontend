"use client";

import { useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Search } from "lucide-react";
import { ProductCard } from "@/components/store/product-card";
import type { Produto } from "@/features/domain/types";

function normalize(value: string) {
  return value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
}

export function SearchView({ slug, products }: { slug: string; products: Produto[] }) {
  const params = useSearchParams();
  const [query, setQuery] = useState(params.get("q") ?? "");
  const visible = useMemo(() => {
    const term = normalize(query.trim());
    if (!term) return products;
    return products.filter((product) =>
      normalize(`${product.nome} ${product.descricao} ${product.categoria} ${product.time ?? ""}`).includes(term),
    );
  }, [products, query]);

  return (
    <div className="mx-auto max-w-6xl px-4 pt-6 md:px-8 md:pt-10">
      <h1 className="font-serif text-4xl md:text-5xl">Buscar</h1>
      <label className="group mt-5 flex h-14 items-center gap-3 rounded-full border border-paper/15 bg-panel px-5 transition-colors duration-300 focus-within:border-paper/60 md:max-w-xl">
        <Search size={18} className="text-mute transition-colors group-focus-within:text-paper" />
        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Nome, categoria ou detalhe"
          aria-label="Buscar produtos"
          className="h-full w-full bg-transparent text-base outline-none placeholder:text-mute"
          autoFocus
        />
      </label>
      <p className="mt-4 text-xs text-mute">
        {visible.length} {visible.length === 1 ? "resultado" : "resultados"}
      </p>
      <div key={query} className="mt-5 grid grid-cols-2 gap-x-3 gap-y-7 sm:grid-cols-3 md:gap-x-5 lg:grid-cols-4">
        {visible.map((product, index) => (
          <ProductCard key={product.id} storeSlug={slug} product={product} index={index} />
        ))}
      </div>
      {visible.length === 0 ? <p className="mt-8 text-sm text-mute">Nenhum produto encontrado.</p> : null}
    </div>
  );
}
