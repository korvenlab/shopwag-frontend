"use client";

import { useMemo, useState } from "react";
import { ProductCard } from "@/components/store/product-card";
import { Input } from "@/components/ui/input";
import type { Produto } from "@/features/domain/types";

export function SearchView({ slug, products }: { slug: string; products: Produto[] }) {
  const [query, setQuery] = useState("");
  const visible = useMemo(() => {
    const term = query.trim().toLowerCase();
    if (!term) return products;
    return products.filter((product) =>
      `${product.nome} ${product.descricao} ${product.categoria}`.toLowerCase().includes(term),
    );
  }, [products, query]);

  return (
    <div className="px-5 pt-6">
      <h1 className="font-serif text-4xl">Buscar</h1>
      <Input
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        placeholder="Nome, categoria ou detalhe"
        className="mt-5"
        autoFocus
      />
      <div className="mt-6 grid grid-cols-2 gap-4">
        {visible.map((product) => (
          <ProductCard key={product.id} storeSlug={slug} product={product} />
        ))}
      </div>
      {visible.length === 0 ? <p className="mt-8 text-sm text-mute">Nenhum produto encontrado.</p> : null}
    </div>
  );
}
