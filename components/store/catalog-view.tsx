"use client";

import { useMemo, useRef, useState } from "react";
import { ChevronLeft, ChevronRight, LayoutGrid, MessageCircle } from "lucide-react";
import { BannerCarousel } from "@/components/store/banner-carousel";
import { ProductCard } from "@/components/store/product-card";
import { StoreLogo } from "@/components/store/store-logo";
import type { Loja, Produto } from "@/features/domain/types";
import { discountPercent } from "@/lib/money";
import { whatsappHref } from "@/lib/phone";
import {
  asLayoutModo,
  asProvaTipo,
  catalogGridClass,
  catalogRailCardClass,
  normalizeStoreSections,
  resolveCtaHref,
  sectionTitleClass,
  type LayoutModo,
  type StoreSectionId,
} from "@/lib/storefront";

const ALL = "Tudo";
const CATEGORIES_ID = "categorias";
const TEAMS_ID = "times";
const SECTION_THRESHOLD = 12;
const GROUP_PREVIEW = 8;

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
  const layout = asLayoutModo(store.layout_modo);
  const grid = catalogGridClass(layout);
  const railCard = catalogRailCardClass(layout);
  const titleClass = sectionTitleClass(layout);
  const sections = useMemo(() => normalizeStoreSections(store.secoes), [store.secoes]);
  const enabled = useMemo(() => new Set(sections.filter((section) => section.on).map((section) => section.id)), [sections]);
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
  const colecaoNome = store.colecao_destaque?.trim() || "";
  const colecao = colecaoNome
    ? products.filter((product) => product.categoria === colecaoNome).slice(0, layout === "editorial" ? 4 : 8)
    : [];

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

  function renderNavSection(id: Extract<StoreSectionId, "categorias" | "times">) {
    if (id === "categorias") {
      const show = enabled.has("categorias") || browsing;
      if (!show || groups.length <= 1) return <div key={id} id={CATEGORIES_ID} className="scroll-mt-20" />;
      return (
        <section key={id} id={CATEGORIES_ID} className="mx-auto max-w-6xl scroll-mt-20 pt-8 md:pt-12">
          <SectionTitle className={`px-4 md:px-8 ${titleClass}`}>Categorias</SectionTitle>
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
      );
    }
    const showTeams = (enabled.has("times") || browsing) && teams.length > 1;
    if (!showTeams) return null;
    return (
      <section key={id} id={TEAMS_ID} className="mx-auto max-w-6xl scroll-mt-20 px-4 pt-8 md:px-8">
        <SectionTitle className={titleClass}>Times</SectionTitle>
        <div className="no-scrollbar mt-4 flex gap-2 overflow-x-auto pb-1">
          <TeamChip label={ALL} active={team === ALL} onClick={() => pickTeam(ALL)} />
          {teams.map((name) => (
            <TeamChip key={name} label={name} active={team === name} onClick={() => pickTeam(name)} />
          ))}
        </div>
      </section>
    );
  }

  function renderProductSection(id: StoreSectionId) {
    switch (id) {
      case "destaques":
        return featured.length > 0 ? (
          <div key={id} id="destaques" className="mx-auto max-w-6xl scroll-mt-20">
            <Rail title="Destaques" slug={store.slug} products={featured} layout={layout} titleClass={titleClass} cardClass={railCard} />
          </div>
        ) : (
          <div key={id} id="destaques" className="scroll-mt-20" />
        );
      case "mais_vendidos":
        return bestSellers.length >= 2 ? (
          <div key={id} id="mais_vendidos" className="mx-auto max-w-6xl scroll-mt-20">
            <Rail
              title="Mais vendidos"
              slug={store.slug}
              products={bestSellers}
              layout={layout}
              titleClass={titleClass}
              cardClass={railCard}
            />
          </div>
        ) : null;
      case "promocoes":
        return deals.length > 0 ? (
          <section key={id} id="promocoes" className="mx-auto max-w-6xl scroll-mt-20 px-4 pt-12 md:px-8 md:pt-16">
            <SectionTitle className={titleClass}>Promoções</SectionTitle>
            <div className={`mt-5 ${grid}`}>
              {deals.map((product, index) => (
                <ProductCard key={product.id} storeSlug={store.slug} product={product} index={index} />
              ))}
            </div>
          </section>
        ) : (
          <div key={id} id="promocoes" className="scroll-mt-20" />
        );
      case "catalogo":
        if (pool.length <= SECTION_THRESHOLD || groups.length < 2) {
          return (
            <section key={id} id="catalogo" className="mx-auto max-w-6xl scroll-mt-20 px-4 pt-12 md:px-8 md:pt-16">
              <SectionTitle className={titleClass}>Todos os produtos</SectionTitle>
              <div className={`mt-5 ${grid}`}>
                {pool.map((product, index) => (
                  <ProductCard key={product.id} storeSlug={store.slug} product={product} index={index} />
                ))}
              </div>
            </section>
          );
        }
        return (
          <div key={id} id="catalogo" className="mx-auto max-w-6xl scroll-mt-20">
            {groups.map((group) => (
              <section key={group.name} className="px-4 pt-12 md:px-8 md:pt-16">
                <div className="flex flex-col items-center gap-2">
                  <SectionTitle className={titleClass}>{group.name}</SectionTitle>
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
                <div className={`mt-5 ${grid}`}>
                  {group.items.slice(0, GROUP_PREVIEW).map((product, index) => (
                    <ProductCard key={product.id} storeSlug={store.slug} product={product} index={index} />
                  ))}
                </div>
              </section>
            ))}
          </div>
        );
      default:
        return null;
    }
  }

  return (
    <div data-layout={layout}>
      <Hero store={store} />
      {!browsing && store.prova_ativa && store.prova_texto?.trim() ? <SocialProof store={store} /> : null}
      {!browsing && colecao.length > 0 ? (
        <div className="mx-auto max-w-6xl">
          <Rail
            title={colecaoNome}
            slug={store.slug}
            products={colecao}
            layout={layout}
            titleClass={titleClass}
            cardClass={railCard}
            action={
              <button
                type="button"
                onClick={() => pick(colecaoNome)}
                className="group flex items-center gap-1 text-xs text-mute transition hover:text-paper"
              >
                Ver coleção
                <ChevronRight size={14} className="transition-transform duration-300 group-hover:translate-x-0.5" />
              </button>
            }
          />
        </div>
      ) : null}

      {products.length === 0 ? (
        <p className="px-4 pt-16 text-center text-sm text-mute md:px-8">A loja ainda está montando a vitrine.</p>
      ) : (
        <>
          {sections.map((section) => {
            if (section.id === "categorias" || section.id === "times") {
              return section.on || browsing ? renderNavSection(section.id) : null;
            }
            if (!section.on || browsing) return null;
            return renderProductSection(section.id);
          })}
          {!enabled.has("categorias") && !browsing ? <div id={CATEGORIES_ID} className="scroll-mt-20" /> : null}
          {!enabled.has("times") && !browsing ? <div id={TEAMS_ID} className="scroll-mt-20" /> : null}
          {browsing ? (
            <section key={heading} className="mx-auto max-w-6xl px-4 pt-10 md:px-8">
              <div className="flex items-baseline justify-between">
                <h2 className="enter font-serif text-3xl md:text-4xl">{heading}</h2>
                <span className="text-xs text-mute">
                  {filtered.length} {filtered.length === 1 ? "peça" : "peças"}
                </span>
              </div>
              {filtered.length === 0 ? (
                <p className="mt-8 text-sm text-mute">Nenhuma peça com essa combinação.</p>
              ) : (
                <div className={`mt-5 ${grid}`}>
                  {filtered.map((product, index) => (
                    <ProductCard key={product.id} storeSlug={store.slug} product={product} index={index} />
                  ))}
                </div>
              )}
            </section>
          ) : null}
        </>
      )}
    </div>
  );
}

function Hero({ store }: { store: Loja }) {
  const banners = Array.isArray(store.banners) ? store.banners.filter((banner) => banner?.url) : [];
  const hasCover = banners.length > 0 || Boolean(store.capa_url);
  const headline = store.headline?.trim() || store.nome;
  const subtitle = store.subtitulo?.trim() || store.descricao?.trim() || "";
  const ctaText = store.cta_texto?.trim();
  const ctaHref = resolveCtaHref(store.cta_link);
  return (
    <header>
      {banners.length > 0 ? (
        <div className="relative">
          <BannerCarousel banners={banners} />
          <BannerLogo store={store} />
        </div>
      ) : store.capa_url ? (
        <div className="enter group relative overflow-hidden">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={store.capa_url}
            alt=""
            className="aspect-[4/3] w-full object-cover transition-transform duration-[6s] ease-linear group-hover:scale-[1.04] md:aspect-[21/8]"
          />
          <BannerLogo store={store} />
        </div>
      ) : null}
      <div className="mx-auto flex max-w-6xl flex-col items-center gap-4 px-4 pt-6 text-center md:px-8 md:pt-8">
        <div className="enter flex max-w-3xl flex-col items-center" style={{ "--i": 1 } as React.CSSProperties}>
          {hasCover ? null : <StoreLogo store={store} size={72} />}
          {store.headline?.trim() ? (
            <p className={`text-[11px] tracking-[0.18em] text-mute uppercase ${hasCover ? "" : "mt-4"}`}>{store.nome}</p>
          ) : null}
          <h1
            className={`font-serif text-4xl leading-none md:text-6xl ${
              hasCover || store.headline?.trim() ? (store.headline?.trim() ? "mt-2" : "") : "mt-4"
            }`}
          >
            {headline}
          </h1>
          {subtitle ? (
            <p className="mt-3 text-sm leading-6 whitespace-pre-line text-mute md:text-base md:leading-7">{subtitle}</p>
          ) : null}
        </div>
        <div className="enter flex flex-wrap items-center justify-center gap-3" style={{ "--i": 2 } as React.CSSProperties}>
          {ctaText && ctaHref ? (
            <a
              href={ctaHref}
              className="inline-flex h-11 items-center rounded-full bg-accent px-5 text-sm font-medium text-on-accent transition duration-300 hover:opacity-90"
            >
              {ctaText}
            </a>
          ) : null}
          {store.whatsapp ? (
            <a
              href={whatsappHref(store.whatsapp)}
              target="_blank"
              rel="noreferrer"
              className={`inline-flex h-11 shrink-0 items-center gap-2 rounded-full border border-paper/20 px-5 text-sm transition duration-300 hover:border-paper/70 hover:bg-paper/5 ${
                ctaText && ctaHref ? "" : ""
              }`}
            >
              <MessageCircle size={16} />
              Falar com a loja
            </a>
          ) : null}
        </div>
      </div>
    </header>
  );
}

function SocialProof({ store }: { store: Loja }) {
  const tipo = asProvaTipo(store.prova_tipo);
  const texto = store.prova_texto?.trim();
  if (!texto) return null;
  if (tipo === "depoimento") {
    return (
      <aside className="mx-auto max-w-3xl px-4 pt-8 text-center md:px-8 md:pt-10">
        <blockquote className="font-serif text-2xl leading-snug md:text-3xl">“{texto}”</blockquote>
        {store.prova_autor?.trim() ? (
          <p className="mt-3 text-xs tracking-[0.16em] text-mute uppercase">{store.prova_autor.trim()}</p>
        ) : null}
      </aside>
    );
  }
  return (
    <aside className="mx-auto flex max-w-6xl justify-center px-4 pt-8 md:px-8 md:pt-10">
      <p className="rounded-full border border-paper/20 px-5 py-2 text-sm tracking-[0.08em]">{texto}</p>
    </aside>
  );
}

function BannerLogo({ store }: { store: Loja }) {
  if (!store.logo_url) return null;
  return (
    <div className="pointer-events-none absolute inset-0 grid place-items-center">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={store.logo_url}
        alt=""
        className="max-h-[62%] max-w-[72%] object-contain drop-shadow-[0_12px_28px_rgba(0,0,0,0.55)]"
      />
    </div>
  );
}

function SectionTitle({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <h2 className={className}>{children}</h2>;
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

function Rail({
  title,
  slug,
  products,
  layout,
  titleClass,
  cardClass,
  action,
}: {
  title: string;
  slug: string;
  products: Produto[];
  layout: LayoutModo;
  titleClass: string;
  cardClass: string;
  action?: React.ReactNode;
}) {
  const track = useRef<HTMLDivElement>(null);

  function move(direction: 1 | -1) {
    const node = track.current;
    if (!node) return;
    node.scrollBy({ left: direction * node.clientWidth * 0.8, behavior: "smooth" });
  }

  return (
    <section className="pt-12 md:pt-16">
      <div className="relative flex flex-col items-center justify-center gap-2 px-4 md:px-8">
        <SectionTitle className={titleClass}>{title}</SectionTitle>
        {action}
        <div
          className={`absolute right-4 hidden gap-2 md:right-8 ${
            products.length > (layout === "editorial" ? 2 : layout === "compacto" ? 5 : 4)
              ? "md:flex"
              : products.length > 3
                ? "md:flex lg:hidden"
                : ""
          }`}
        >
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
          <ProductCard key={product.id} storeSlug={slug} product={product} index={index} className={cardClass} />
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
