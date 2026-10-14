"use server";

import { revalidatePath } from "next/cache";
import { friendlyError } from "@/lib/friendly-error";
import { createClient } from "@/lib/supabase/server";

const payments = new Set(["pending", "paid", "failed", "refunded"]);
const fulfillments = new Set(["new", "preparing", "shipped", "delivered", "cancelled"]);

export async function updateOrderStatus(
  pedidoId: string,
  statusPagamento: string,
  statusPedido: string,
): Promise<{ error: string | null }> {
  if (!payments.has(statusPagamento) || !fulfillments.has(statusPedido)) {
    return { error: "Escolha uma situação válida para o pedido." };
  }

  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();
  if (!data?.claims) return { error: "Sua sessão terminou. Entre de novo para continuar." };

  const { error } = await supabase.rpc("update_order_status", {
    p_pedido_id: pedidoId,
    p_status_pagamento: statusPagamento,
    p_status_pedido: statusPedido,
  });

  if (error) return { error: friendlyError(error, "Não foi possível atualizar o pedido. Tente de novo.") };

  revalidatePath("/dashboard");
  revalidatePath(`/dashboard/pedidos/${pedidoId}`);
  return { error: null };
}
