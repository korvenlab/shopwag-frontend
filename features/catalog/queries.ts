import { createPublicClient } from "@/lib/supabase/public";
import { SchemaMissingError, isMissingSchema } from "@/lib/schema-error";
import { PRODUTO_SELECT, type Loja, type Produto, type Recibo } from "@/features/domain/types";

function sortProduct(product: Produto): Produto {
  return {
    ...product,
    produto_imagens: [...product.produto_imagens].sort((a, b) => a.ordem - b.ordem),
    produto_variacoes: product.produto_variacoes.filter((variant) => variant.ativo),
  };
}

export async function getStoreBySlug(slug: string) {
  const supabase = createPublicClient();
  const { data, error } = await supabase
    .from("lojas")
    .select("id, nome, slug, descricao, whatsapp, chave_pix, logo_url, capa_url, mp_status, repassar_taxas, taxa_pix_percent")
    .eq("slug", slug)
    .maybeSingle();

  if (error) {
    if (isMissingSchema(error)) throw new SchemaMissingError();
    throw new Error(error.message);
  }

  return data as Loja | null;
}

export async function listPublicProducts(lojaId: string) {
  const supabase = createPublicClient();
  const { data, error } = await supabase
    .from("produtos")
    .select(PRODUTO_SELECT)
    .eq("loja_id", lojaId)
    .eq("ativo", true)
    .order("destaque", { ascending: false })
    .order("criado_em", { ascending: false });

  if (error) {
    if (isMissingSchema(error)) throw new SchemaMissingError();
    throw new Error(error.message);
  }

  return (data as Produto[]).map(sortProduct);
}

export async function getPublicProduct(lojaId: string, productSlug: string) {
  const supabase = createPublicClient();
  const { data, error } = await supabase
    .from("produtos")
    .select(PRODUTO_SELECT)
    .eq("loja_id", lojaId)
    .eq("slug", productSlug)
    .eq("ativo", true)
    .maybeSingle();

  if (error) {
    if (isMissingSchema(error)) throw new SchemaMissingError();
    throw new Error(error.message);
  }

  return data ? sortProduct(data as Produto) : null;
}

export async function getReceipt(orderId: string, token: string) {
  const supabase = createPublicClient();
  const { data, error } = await supabase.rpc("get_order_receipt", {
    p_pedido_id: orderId,
    p_token: token,
  });

  if (error) {
    if (isMissingSchema(error)) throw new SchemaMissingError();
    throw new Error(error.message);
  }

  return (data as Recibo | null) ?? null;
}
