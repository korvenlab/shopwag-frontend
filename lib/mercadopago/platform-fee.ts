/** Taxa de serviço da Shopwag, sempre paga pelo cliente. */
export const PLATFORM_FEE_PERCENT = 2;

/**
 * Mesma conta do backend, só para exibir o valor antes do pagamento.
 * O valor cobrado de verdade é calculado no shopwag-backend.
 */
export function chargeBreakdown(baseCents: number, cardFeePercent: number | null) {
  const base = Math.max(0, Math.round(baseCents));
  const service = base > 0 ? Math.max(1, Math.round((base * PLATFORM_FEE_PERCENT) / 100)) : 0;
  const subtotal = base + service;
  if (cardFeePercent == null || subtotal <= 0 || cardFeePercent >= 100) return { service, cardFee: 0, total: subtotal };
  const total = Math.ceil(subtotal / (1 - cardFeePercent / 100));
  return { service, cardFee: total - subtotal, total };
}
