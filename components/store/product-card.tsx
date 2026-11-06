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
import type { Loja, Produto } from "@/features/domain/types";
import { asBadgeModo, asCardLayout } from "@/lib/storefront";
import { cn } from "@/lib/cn";

const NEW_DAYS = 21;
const LOW_STOCK = 3;

export type ProductCardLook = Pick<Loja, "card_layout" | "card_hover" | "badge_modo">;

export function ProductCard({
  storeSlug,
  product,
  index = 0,
  className = "",
  look,
}: {
  storeSlug: string;
  product: Produto;
  index?: number;
  className?: string;
  look?: Partial<ProductCardLook> | null;
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
  const layout = asCardLayout(look?.card_layout);
  const hoverOn = look?.card_hover !== false;
  const badge = resolveBadge(product, asBadgeModo(look?.badge_modo), soldOut, off);

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
    <article
      className={cn("enter group relative", className)}
      style={{ "--i": index } as React.CSSProperties}
      data-card={layout}
    >
      <Link href={href} className="block rounded-3xl outline-none">
        <div
          className={cn(
            "relative overflow-hidden rounded-2xl bg-panel ring-1 ring-paper/10 transition-[box-shadow] duration-500 group-has-[a:focus-visible]:ring-paper/60",
            layout === "editorial" ? "aspect-[4/5]" : layout === "compacto" ? "aspect-[4/5]" : "aspect-[3/4]",
            hoverOn ? "group-hover:ring-paper/40" : "",
          )}
        >
          {image ? (
            <>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={image.url}
                alt={image.alt || product.nome}
                loading="lazy"
                className={cn(
                  "h-full w-full object-cover transition duration-700 ease-out-expo",
                  hoverOn ? "group-hover:scale-[1.06]" : "",
                  hoverOn && hover ? "group-hover:opacity-0" : "",
                )}
              />
              {hoverOn && hover ? (
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
          {hoverOn ? (
            <div className="pointer-events-none absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-black/50 to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
          ) : null}
          {badge ? (
            <div className="absolute top-3 left-3">
              <Badge tone={badge.tone} className={badge.tone === "line" ? "bg-ink/75 backdrop-blur" : undefined}>
                {badge.text}
              </Badge>
            </div>
          ) : null}
        </div>
        <h3
          className={cn(
            "mt-3 line-clamp-2 transition-colors group-hover:text-paper",
            layout === "editorial"
              ? "font-serif text-lg leading-snug md:text-xl"
              : layout === "compacto"
                ? "text-[12px] leading-4 font-medium tracking-wide uppercase"
                : "text-[13px] leading-5 font-medium tracking-wide uppercase",
          )}
        >
          {product.nome}
        </h3>
        <p className={cn("mt-1 flex flex-wrap items-baseline gap-x-2", layout === "editorial" ? "mt-2" : "")}>
          <span className={layout === "editorial" ? "font-serif text-xl" : "text-base font-semibold"}>
            {formatBRL(product.preco_centavos)}
          </span>
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
      <div
        className={cn(
          "pointer-events-none absolute inset-x-0 top-0",
          layout === "editorial" || layout === "compacto" ? "aspect-[4/5]" : "aspect-[3/4]",
          soldOut ? "hidden" : "",
        )}
      >
        <button
          type="button"
          onClick={buy}
          aria-label={hasChoice ? `Escolher opções de ${product.nome}` : `Adicionar ${product.nome} à sacola`}
          className={cn(
            "pointer-events-auto absolute right-3 bottom-3 flex h-10 items-center gap-1.5 rounded-full bg-accent px-3 text-xs font-semibold text-on-accent shadow-lg transition duration-500 ease-out-expo active:scale-95",
            hoverOn
              ? "md:translate-y-3 md:opacity-0 md:group-hover:translate-y-0 md:group-hover:opacity-100 md:focus-visible:translate-y-0 md:focus-visible:opacity-100"
              : "",
          )}
        >
          <Plus size={14} strokeWidth={2.5} />
          <span className="hidden sm:inline">Comprar</span>
        </button>
      </div>
    </article>
  );
}

function resolveBadge(
  product: Produto,
  modo: ReturnType<typeof asBadgeModo>,
  soldOut: boolean,
  off: number | null,
): { text: string; tone?: "line" } | null {
  if (soldOut) return { text: "Esgotado", tone: "line" };
  if (modo === "off") return null;
  if (modo === "novo" && isNewProduct(product)) return { text: "Novo" };
  if (modo === "ultimas" && isLowStock(product)) return { text: "Últimas unidades" };
  if (off) return { text: `−${off}%` };
  if (modo === "novo") return null;
  if (modo === "ultimas") return null;
  return null;
}

function isNewProduct(product: Produto) {
  if (!product.criado_em) return Boolean(product.destaque);
  const created = new Date(product.criado_em).getTime();
  if (Number.isNaN(created)) return Boolean(product.destaque);
  return Date.now() - created < NEW_DAYS * 24 * 60 * 60 * 1000;
}

function isLowStock(product: Produto) {
  const variants = activeVariants(product);
  if (variants.length === 0) return false;
  const total = variants.reduce((sum, variant) => sum + Math.max(0, variant.estoque), 0);
  return total > 0 && total <= LOW_STOCK;
}
