import type { Atacado, Produto } from "@/features/domain/types";

/** Só produtos com variações controlam estoque; sem variações, nunca esgota. */
export function isSoldOut(product: Produto) {
  const variants = product.produto_variacoes.filter((variant) => variant.ativo);
  return variants.length > 0 && variants.every((variant) => variant.estoque <= 0);
}

export function wholesaleTiers(product: Pick<Produto, "atacado">): Atacado[] {
  return (Array.isArray(product.atacado) ? product.atacado : [])
    .filter((tier) => Number.isInteger(tier?.min) && Number.isInteger(tier?.preco) && tier.min > 1 && tier.preco >= 0)
    .sort((a, b) => a.min - b.min);
}

export function wholesalePrice(tiers: Atacado[], quantity: number, unitCents: number) {
  let best = unitCents;
  for (const tier of tiers) if (quantity >= tier.min && tier.preco < best) best = tier.preco;
  return best;
}
