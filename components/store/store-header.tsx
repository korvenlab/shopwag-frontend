"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Search, ShoppingBag } from "lucide-react";
import { useCartDrawer } from "@/features/cart/drawer";
import { useCartSummary } from "@/features/cart/store";
import type { LogoStore } from "@/components/store/store-logo";
import { storeHref, useStoreBase } from "@/lib/store-path";

export function StoreHeader({ store }: { store: LogoStore & { slug: string; mostrar_nome?: boolean } }) {
  const router = useRouter();
  const base = useStoreBase(store.slug);
  const { count } = useCartSummary(store.slug);
  const openCart = useCartDrawer((state) => state.setOpen);
  const [scrolled, setScrolled] = useState(false);
  const [query, setQuery] = useState("");

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  function search(event: React.FormEvent) {
    event.preventDefault();
    const term = query.trim();
    router.push(storeHref(base, `/busca${term ? `?q=${encodeURIComponent(term)}` : ""}`));
  }

  return (
    <header
      className={`sticky top-0 z-30 transition-[background-color,border-color,backdrop-filter] duration-500 ease-out-expo ${
        scrolled ? "border-b border-paper/10 bg-ink/80 backdrop-blur-xl" : "border-b border-transparent bg-ink"
      }`}
    >
      <div
        className={`mx-auto flex max-w-6xl items-center gap-3 px-4 transition-[height] duration-500 ease-out-expo md:px-8 ${
          scrolled ? "h-14" : "h-16 md:h-20"
        }`}
      >
        <Link href={storeHref(base)} className="min-w-0 truncate font-serif text-xl md:text-2xl">
          {store.nome}
        </Link>

        <form onSubmit={search} className="ml-auto hidden w-full max-w-sm md:block" role="search">
          <label className="group flex h-11 items-center gap-2 rounded-full border border-paper/15 bg-panel px-4 transition-colors duration-300 focus-within:border-paper/60">
            <Search size={16} className="text-mute transition-colors group-focus-within:text-paper" />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="O que você está buscando?"
              aria-label="Buscar na loja"
              className="h-full w-full bg-transparent text-sm outline-none placeholder:text-mute"
            />
          </label>
        </form>

        <Link
          href={storeHref(base, "/busca")}
          aria-label="Buscar"
          className="ml-auto grid h-11 w-11 place-items-center rounded-full text-paper transition hover:bg-paper/10 md:hidden"
        >
          <Search size={20} strokeWidth={1.5} />
        </Link>

        <button
          type="button"
          onClick={() => openCart(true)}
          aria-label={`Abrir sacola, ${count} ${count === 1 ? "item" : "itens"}`}
          className="relative grid h-11 w-11 shrink-0 place-items-center rounded-full border border-paper/15 transition duration-300 hover:border-paper/60 hover:bg-paper/5 active:scale-95"
        >
          <ShoppingBag size={19} strokeWidth={1.5} />
          {count > 0 ? (
            <span
              key={count}
              className="bump absolute -top-1 -right-1 grid h-5 min-w-5 place-items-center rounded-full bg-accent px-1 text-[10px] font-semibold text-on-accent"
            >
              {count}
            </span>
          ) : null}
        </button>
      </div>
      <form onSubmit={search} className="border-t border-paper/10 px-4 py-2 md:hidden" role="search">
        <label className="flex h-11 items-center gap-2 rounded-full border border-paper/15 bg-panel px-4">
          <Search size={16} className="text-mute" />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="O que você está buscando?"
            aria-label="Buscar na loja"
            className="h-full w-full bg-transparent text-sm outline-none placeholder:text-mute"
          />
        </label>
      </form>
    </header>
  );
}
