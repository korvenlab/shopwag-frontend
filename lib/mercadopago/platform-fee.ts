/** Percentual que fica com a Shopwag em cada pagamento Mercado Pago. */
export const PLATFORM_FEE_PERCENT = 1;

/**
 * Mesma conta do backend, só para exibir o valor antes do pagamento.
 * O valor cobrado de verdade é calculado no shopwag-backend.
 */
export function totalWithFeesCents(baseCents: number, pixFeePercent: number) {
  const base = Math.max(0, Math.round(baseCents));
  if (base <= 0) return 0;
  const denom = 1 - pixFeePercent / 100 - PLATFORM_FEE_PERCENT / 100;
  if (denom <= 0) return base;
  return Math.ceil(base / denom);
}
