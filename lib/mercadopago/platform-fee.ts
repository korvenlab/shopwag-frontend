/** Taxa de serviço da Shopwag, sempre paga pelo cliente. */
export const PLATFORM_FEE_PERCENT = 2;

/**
 * Mesma conta do backend, só para exibir o valor antes do pagamento.
 * O valor cobrado de verdade é calculado no shopwag-backend.
 */
export function chargeBreakdown(baseCents: number, paymentFeePercent: number | null) {
  const base = Math.max(0, Math.round(baseCents));
  const service = base > 0 ? Math.max(1, Math.round((base * PLATFORM_FEE_PERCENT) / 100)) : 0;
  const subtotal = base + service;
  if (paymentFeePercent == null || subtotal <= 0 || paymentFeePercent >= 100) {
    return { service, paymentFee: 0, total: subtotal };
  }
  const total = Math.ceil(subtotal / (1 - paymentFeePercent / 100));
  return { service, paymentFee: total - subtotal, total };
}
