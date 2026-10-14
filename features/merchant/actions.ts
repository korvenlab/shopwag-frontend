"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

const payments = new Set(["pending", "paid", "failed", "refunded"]);
const fulfillments = new Set(["new", "preparing", "shipped", "delivered", "cancelled"]);

export async function updateOrderStatus(
  pedidoId: string,
  statusPagamento: string,
  statusPedido: string,
) {
  if (!payments.has(statusPagamento) || !fulfillments.has(statusPedido)) {
    throw new Error("Status inválido");
  }

  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();
  if (!data?.claims) throw new Error("Não autenticado");

  const { error } = await supabase.rpc("update_order_status", {
    p_pedido_id: pedidoId,
    p_status_pagamento: statusPagamento,
    p_status_pedido: statusPedido,
  });

  if (error) throw new Error(error.message);

  revalidatePath("/dashboard");
  revalidatePath(`/dashboard/pedidos/${pedidoId}`);
}
