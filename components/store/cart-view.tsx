"use client";

import Link from "next/link";
import { Minus, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { effectiveUnitPrice, lineTotal } from "@/features/cart/calc";
import { useCart, useCartSummary } from "@/features/cart/store";
import { formatBRL } from "@/lib/money";

export function CartLines({ slug }: { slug: string }) {
  const { items } = useCartSummary(slug);
  const setQuantity = useCart((state) => state.setQuantity);
  const removeItem = useCart((state) => state.removeItem);

  return (
    <ul className="divide-y divide-paper/10">
      {items.map((item, index) => (
        <li
          key={`${item.productId}-${item.variantId}`}
          className="enter flex gap-3 py-4"
          style={{ "--i": index } as React.CSSProperties}
        >
          {item.imageUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={item.imageUrl} alt="" className="h-24 w-20 shrink-0 rounded-2xl object-cover" />
          ) : (
            <div className="h-24 w-20 shrink-0 rounded-2xl bg-panel" />
          )}
          <div className="min-w-0 flex-1">
            <div className="flex items-start gap-2">
              <p className="min-w-0 flex-1 truncate text-sm">{item.name}</p>
              <button
                type="button"
                aria-label="Remover"
                className="grid h-8 w-8 shrink-0 place-items-center rounded-full text-mute transition hover:bg-paper/10 hover:text-paper"
                onClick={() => removeItem(item.productId, item.variantId)}
              >
                <Trash2 size={15} />
              </button>
            </div>
            {item.variantLabel ? <p className="text-xs text-mute">{item.variantLabel}</p> : null}
            <div className="mt-3 flex items-center justify-between">
              <div className="flex items-center rounded-full border border-paper/15">
                <button
                  type="button"
                  className="grid h-9 w-9 place-items-center rounded-full transition hover:bg-paper/10 active:scale-90"
                  onClick={() => setQuantity(item.productId, item.variantId, item.quantity - 1)}
                  aria-label="Diminuir"
                >
                  <Minus size={14} />
                </button>
                <span key={item.quantity} className="bump w-6 text-center text-sm">
                  {item.quantity}
                </span>
                <button
                  type="button"
                  className="grid h-9 w-9 place-items-center rounded-full transition hover:bg-paper/10 active:scale-90"
                  onClick={() => setQuantity(item.productId, item.variantId, item.quantity + 1)}
                  aria-label="Aumentar"
                >
                  <Plus size={14} />
                </button>
              </div>
              <p className="font-serif text-lg">{formatBRL(lineTotal(item, items))}</p>
            </div>
            {effectiveUnitPrice(item, items) < item.unitPriceCents ? (
              <p className="mt-1 text-right text-[11px] text-accent">
                Preço de atacado · {formatBRL(effectiveUnitPrice(item, items))} cada
              </p>
            ) : null}
          </div>
        </li>
      ))}
    </ul>
  );
}

export function CartView({ slug }: { slug: string }) {
  const { items, total } = useCartSummary(slug);

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-xl px-5 pt-10 text-center md:pt-16">
        <h1 className="font-serif text-4xl">Sacola vazia</h1>
        <p className="mt-3 text-sm leading-6 text-mute">Escolha uma peça na vitrine para começar o pedido.</p>
        <Button asChild className="mt-6">
          <Link href={`/s/${slug}`}>Ver vitrine</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-xl px-5 pt-6 md:pt-10">
      <h1 className="font-serif text-4xl">Sacola</h1>
      <div className="mt-4">
        <CartLines slug={slug} />
      </div>
      <div className="mt-2 flex items-center justify-between border-t border-paper/10 pt-4">
        <span className="text-sm text-mute">Total</span>
        <span className="font-serif text-2xl">{formatBRL(total)}</span>
      </div>
      <Button asChild className="mt-5 w-full">
        <Link href={`/s/${slug}/checkout`}>Fechar pedido</Link>
      </Button>
    </div>
  );
}
