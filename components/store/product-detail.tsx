"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import { ImageCarousel } from "@/components/store/image-carousel";
import { Button } from "@/components/ui/button";
import { activeVariants, variantLabel, variantUnitPrice } from "@/features/cart/calc";
import { useCartDrawer } from "@/features/cart/drawer";
import { useCart } from "@/features/cart/store";
import type { Produto } from "@/features/domain/types";
import { discountPercent, formatBRL } from "@/lib/money";

export function ProductDetail({ slug, product }: { slug: string; product: Produto }) {
  const router = useRouter();
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
  const unit = variantUnitPrice(product, selected?.id ?? null);
  const off = discountPercent(unit, product.preco_de_centavos);
  const out = needsChoice && (!selected || selected.estoque < 1);

  function add(buyNow: boolean) {
    if (needsChoice && !selected) return;
    addItem(slug, {
      productId: product.id,
      variantId: selected?.id ?? null,
      quantity: 1,
      name: product.nome,
      variantLabel: selected ? variantLabel(selected.cor, selected.tamanho) : null,
      imageUrl: product.produto_imagens[0]?.url ?? null,
      unitPriceCents: unit,
    });
    if (buyNow) router.push(`/s/${slug}/checkout`);
    else openCart(true);
  }

  return (
    <div className="mx-auto max-w-6xl px-4 pt-3 md:px-8 md:pt-6">
      <Link
        href={`/s/${slug}`}
        className="group inline-flex h-11 items-center gap-1 text-sm text-mute transition hover:text-paper"
      >
        <ChevronLeft size={18} className="transition-transform duration-300 group-hover:-translate-x-1" />
        Vitrine
        <span className="text-white/20">/</span>
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
                <span className="rounded-full bg-paper px-2 py-0.5 text-[11px] text-ink">−{off}%</span>
              </>
            ) : null}
          </p>

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
                        color === item ? "scale-110 border-ink ring-paper" : "border-transparent ring-white/20"
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
                      size === item ? "border-paper bg-paper text-ink" : "border-white/20 hover:border-white/60"
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

          <div className="mt-8 hidden gap-3 md:flex">
            <Button type="button" className="flex-1" disabled={out} onClick={() => add(false)}>
              {out ? "Sem estoque" : "Adicionar à sacola"}
            </Button>
            <Button type="button" variant="ghost" className="flex-1" disabled={out} onClick={() => add(true)}>
              Comprar agora
            </Button>
          </div>

          <section className="mt-8 border-t border-white/10 pt-6">
            <h2 className="text-[11px] uppercase tracking-[0.16em] text-mute">Descrição</h2>
            <p className="mt-3 text-sm leading-7 whitespace-pre-line md:text-base md:leading-8">{product.descricao}</p>
          </section>
        </div>
      </div>

      <div className="sticky bottom-[calc(4rem+env(safe-area-inset-bottom))] z-20 -mx-4 mt-8 flex gap-2 border-t border-white/10 bg-ink/85 px-4 py-3 backdrop-blur-xl md:hidden">
        <Button type="button" className="flex-1" disabled={out} onClick={() => add(false)}>
          {out ? "Sem estoque" : `Adicionar · ${formatBRL(unit)}`}
        </Button>
        <Button type="button" variant="ghost" disabled={out} onClick={() => add(true)}>
          Comprar
        </Button>
      </div>
    </div>
  );
}
