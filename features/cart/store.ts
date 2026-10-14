"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { MAX_LINE_QUANTITY, cartCount, cartTotal, type CartItem } from "@/features/cart/calc";

type CartState = {
  storeSlug: string | null;
  items: CartItem[];
  addItem: (slug: string, item: CartItem) => void;
  setQuantity: (productId: string, variantId: string | null, quantity: number) => void;
  removeItem: (productId: string, variantId: string | null) => void;
  clear: () => void;
};

function sameLine(item: CartItem, productId: string, variantId: string | null) {
  return item.productId === productId && item.variantId === variantId;
}

export const useCart = create<CartState>()(
  persist(
    (set) => ({
      storeSlug: null,
      items: [],
      addItem: (slug, item) =>
        set((state) => {
          const base = state.storeSlug === slug ? state.items : [];
          const existing = base.find((line) =>
            sameLine(line, item.productId, item.variantId),
          );
          const items = existing
            ? base.map((line) =>
                sameLine(line, item.productId, item.variantId)
                  ? { ...line, quantity: Math.min(MAX_LINE_QUANTITY, line.quantity + item.quantity) }
                  : line,
              )
            : [...base, item];
          return { storeSlug: slug, items };
        }),
      setQuantity: (productId, variantId, quantity) =>
        set((state) => ({
          items:
            quantity < 1
              ? state.items.filter((line) => !sameLine(line, productId, variantId))
              : state.items.map((line) =>
                  sameLine(line, productId, variantId)
                    ? { ...line, quantity: Math.min(MAX_LINE_QUANTITY, quantity) }
                    : line,
                ),
        })),
      removeItem: (productId, variantId) =>
        set((state) => ({
          items: state.items.filter((line) => !sameLine(line, productId, variantId)),
        })),
      clear: () => set({ storeSlug: null, items: [] }),
    }),
    { name: "shopwag-cart" },
  ),
);

export function useCartSummary(slug: string) {
  const storeSlug = useCart((state) => state.storeSlug);
  const items = useCart((state) => state.items);
  const current = storeSlug === slug ? items : [];
  return {
    items: current,
    total: cartTotal(current),
    count: cartCount(current),
  };
}
