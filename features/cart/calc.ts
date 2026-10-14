import type { Produto } from "@/features/domain/types";

export type CartItem = {
  productId: string;
  variantId: string | null;
  quantity: number;
  name: string;
  variantLabel: string | null;
  imageUrl: string | null;
  unitPriceCents: number;
};

export function lineTotal(item: CartItem) {
  return item.unitPriceCents * item.quantity;
}

export function cartTotal(items: CartItem[]) {
  return items.reduce((sum, item) => sum + lineTotal(item), 0);
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
