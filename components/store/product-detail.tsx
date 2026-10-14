"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import { ImageCarousel } from "@/components/store/image-carousel";
import { Button } from "@/components/ui/button";
import { activeVariants, variantLabel, variantUnitPrice } from "@/features/cart/calc";
import { useCart } from "@/features/cart/store";
import type { Produto } from "@/features/domain/types";
import { discountPercent, formatBRL } from "@/lib/money";

export function ProductDetail({ slug, product }: { slug: string; product: Produto }) {
  const router = useRouter();
  const addItem = useCart((state) => state.addItem);
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
    (variant) => (variant.cor ?? null) === (colors.length ? color : null) && (variant.tamanho ?? null) === (sizes.length ? size : null),
  );
  const needsChoice = variants.length > 0;
  const unit = variantUnitPrice(product, selected?.id ?? null);
  const off = discountPercent(unit, product.preco_de_centavos);
  const out = needsChoice && (!selected || selected.estoque < 1);

  function add(goToCart: boolean) {
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
    if (goToCart) router.push(`/s/${slug}/sacola`);
  }

  return (
    <div>
      <div className="px-5 pt-4">
        <Link href={`/s/${slug}`} className="inline-flex h-11 items-center gap-1 text-sm text-mute">
          <ChevronLeft size={18} />
          Vitrine
        </Link>
        <ImageCarousel images={product.produto_imagens} name={product.nome} />
        <p className="mt-5 text-[11px] uppercase tracking-[0.18em] text-mute">{product.categoria}</p>
        <h1 className="mt-2 font-serif text-4xl leading-none">{product.nome}</h1>
        <p className="mt-3 flex items-baseline gap-3">
          <span className="font-serif text-3xl">{formatBRL(unit)}</span>
          {off ? (
            <>
              <span className="text-sm text-mute line-through">
                {formatBRL(product.preco_de_centavos ?? 0)}
              </span>
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
                    className={`h-11 w-11 rounded-full border ${color === item ? "border-paper" : "border-white/20"}`}
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
                  className={`h-11 min-w-11 rounded-full px-4 text-sm ${
                    size === item ? "bg-paper text-ink" : "border border-white/20"
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

        <section className="mt-8 border-t border-white/10 pt-6">
          <h2 className="text-[11px] uppercase tracking-[0.16em] text-mute">Descrição</h2>
          <p className="mt-3 text-sm leading-7 whitespace-pre-line">{product.descricao}</p>
        </section>
      </div>

      <div className="sticky bottom-[calc(4.5rem+env(safe-area-inset-bottom))] z-20 mt-8 border-t border-white/10 bg-ink/95 px-5 py-3 backdrop-blur">
        <Button type="button" className="w-full" disabled={out} onClick={() => add(true)}>
          {out ? "Sem estoque" : `Adicionar · ${formatBRL(unit)}`}
        </Button>
      </div>
    </div>
  );
}
