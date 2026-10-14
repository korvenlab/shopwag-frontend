import { wholesalePrice } from "@/features/catalog/stock";
import type { Atacado, Produto } from "@/features/domain/types";

export const MAX_LINE_QUANTITY = 999;

export type CartItem = {
  productId: string;
  variantId: string | null;
  quantity: number;
  name: string;
  variantLabel: string | null;
  imageUrl: string | null;
  unitPriceCents: number;
  tiers?: Atacado[];
};

/** Quantidade somada do produto (todas as variações), que define a faixa de atacado. */
function productQuantity(items: CartItem[], productId: string) {
  return items.reduce((sum, line) => (line.productId === productId ? sum + line.quantity : sum), 0);
}

export function effectiveUnitPrice(item: CartItem, items: CartItem[]) {
  if (!item.tiers?.length) return item.unitPriceCents;
  return wholesalePrice(item.tiers, productQuantity(items, item.productId), item.unitPriceCents);
}

export function lineTotal(item: CartItem, items: CartItem[] = [item]) {
  return effectiveUnitPrice(item, items) * item.quantity;
}

export function cartTotal(items: CartItem[]) {
  return items.reduce((sum, item) => sum + lineTotal(item, items), 0);
}

export function cartCount(items: CartItem[]) {
  return items.reduce((sum, item) => sum + item.quantity, 0);
}

export function activeVariants(product: Produto) {
  return product.produto_variacoes.filter((variant) => variant.ativo);
}

export function variantUnitPrice(product: Produto, variantId: string | null) {
  const variant = product.produto_variacoes.find((item) => item.id === variantId);
  return variant?.preco_centavos ?? product.preco_centavos;
}

export function variantLabel(cor: string | null, tamanho: string | null) {
  const parts = [cor, tamanho].filter(Boolean);
  return parts.length > 0 ? parts.join(" / ") : null;
}
