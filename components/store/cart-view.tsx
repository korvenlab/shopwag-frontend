"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { lineTotal } from "@/features/cart/calc";
import { useCart, useCartSummary } from "@/features/cart/store";
import { formatBRL } from "@/lib/money";

export function CartView({ slug }: { slug: string }) {
  const { items, total } = useCartSummary(slug);
  const setQuantity = useCart((state) => state.setQuantity);
  const removeItem = useCart((state) => state.removeItem);

  if (items.length === 0) {
    return (
      <div className="px-5 pt-8">
        <h1 className="font-serif text-4xl">Sacola vazia</h1>
        <p className="mt-3 text-sm leading-6 text-mute">Escolha uma peça na vitrine para começar o pedido.</p>
        <Button asChild className="mt-6">
          <Link href={`/s/${slug}`}>Ver vitrine</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="px-5 pt-6">
      <h1 className="font-serif text-4xl">Sacola</h1>
      <ul className="mt-6 divide-y divide-white/10">
        {items.map((item) => (
          <li key={`${item.productId}-${item.variantId}`} className="flex gap-3 py-4">
            {item.imageUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={item.imageUrl} alt="" className="h-24 w-20 rounded-2xl object-cover" />
            ) : (
              <div className="h-24 w-20 rounded-2xl bg-panel" />
            )}
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm">{item.name}</p>
              {item.variantLabel ? <p className="mt-1 text-xs text-mute">{item.variantLabel}</p> : null}
              <p className="mt-2 font-serif text-lg">{formatBRL(lineTotal(item))}</p>
              <div className="mt-3 flex items-center gap-2">
                <button
                  type="button"
                  className="h-9 w-9 rounded-full border border-white/20"
                  onClick={() => setQuantity(item.productId, item.variantId, item.quantity - 1)}
                  aria-label="Diminuir"
                >
                  −
                </button>
                <span className="w-6 text-center text-sm">{item.quantity}</span>
                <button
                  type="button"
                  className="h-9 w-9 rounded-full border border-white/20"
                  onClick={() => setQuantity(item.productId, item.variantId, item.quantity + 1)}
                  aria-label="Aumentar"
                >
                  +
                </button>
                <button
                  type="button"
                  className="ml-auto text-xs text-mute underline underline-offset-4"
                  onClick={() => removeItem(item.productId, item.variantId)}
                >
                  Remover
                </button>
              </div>
            </div>
          </li>
        ))}
      </ul>
      <div className="mt-4 flex items-center justify-between border-t border-white/10 pt-4">
        <span className="text-sm text-mute">Total</span>
        <span className="font-serif text-2xl">{formatBRL(total)}</span>
      </div>
      <Button asChild className="mt-5 w-full">
        <Link href={`/s/${slug}/checkout`}>Fechar pedido</Link>
      </Button>
    </div>
  );
}
