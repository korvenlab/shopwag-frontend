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
};

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
  itens_pedido: ItemPedido[];
};

export type Recibo = {
  id: string;
  status_pagamento: Pedido["status_pagamento"];
  status_pedido: Pedido["status_pedido"];
  metodo_pagamento: string;
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
  produto_imagens (id, url, alt, ordem),
  produto_variacoes (id, cor, cor_hex, tamanho, sku, estoque, preco_centavos, ativo)
`;
