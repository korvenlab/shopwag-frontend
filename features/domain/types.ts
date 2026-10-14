import type { FontKey, LogoShape } from "@/lib/theme";

export type Loja = {
  id: string;
  nome: string;
  slug: string;
  descricao: string;
  whatsapp: string | null;
  chave_pix: string | null;
  logo_url: string | null;
  capa_url: string | null;
  mp_status: "connected" | "needs_reconnect" | "revoked" | null;
  repassar_taxas: boolean;
  taxa_pix_percent: number;
  cor_fundo: string;
  cor_texto: string;
  cor_destaque: string;
  fonte_titulo: FontKey;
  logo_formato: LogoShape;
  logo_texto: string | null;
  mostrar_nome: boolean;
  aviso_topo: string | null;
  favicon_url: string | null;
  banners: Banner[];
  email_contato: string | null;
  site_url: string | null;
  instagram: string | null;
  facebook: string | null;
  tiktok: string | null;
  youtube: string | null;
  endereco_loja: string | null;
  documento: string | null;
  politica_troca: string | null;
  politica_privacidade: string | null;
  termos_uso: string | null;
  horario_ativo: boolean;
  horarios: Horarios;
  pedidos_fora_horario: boolean;
  fechada: boolean;
  mensagem_fechada: string | null;
  esconder_esgotados: boolean;
  entrega_ativa: boolean;
  frete_padrao_centavos: number | null;
  frete_gratis_acima_centavos: number | null;
  prazo_padrao: string | null;
  retirada_ativa: boolean;
  retirada_endereco: string | null;
  seo_titulo: string | null;
  seo_descricao: string | null;
  seo_indexar: boolean;
  dominio: string | null;
};

export type Banner = { url: string; link?: string | null };

/** Chave = dia da semana (0 = domingo). Dia ausente = fechado. */
export type Horarios = Partial<Record<"0" | "1" | "2" | "3" | "4" | "5" | "6", { abre: string; fecha: string }>>;

export type FaixaFrete = {
  id: string;
  loja_id: string;
  nome: string;
  cep_inicio: string;
  cep_fim: string;
  valor_centavos: number;
  prazo: string | null;
};

export type Atacado = { min: number; preco: number };

export type Interessado = {
  id: string;
  produto_id: string;
  nome: string;
  whatsapp: string;
  criado_em: string;
  avisado_em: string | null;
  produtos: { nome: string; slug: string } | null;
};

export const LOJA_SELECT = [
  "id, nome, slug, descricao, whatsapp, chave_pix, logo_url, capa_url, mp_status, repassar_taxas, taxa_pix_percent",
  "cor_fundo, cor_texto, cor_destaque, fonte_titulo, logo_formato, logo_texto, mostrar_nome",
  "aviso_topo, favicon_url, banners, email_contato, site_url, instagram, facebook, tiktok, youtube",
  "endereco_loja, documento, politica_troca, politica_privacidade, termos_uso",
  "horario_ativo, horarios, pedidos_fora_horario, fechada, mensagem_fechada, esconder_esgotados",
  "entrega_ativa, frete_padrao_centavos, frete_gratis_acima_centavos, prazo_padrao, retirada_ativa, retirada_endereco",
  "seo_titulo, seo_descricao, seo_indexar, dominio",
].join(", ");

export type ProdutoImagem = {
  id: string;
  url: string;
  alt: string;
  ordem: number;
};

export type ProdutoVariacao = {
  id: string;
  cor: string | null;
  cor_hex: string | null;
  tamanho: string | null;
  sku: string | null;
  estoque: number;
  preco_centavos: number | null;
  ativo: boolean;
};

export type Produto = {
  id: string;
  loja_id: string;
  nome: string;
  slug: string;
  descricao: string;
  preco_centavos: number;
  preco_de_centavos: number | null;
  categoria: string;
  ativo: boolean;
  destaque: boolean;
  atacado: Atacado[];
  produto_imagens: ProdutoImagem[];
  produto_variacoes: ProdutoVariacao[];
};

export type ItemPedido = {
  id: string;
  nome_produto: string;
  variacao_label: string | null;
  quantidade: number;
  preco_unitario_centavos: number;
  total_item_centavos: number;
};

export type Pedido = {
  id: string;
  status_pagamento: "pending" | "paid" | "failed" | "refunded";
  status_pedido: "new" | "preparing" | "shipped" | "delivered" | "cancelled";
  metodo_pagamento: string;
  subtotal_centavos: number;
  frete_centavos: number;
  total_centavos: number;
  taxa_plataforma_centavos: number;
  taxa_cliente_centavos: number;
  nome_completo: string;
  whatsapp: string;
  cep: string;
  rua: string;
  numero: string;
  complemento: string;
  bairro: string;
  cidade: string;
  estado: string;
  observacoes: string;
  criado_em: string;
  tipo_entrega: "entrega" | "retirada";
  itens_pedido: ItemPedido[];
};

export type Recibo = {
  id: string;
  status_pagamento: Pedido["status_pagamento"];
  status_pedido: Pedido["status_pedido"];
  metodo_pagamento: string;
  tipo_entrega: "entrega" | "retirada";
  subtotal_centavos: number;
  frete_centavos: number;
  total_centavos: number;
  taxa_plataforma_centavos: number;
  taxa_cliente_centavos: number;
  nome_completo: string;
  whatsapp: string;
  observacoes: string;
  criado_em: string;
  pix_copia_cola: string | null;
  pix_qr_base64: string | null;
  endereco: {
    cep: string;
    rua: string;
    numero: string;
    complemento: string;
    bairro: string;
    cidade: string;
    estado: string;
  };
  loja: {
    nome: string;
    slug: string;
    whatsapp: string | null;
    mp_status: Loja["mp_status"];
    repassar_taxas: boolean;
    retirada_endereco: string | null;
  };
  itens: Array<{
    nome_produto: string;
    variacao_label: string | null;
    quantidade: number;
    preco_unitario_centavos: number;
    total_item_centavos: number;
  }>;
};

export const PRODUTO_SELECT = `
  id,
  loja_id,
  nome,
  slug,
  descricao,
  preco_centavos,
  preco_de_centavos,
  categoria,
  ativo,
  destaque,
  atacado,
  produto_imagens (id, url, alt, ordem),
  produto_variacoes (id, cor, cor_hex, tamanho, sku, estoque, preco_centavos, ativo)
`;
