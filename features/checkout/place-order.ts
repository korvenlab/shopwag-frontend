import { friendlyError } from "@/lib/friendly-error";
import { createClient } from "@/lib/supabase/client";
import type { CartItem } from "@/features/cart/calc";
import type { CheckoutInput, DeliveryType } from "@/features/checkout/schema";

export type PlaceOrderResult = {
  pedido_id: string;
  token: string;
  total_centavos: number;
  status_pagamento: string;
};

export type ShippingQuote =
  | { disponivel: true; valor_centavos: number; prazo: string | null; nome: string }
  | { disponivel: false; motivo: string };

export async function quoteShipping(slug: string, cep: string, subtotal: number): Promise<ShippingQuote> {
  const { data, error } = await createClient().rpc("calcular_frete", {
    p_loja_slug: slug,
    p_cep: cep,
    p_subtotal: subtotal,
  });
  if (error || !data) return { disponivel: false, motivo: "Não conseguimos calcular o frete agora. Tente de novo." };
  return data as ShippingQuote;
}

export async function placeOrder(slug: string, input: CheckoutInput, items: CartItem[], type: DeliveryType) {
  const supabase = createClient();
  const { data, error } = await supabase.rpc("place_order", {
    p_loja_slug: slug,
    p_nome: input.nome,
    p_whatsapp: input.whatsapp,
    p_cep: input.cep,
    p_rua: input.rua,
    p_numero: input.numero,
    p_complemento: input.complemento,
    p_bairro: input.bairro,
    p_cidade: input.cidade,
    p_estado: input.estado.toUpperCase(),
    p_observacoes: input.observacoes,
    p_itens: items.map((item) => ({
      product_id: item.productId,
      variant_id: item.variantId,
      quantity: item.quantity,
    })),
    p_tipo_entrega: type,
  });

  if (error) throw new Error(friendlyError(error, "Não foi possível fechar o pedido. Tente de novo."));
  return data as PlaceOrderResult;
}
