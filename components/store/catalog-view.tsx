"use client";

import { useMemo, useRef, useState } from "react";
import { ChevronLeft, ChevronRight, LayoutGrid, MessageCircle } from "lucide-react";
import { BannerCarousel } from "@/components/store/banner-carousel";
import { ProductCard } from "@/components/store/product-card";
import { StoreLogo } from "@/components/store/store-logo";
import type { Loja, Produto } from "@/features/domain/types";
import { discountPercent } from "@/lib/money";
import { whatsappHref } from "@/lib/phone";

const ALL = "Tudo";
const CATEGORIES_ID = "categorias";
const TEAMS_ID = "times";
const SECTION_THRESHOLD = 12;
const GROUP_PREVIEW = 8;
const GRID = "grid grid-cols-2 gap-x-3 gap-y-7 sm:grid-cols-3 md:gap-x-5 lg:grid-cols-4";

export function CatalogView({
  store,
  products,
  bestSellers = [],
}: {
  store: Loja;
  products: Produto[];
  bestSellers?: Produto[];
}) {
  const [category, setCategory] = useState(ALL);
  const [team, setTeam] = useState(ALL);
  const teams = useMemo(() => {
    const names = new Set<string>();
    for (const product of products) {
      const name = product.time?.trim();
      if (name) names.add(name);
    }
    return Array.from(names).sort((a, b) => a.localeCompare(b, "pt-BR"));
  }, [products]);
  const pool = team === ALL ? products : products.filter((product) => product.time === team);
  const groups = useMemo(() => {
    const map = new Map<string, Produto[]>();
    for (const product of products) {
      const list = map.get(product.categoria) ?? [];
      list.push(product);
      map.set(product.categoria, list);
    }
    return Array.from(map, ([name, items]) => ({
      name,
      items,
      cover: items.find((item) => item.produto_imagens[0])?.produto_imagens[0]?.url ?? null,
    }));
  }, [products]);

  const featured = pool.filter((product) => product.destaque);
  const deals = pool.filter((product) => discountPercent(product.preco_centavos, product.preco_de_centavos));
  const filtered = category === ALL ? pool : pool.filter((product) => product.categoria === category);
  const browsing = category !== ALL || team !== ALL;
  const heading = [team !== ALL ? team : null, category !== ALL ? category : null].filter(Boolean).join(" · ");

  function pick(next: string) {
    setCategory(next);
    document.getElementById(CATEGORIES_ID)?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function pickTeam(next: string) {
    setTeam(next);
    if (next !== ALL && category !== ALL && !products.some((product) => product.time === next && product.categoria === category)) {
      setCategory(ALL);
    }
    document.getElementById(TEAMS_ID)?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  return (
    <div>
      <Hero store={store} />

      {!browsing && featured.length > 0 ? (
        <div className="mx-auto max-w-6xl">
          <Rail title="Destaques" slug={store.slug} products={featured} />
        </div>
      ) : null}

      <div className="mx-auto max-w-6xl">
      {groups.length > 1 ? (
        <section id={CATEGORIES_ID} className="scroll-mt-20 pt-8 md:pt-12">
          <SectionTitle className="px-4 md:px-8">Categorias</SectionTitle>
          <div className="no-scrollbar mt-4 flex snap-x gap-4 overflow-x-auto px-4 pb-2 md:gap-6 md:px-8">
            <CategoryBubble label={ALL} active={category === ALL} onClick={() => pick(ALL)} index={0} />
            {groups.map((group, index) => (
              <CategoryBubble
                key={group.name}
                label={group.name}
                image={group.cover}
                active={category === group.name}
                onClick={() => pick(group.name)}
                index={index + 1}
              />
            ))}
          </div>
        </section>
      ) : (
        <div id={CATEGORIES_ID} className="scroll-mt-20" />
      )}

      {teams.length > 1 ? (
        <section id={TEAMS_ID} className="scroll-mt-20 px-4 pt-8 md:px-8">
          <SectionTitle>Times</SectionTitle>
          <div className="no-scrollbar mt-4 flex gap-2 overflow-x-auto pb-1">
            <TeamChip label={ALL} active={team === ALL} onClick={() => pickTeam(ALL)} />
            {teams.map((name) => (
              <TeamChip key={name} label={name} active={team === name} onClick={() => pickTeam(name)} />
            ))}
          </div>
        </section>
      ) : null}

      {products.length === 0 ? (
        <p className="px-4 pt-16 text-center text-sm text-mute md:px-8">A loja ainda está montando a vitrine.</p>
      ) : !browsing ? (
        <>
          {bestSellers.length >= 2 ? <Rail title="Mais vendidos" slug={store.slug} products={bestSellers} /> : null}

          {deals.length > 0 ? (
            <section className="px-4 pt-12 md:px-8 md:pt-16">
              <SectionTitle>Promoções</SectionTitle>
              <div className={`mt-5 ${GRID}`}>
                {deals.map((product, index) => (
                  <ProductCard key={product.id} storeSlug={store.slug} product={product} index={index} />
                ))}
              </div>
            </section>
          ) : null}

          {pool.length <= SECTION_THRESHOLD || groups.length < 2 ? (
            <section className="px-4 pt-12 md:px-8 md:pt-16">
              <SectionTitle>Todos os produtos</SectionTitle>
              <div className={`mt-5 ${GRID}`}>
                {pool.map((product, index) => (
                  <ProductCard key={product.id} storeSlug={store.slug} product={product} index={index} />
                ))}
              </div>
            </section>
          ) : null}

          {pool.length > SECTION_THRESHOLD && groups.length > 1
            ? groups.map((group) => (
                <section key={group.name} className="px-4 pt-12 md:px-8 md:pt-16">
                  <div className="flex flex-col items-center gap-2">
                    <SectionTitle>{group.name}</SectionTitle>
                    {group.items.length > GROUP_PREVIEW ? (
                      <button
                        type="button"
                        onClick={() => pick(group.name)}
                        className="group flex items-center gap-1 text-xs text-mute transition hover:text-paper"
                      >
                        Ver todos ({group.items.length})
                        <ChevronRight
                          size={14}
                          className="transition-transform duration-300 group-hover:translate-x-0.5"
                        />
                      </button>
                    ) : null}
                  </div>
                  <div className={`mt-5 ${GRID}`}>
                    {group.items.slice(0, GROUP_PREVIEW).map((product, index) => (
                      <ProductCard key={product.id} storeSlug={store.slug} product={product} index={index} />
                    ))}
                  </div>
                </section>
              ))
            : null}
        </>
      ) : (
        <section key={heading} className="px-4 pt-10 md:px-8">
          <div className="flex items-baseline justify-between">
            <h2 className="enter font-serif text-3xl md:text-4xl">{heading}</h2>
            <span className="text-xs text-mute">
              {filtered.length} {filtered.length === 1 ? "peça" : "peças"}
            </span>
          </div>
          {filtered.length === 0 ? (
            <p className="mt-8 text-sm text-mute">Nenhuma peça com essa combinação.</p>
          ) : (
            <div className={`mt-5 ${GRID}`}>
              {filtered.map((product, index) => (
                <ProductCard key={product.id} storeSlug={store.slug} product={product} index={index} />
              ))}
            </div>
          )}
        </section>
      )}
      </div>
    </div>
  );
}

function Hero({ store }: { store: Loja }) {
  const banners = Array.isArray(store.banners) ? store.banners.filter((banner) => banner?.url) : [];
  const hasCover = banners.length > 0 || Boolean(store.capa_url);
  return (
    <header>
      {banners.length > 0 ? (
        <BannerCarousel banners={banners} />
      ) : store.capa_url ? (
        <div className="enter group relative overflow-hidden">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={store.capa_url}
            alt=""
            className="aspect-[4/3] w-full object-cover transition-transform duration-[6s] ease-linear group-hover:scale-[1.04] md:aspect-[21/8]"
          />
        </div>
      ) : null}
      <div className="mx-auto flex max-w-6xl flex-col items-center gap-4 px-4 pt-6 text-center md:px-8 md:pt-8">
        <div className="enter flex max-w-3xl flex-col items-center" style={{ "--i": 1 } as React.CSSProperties}>
          {hasCover ? null : <StoreLogo store={store} size={72} />}
          <h1 className={`font-serif text-4xl leading-none md:text-6xl ${hasCover ? "" : "mt-4"}`}>{store.nome}</h1>
          {store.descricao ? (
            <p className="mt-3 text-sm leading-6 whitespace-pre-line text-mute md:text-base md:leading-7">
              {store.descricao}
            </p>
          ) : null}
        </div>
        {store.whatsapp ? (
          <a
            href={whatsappHref(store.whatsapp)}
            target="_blank"
            rel="noreferrer"
            className="enter inline-flex h-11 shrink-0 items-center gap-2 rounded-full border border-paper/20 px-5 text-sm transition duration-300 hover:border-paper/70 hover:bg-paper/5"
            style={{ "--i": 2 } as React.CSSProperties}
          >
            <MessageCircle size={16} />
            Falar com a loja
          </a>
        ) : null}
      </div>
    </header>
  );
}

function SectionTitle({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <h2 className={`reveal text-center text-xl font-semibold tracking-[0.16em] uppercase md:text-2xl ${className}`}>
      {children}
    </h2>
  );
}

function TeamChip({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`shrink-0 rounded-full border px-4 py-2 text-sm transition duration-300 ${
        active
          ? "border-accent bg-accent/15 text-paper shadow-[0_0_16px_color-mix(in_srgb,var(--color-accent)_45%,transparent)]"
          : "border-paper/15 text-mute hover:border-paper/50 hover:text-paper"
      }`}
    >
      {label}
    </button>
  );
}

function CategoryBubble({
  label,
  image,
  active,
  onClick,
  index,
}: {
  label: string;
  image?: string | null;
  active: boolean;
  onClick: () => void;
  index: number;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className="enter group flex w-[72px] shrink-0 snap-start flex-col items-center gap-2 md:w-[92px]"
      style={{ "--i": index } as React.CSSProperties}
    >
      <span
        className={`relative grid h-[72px] w-[72px] place-items-center rounded-full p-[3px] transition duration-500 ease-out-expo md:h-[92px] md:w-[92px] ${
          active ? "bg-accent shadow-[0_0_22px_color-mix(in_srgb,var(--color-accent)_55%,transparent)]" : "bg-paper/15 group-hover:bg-paper/50"
        }`}
      >
        <span className="grid h-full w-full place-items-center overflow-hidden rounded-full border-2 border-ink bg-panel">
          {image ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={image}
              alt=""
              className="h-full w-full object-cover transition-transform duration-700 ease-out-expo group-hover:scale-110"
            />
          ) : (
            <LayoutGrid size={22} strokeWidth={1.5} className="text-paper" />
          )}
        </span>
      </span>
      <span
        className={`line-clamp-2 text-center text-xs transition-colors ${active ? "text-paper" : "text-mute group-hover:text-paper"}`}
      >
        {label}
      </span>
    </button>
  );
}

function Rail({ title, slug, products }: { title: string; slug: string; products: Produto[] }) {
  const track = useRef<HTMLDivElement>(null);

  function move(direction: 1 | -1) {
    const node = track.current;
    if (!node) return;
    node.scrollBy({ left: direction * node.clientWidth * 0.8, behavior: "smooth" });
  }

  return (
    <section className="pt-12 md:pt-16">
      <div className="relative flex items-center justify-center px-4 md:px-8">
        <SectionTitle>{title}</SectionTitle>
        <div className={`absolute right-4 hidden gap-2 md:right-8 ${products.length > 4 ? "md:flex" : products.length > 3 ? "md:flex lg:hidden" : ""}`}>
          <RailButton label="Anterior" onClick={() => move(-1)}>
            <ChevronLeft size={18} />
          </RailButton>
          <RailButton label="Próximo" onClick={() => move(1)}>
            <ChevronRight size={18} />
          </RailButton>
        </div>
      </div>
      <div
        ref={track}
        className="no-scrollbar mt-5 flex snap-x snap-mandatory gap-3 overflow-x-auto scroll-px-4 px-4 pb-2 md:scroll-px-8 md:gap-5 md:px-8"
      >
        {products.map((product, index) => (
          <ProductCard
            key={product.id}
            storeSlug={slug}
            product={product}
            index={index}
            className="w-[46%] shrink-0 snap-start sm:w-[32%] lg:w-[calc(25%-15px)]"
          />
        ))}
      </div>
    </section>
  );
}

function RailButton({ label, onClick, children }: { label: string; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      aria-label={label}
      onClick={onClick}
      className="grid h-10 w-10 place-items-center rounded-full border border-paper/15 transition duration-300 hover:border-paper/70 hover:bg-paper/5 active:scale-90"
    >
      {children}
    </button>
  );
}
