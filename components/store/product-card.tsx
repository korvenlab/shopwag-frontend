"use client";

import Link from "next/link";
import { storeHref, useStoreBase } from "@/lib/store-path";
import { useRouter } from "next/navigation";
import { Plus } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { activeVariants } from "@/features/cart/calc";
import { useCartDrawer } from "@/features/cart/drawer";
import { useCart } from "@/features/cart/store";
import { isSoldOut, wholesaleTiers } from "@/features/catalog/stock";
import { discountPercent, formatBRL } from "@/lib/money";
import type { Produto } from "@/features/domain/types";

export function ProductCard({
  storeSlug,
  product,
  index = 0,
  className = "",
}: {
  storeSlug: string;
  product: Produto;
  index?: number;
  className?: string;
}) {
  const router = useRouter();
  const base = useStoreBase(storeSlug);
  const addItem = useCart((state) => state.addItem);
  const openCart = useCartDrawer((state) => state.setOpen);
  const [image, hover] = product.produto_imagens;
  const off = discountPercent(product.preco_centavos, product.preco_de_centavos);
  const href = storeHref(base, `/produto/${product.slug}`);
  const hasChoice = activeVariants(product).length > 0;
  const soldOut = isSoldOut(product);
  const tiers = wholesaleTiers(product);

  function buy(event: React.MouseEvent) {
    event.preventDefault();
    if (hasChoice) {
      router.push(href);
      return;
    }
    addItem(storeSlug, {
      productId: product.id,
      variantId: null,
      quantity: 1,
      name: product.nome,
      variantLabel: null,
      imageUrl: image?.url ?? null,
      unitPriceCents: product.preco_centavos,
      tiers: wholesaleTiers(product),
    });
    openCart(true);
  }

  return (
    <article className={`enter group relative ${className}`} style={{ "--i": index } as React.CSSProperties}>
      <Link href={href} className="block rounded-3xl outline-none">
        <div className="relative aspect-[3/4] overflow-hidden rounded-2xl bg-panel ring-1 ring-paper/10 transition-[box-shadow] duration-500 group-hover:ring-paper/40 group-has-[a:focus-visible]:ring-paper/60">
          {image ? (
            <>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={image.url}
                alt={image.alt || product.nome}
                loading="lazy"
                className={`h-full w-full object-cover transition duration-700 ease-out-expo group-hover:scale-[1.06] ${
                  hover ? "group-hover:opacity-0" : ""
                }`}
              />
              {hover ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={hover.url}
                  alt=""
                  loading="lazy"
                  className="absolute inset-0 h-full w-full scale-[1.06] object-cover opacity-0 transition duration-700 ease-out-expo group-hover:scale-100 group-hover:opacity-100"
                />
              ) : null}
            </>
          ) : (
            <div className="flex h-full items-end p-3 text-xs uppercase tracking-[0.16em] text-mute">Sem foto</div>
          )}
          <div className="pointer-events-none absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-black/50 to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
          {soldOut ? (
            <div className="absolute top-3 left-3">
              <Badge tone="line" className="bg-ink/75 backdrop-blur">
                Esgotado
              </Badge>
            </div>
          ) : off ? (
            <div className="absolute top-3 left-3">
              <Badge>−{off}%</Badge>
            </div>
          ) : null}
        </div>
        <h3 className="mt-3 line-clamp-2 text-[13px] leading-5 font-medium tracking-wide uppercase transition-colors group-hover:text-paper">{product.nome}</h3>
        <p className="mt-1 flex flex-wrap items-baseline gap-x-2">
          <span className="text-base font-semibold">{formatBRL(product.preco_centavos)}</span>
          {off ? (
            <span className="text-xs text-mute line-through">{formatBRL(product.preco_de_centavos ?? 0)}</span>
          ) : null}
        </p>
        {tiers.length ? (
          <p className="mt-0.5 text-[11px] text-mute">
            Atacado a partir de {tiers[0].min} un. · {formatBRL(tiers[0].preco)}
          </p>
        ) : null}
      </Link>
      <div className={`pointer-events-none absolute inset-x-0 top-0 aspect-[3/4] ${soldOut ? "hidden" : ""}`}>
        <button
          type="button"
          onClick={buy}
          aria-label={hasChoice ? `Escolher opções de ${product.nome}` : `Adicionar ${product.nome} à sacola`}
          className="pointer-events-auto absolute right-3 bottom-3 flex h-10 items-center gap-1.5 rounded-full bg-accent px-3 text-xs font-semibold text-on-accent shadow-lg transition duration-500 ease-out-expo active:scale-95 md:translate-y-3 md:opacity-0 md:group-hover:translate-y-0 md:group-hover:opacity-100 md:focus-visible:translate-y-0 md:focus-visible:opacity-100"
        >
          <Plus size={14} strokeWidth={2.5} />
          <span className="hidden sm:inline">Comprar</span>
        </button>
      </div>
    </article>
  );
}
