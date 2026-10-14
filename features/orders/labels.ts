import type { Pedido } from "@/features/domain/types";

export const paymentLabel: Record<Pedido["status_pagamento"], string> = {
  pending: "Aguardando pagamento",
  paid: "Pago",
  failed: "Falhou",
  refunded: "Estornado",
};

export const fulfillmentLabel: Record<Pedido["status_pedido"], string> = {
  new: "Novo",
  preparing: "Em preparo",
  shipped: "Enviado",
  delivered: "Entregue",
  cancelled: "Cancelado",
};

export function formatAddress(order: {
  rua: string;
  numero: string;
  complemento: string;
  bairro: string;
  cidade: string;
  estado: string;
  cep: string;
}) {
  const line = [order.rua, order.numero].filter(Boolean).join(", ");
  const extra = order.complemento ? ` — ${order.complemento}` : "";
  return `${line}${extra}, ${order.bairro}, ${order.cidade}/${order.estado}, ${order.cep}`;
}
