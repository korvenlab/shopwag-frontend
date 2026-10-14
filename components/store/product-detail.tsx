"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { storeHref, useStoreBase } from "@/lib/store-path";
import { useRouter } from "next/navigation";
import { ChevronLeft, Minus, Plus } from "lucide-react";
import { ImageCarousel } from "@/components/store/image-carousel";
import { NotifyMe } from "@/components/store/notify-me";
import { Button } from "@/components/ui/button";
import { MAX_LINE_QUANTITY, activeVariants, variantLabel, variantUnitPrice } from "@/features/cart/calc";
import { wholesalePrice, wholesaleTiers } from "@/features/catalog/stock";
import { useCartDrawer } from "@/features/cart/drawer";
import { useCart } from "@/features/cart/store";
import type { Produto } from "@/features/domain/types";
import { discountPercent, formatBRL } from "@/lib/money";

export function ProductDetail({ slug, product }: { slug: string; product: Produto }) {
  const router = useRouter();
  const storeBase = useStoreBase(slug);
  const addItem = useCart((state) => state.addItem);
  const openCart = useCartDrawer((state) => state.setOpen);
  const variants = activeVariants(product);
  const colors = useMemo(
    () => Array.from(new Set(variants.map((variant) => variant.cor).filter(Boolean))) as string[],
    [variants],
  );
  const [color, setColor] = useState<string | null>(colors[0] ?? null);
  const sizes = useMemo(() => {
    const pool = color ? variants.filter((variant) => variant.cor === color) : variants;
    return Array.from(new Set(pool.map((variant) => variant.tamanho).filter(Boolean))) as string[];
  }, [color, variants]);
  const [size, setSize] = useState<string | null>(sizes[0] ?? null);

  const selected = variants.find(
    (variant) =>
      (variant.cor ?? null) === (colors.length ? color : null) &&
      (variant.tamanho ?? null) === (sizes.length ? size : null),
  );
  const needsChoice = variants.length > 0;
  const base = variantUnitPrice(product, selected?.id ?? null);
  const tiers = wholesaleTiers(product);
  const [quantity, setQuantity] = useState(1);
  const maxQuantity = Math.min(MAX_LINE_QUANTITY, selected ? Math.max(selected.estoque, 1) : MAX_LINE_QUANTITY);
  const unit = wholesalePrice(tiers, quantity, base);
  const off = discountPercent(base, product.preco_de_centavos);
  const out = needsChoice && (!selected || selected.estoque < 1);

  function add(buyNow: boolean) {
    if (needsChoice && !selected) return;
    addItem(slug, {
      productId: product.id,
      variantId: selected?.id ?? null,
      quantity: Math.min(quantity, maxQuantity),
      name: product.nome,
      variantLabel: selected ? variantLabel(selected.cor, selected.tamanho) : null,
      imageUrl: product.produto_imagens[0]?.url ?? null,
      unitPriceCents: base,
      tiers,
    });
    if (buyNow) router.push(storeHref(storeBase, "/checkout"));
    else openCart(true);
  }

  return (
    <div className="mx-auto max-w-6xl px-4 pt-3 md:px-8 md:pt-6">
      <Link
        href={storeHref(storeBase)}
        className="group inline-flex h-11 items-center gap-1 text-sm text-mute transition hover:text-paper"
      >
        <ChevronLeft size={18} className="transition-transform duration-300 group-hover:-translate-x-1" />
        Vitrine
        <span className="text-paper/20">/</span>
        <span className="truncate">{product.categoria}</span>
      </Link>
      <div className="mt-2 md:grid md:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)] md:gap-12 lg:gap-16">
        <div className="enter md:sticky md:top-24 md:self-start">
          <ImageCarousel images={product.produto_imagens} name={product.nome} />
        </div>
        <div className="enter md:pt-4" style={{ "--i": 2 } as React.CSSProperties}>
          <p className="mt-6 text-[11px] uppercase tracking-[0.18em] text-mute md:mt-0">{product.categoria}</p>
          <h1 className="mt-2 font-serif text-4xl leading-none md:text-6xl">{product.nome}</h1>
          <p className="mt-4 flex items-baseline gap-3">
            <span key={unit} className="enter font-serif text-3xl md:text-4xl">
              {formatBRL(unit)}
            </span>
            {off ? (
              <>
                <span className="text-sm text-mute line-through">{formatBRL(product.preco_de_centavos ?? 0)}</span>
                <span className="rounded-full bg-accent px-2 py-0.5 text-[11px] text-on-accent">−{off}%</span>
              </>
            ) : null}
          </p>

          {tiers.length ? (
            <div className="mt-5 rounded-2xl border border-paper/15 p-3">
              <p className="text-[11px] uppercase tracking-[0.16em] text-mute">Preço de atacado</p>
              <ul className="mt-2 space-y-1 text-sm">
                {tiers.map((tier) => (
                  <li
                    key={tier.min}
                    className={`flex justify-between transition-colors ${quantity >= tier.min && unit === tier.preco ? "text-accent" : ""}`}
                  >
                    <span>A partir de {tier.min} un.</span>
                    <span>{formatBRL(tier.preco)} cada</span>
                  </li>
                ))}
              </ul>
              <p className="mt-2 text-[11px] text-mute">Vale somando cores e tamanhos desta peça na sacola.</p>
            </div>
          ) : null}

          {colors.length > 0 ? (
            <fieldset className="mt-6">
              <legend className="text-[11px] uppercase tracking-[0.16em] text-mute">Cor · {color}</legend>
              <div className="mt-3 flex gap-3">
                {colors.map((item) => {
                  const hex = variants.find((variant) => variant.cor === item)?.cor_hex ?? "#ffffff";
                  return (
                    <button
                      key={item}
                      type="button"
                      aria-label={item}
                      onClick={() => {
                        setColor(item);
                        const nextSizes = variants
                          .filter((variant) => variant.cor === item)
                          .map((variant) => variant.tamanho)
                          .filter(Boolean) as string[];
                        setSize(nextSizes[0] ?? null);
                      }}
                      className={`h-11 w-11 rounded-full border-2 ring-1 transition duration-300 ease-out-expo hover:scale-110 ${
                        color === item ? "scale-110 border-ink ring-paper" : "border-transparent ring-paper/20"
                      }`}
                      style={{ background: hex }}
                    />
                  );
                })}
              </div>
            </fieldset>
          ) : null}

          {sizes.length > 0 ? (
            <fieldset className="mt-6">
              <legend className="text-[11px] uppercase tracking-[0.16em] text-mute">Tamanho</legend>
              <div className="mt-3 flex flex-wrap gap-2">
                {sizes.map((item) => (
                  <button
                    key={item}
                    type="button"
                    onClick={() => setSize(item)}
                    className={`h-11 min-w-11 rounded-full border px-4 text-sm transition duration-300 ease-out-expo active:scale-95 ${
                      size === item ? "border-paper bg-accent text-on-accent" : "border-paper/20 hover:border-paper/60"
                    }`}
                  >
                    {item}
                  </button>
                ))}
              </div>
            </fieldset>
          ) : null}

          {selected ? (
            <p className="mt-4 text-xs text-mute">
              {selected.estoque > 0 ? `${selected.estoque} em estoque` : "Sem estoque nesta variação"}
            </p>
          ) : null}

          {!out ? (
            <div className="mt-6 flex items-center gap-4">
              <span className="text-[11px] uppercase tracking-[0.16em] text-mute">Quantidade</span>
              <div className="flex items-center rounded-full border border-paper/15">
                <button
                  type="button"
                  aria-label="Diminuir"
                  className="grid h-10 w-10 place-items-center rounded-full transition hover:bg-paper/10 active:scale-90"
                  onClick={() => setQuantity((current) => Math.max(1, current - 1))}
                >
                  <Minus size={14} />
                </button>
                <input
                  aria-label="Quantidade"
                  inputMode="numeric"
                  value={quantity}
                  onChange={(event) => {
                    const next = Number(event.target.value.replace(/\D/g, "")) || 1;
                    setQuantity(Math.min(maxQuantity, Math.max(1, next)));
                  }}
                  className="w-12 bg-transparent text-center text-sm outline-none"
                />
                <button
                  type="button"
                  aria-label="Aumentar"
                  className="grid h-10 w-10 place-items-center rounded-full transition hover:bg-paper/10 active:scale-90"
                  onClick={() => setQuantity((current) => Math.min(maxQuantity, current + 1))}
                >
                  <Plus size={14} />
                </button>
              </div>
            </div>
          ) : null}

          {out ? <NotifyMe productId={product.id} /> : null}

          <div className="mt-8 hidden gap-3 md:flex">
            <Button type="button" className="flex-1" disabled={out} onClick={() => add(false)}>
              {out ? "Sem estoque" : "Adicionar à sacola"}
            </Button>
            <Button type="button" variant="ghost" className="flex-1" disabled={out} onClick={() => add(true)}>
              Comprar agora
            </Button>
          </div>

          <section className="mt-8 border-t border-paper/10 pt-6">
            <h2 className="text-[11px] uppercase tracking-[0.16em] text-mute">Descrição</h2>
            <p className="mt-3 text-sm leading-7 whitespace-pre-line md:text-base md:leading-8">{product.descricao}</p>
          </section>
        </div>
      </div>

      <div className="sticky bottom-[calc(4rem+env(safe-area-inset-bottom))] z-20 -mx-4 mt-8 flex gap-2 border-t border-paper/10 bg-ink/85 px-4 py-3 backdrop-blur-xl md:hidden">
        <Button type="button" className="flex-1" disabled={out} onClick={() => add(false)}>
          {out ? "Sem estoque" : `Adicionar · ${formatBRL(unit * quantity)}`}
        </Button>
        <Button type="button" variant="ghost" disabled={out} onClick={() => add(true)}>
          Comprar
        </Button>
      </div>
    </div>
  );
}
