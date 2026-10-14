"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Search, ShoppingBag } from "lucide-react";
import { useCartDrawer } from "@/features/cart/drawer";
import { useCartSummary } from "@/features/cart/store";
import type { Loja } from "@/features/domain/types";

export function StoreLogo({ store, size = 40 }: { store: Pick<Loja, "nome" | "logo_url">; size?: number }) {
  if (store.logo_url) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={store.logo_url}
        alt=""
        width={size}
        height={size}
        className="shrink-0 rounded-2xl border border-white/15 object-cover"
        style={{ width: size, height: size }}
      />
    );
  }
  return (
    <span
      aria-hidden
      className="grid shrink-0 place-items-center rounded-2xl border border-white/20 bg-panel font-serif text-paper"
      style={{ width: size, height: size, fontSize: size * 0.48 }}
    >
      {store.nome.trim().charAt(0).toUpperCase()}
    </span>
  );
}

export function StoreHeader({ store }: { store: Pick<Loja, "nome" | "slug" | "logo_url"> }) {
  const router = useRouter();
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
    router.push(`/s/${store.slug}/busca${term ? `?q=${encodeURIComponent(term)}` : ""}`);
  }

  return (
    <header
      className={`sticky top-0 z-30 transition-[background-color,border-color,backdrop-filter] duration-500 ease-out-expo ${
        scrolled ? "border-b border-white/10 bg-ink/80 backdrop-blur-xl" : "border-b border-transparent bg-ink"
      }`}
    >
      <div
        className={`mx-auto flex max-w-6xl items-center gap-3 px-4 transition-[height] duration-500 ease-out-expo md:px-8 ${
          scrolled ? "h-14" : "h-16 md:h-20"
        }`}
      >
        <Link href={`/s/${store.slug}`} className="flex min-w-0 items-center gap-3">
          <StoreLogo store={store} size={scrolled ? 32 : 40} />
          <span className="truncate font-serif text-xl md:text-2xl">{store.nome}</span>
        </Link>

        <form onSubmit={search} className="ml-auto hidden w-full max-w-sm md:block" role="search">
          <label className="group flex h-11 items-center gap-2 rounded-full border border-white/15 bg-panel px-4 transition-colors duration-300 focus-within:border-white/60">
            <Search size={16} className="text-mute transition-colors group-focus-within:text-paper" />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Buscar na loja"
              aria-label="Buscar na loja"
              className="h-full w-full bg-transparent text-sm outline-none placeholder:text-mute"
            />
          </label>
        </form>

        <Link
          href={`/s/${store.slug}/busca`}
          aria-label="Buscar"
          className="ml-auto grid h-11 w-11 place-items-center rounded-full text-paper transition hover:bg-white/10 md:hidden"
        >
          <Search size={20} strokeWidth={1.5} />
        </Link>

        <button
          type="button"
          onClick={() => openCart(true)}
          aria-label={`Abrir sacola, ${count} ${count === 1 ? "item" : "itens"}`}
          className="relative grid h-11 w-11 shrink-0 place-items-center rounded-full border border-white/15 transition duration-300 hover:border-white/60 hover:bg-white/5 active:scale-95"
        >
          <ShoppingBag size={19} strokeWidth={1.5} />
          {count > 0 ? (
            <span
              key={count}
              className="bump absolute -top-1 -right-1 grid h-5 min-w-5 place-items-center rounded-full bg-paper px-1 text-[10px] font-semibold text-ink"
            >
              {count}
            </span>
          ) : null}
        </button>
      </div>
    </header>
  );
}
