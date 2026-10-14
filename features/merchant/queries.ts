import { createClient } from "@/lib/supabase/server";
import { SchemaMissingError, isMissingSchema } from "@/lib/schema-error";
import { LOJA_SELECT, PRODUTO_SELECT, type Loja, type Pedido, type Produto } from "@/features/domain/types";

export async function getMerchant() {
  const supabase = await createClient();
  const { data, error } = await supabase.auth.getClaims();
  if (error || typeof data?.claims?.sub !== "string") return null;
  return { id: data.claims.sub };
}

export async function getOwnStore() {
  const merchant = await getMerchant();
  if (!merchant) return null;

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("lojas")
    .select(LOJA_SELECT)
    .eq("owner_id", merchant.id)
    .maybeSingle();

  if (error) {
    if (isMissingSchema(error)) throw new SchemaMissingError();
    throw new Error(error.message);
  }

  return data as Loja | null;
}

export async function listOwnProducts(lojaId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("produtos")
    .select(PRODUTO_SELECT)
    .eq("loja_id", lojaId)
    .order("criado_em", { ascending: false });

  if (error) throw new Error(error.message);

  return (data as Produto[]).map((product) => ({
    ...product,
    produto_imagens: [...product.produto_imagens].sort((a, b) => a.ordem - b.ordem),
  }));
}

export async function getOwnProduct(lojaId: string, productId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("produtos")
    .select(PRODUTO_SELECT)
    .eq("loja_id", lojaId)
    .eq("id", productId)
    .maybeSingle();

  if (error) throw new Error(error.message);
  if (!data) return null;

  const product = data as Produto;
  return {
    ...product,
    produto_imagens: [...product.produto_imagens].sort((a, b) => a.ordem - b.ordem),
  };
}

export async function listOrders(lojaId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("pedidos")
    .select(
      `
      id,
      status_pagamento,
      status_pedido,
      metodo_pagamento,
      subtotal_centavos,
      frete_centavos,
      total_centavos,
      taxa_plataforma_centavos,
      taxa_cliente_centavos,
      nome_completo,
      whatsapp,
      cep,
      rua,
      numero,
      complemento,
      bairro,
      cidade,
      estado,
      observacoes,
      criado_em,
      itens_pedido (
        id,
        nome_produto,
        variacao_label,
        quantidade,
        preco_unitario_centavos,
        total_item_centavos
      )
    `,
    )
    .eq("loja_id", lojaId)
    .order("criado_em", { ascending: false });

  if (error) {
    if (isMissingSchema(error)) throw new SchemaMissingError();
    throw new Error(error.message);
  }

  return data as Pedido[];
}
