import type { ProdutoImagem, ProdutoVariacao } from "@/features/domain/types";

const photo = (id: string) =>
  `https://images.unsplash.com/${id}?auto=format&fit=crop&w=1200&q=80`;

export type SampleProduct = {
  nome: string;
  slug: string;
  descricao: string;
  preco_centavos: number;
  preco_de_centavos: number | null;
  categoria: string;
  destaque: boolean;
  imagens: Array<Pick<ProdutoImagem, "url" | "alt">>;
  variacoes: Array<Pick<ProdutoVariacao, "cor" | "cor_hex" | "tamanho" | "estoque" | "preco_centavos">>;
};

export const sampleCatalog: SampleProduct[] = [
  {
    nome: "Relógio Leme",
    slug: "relogio-leme",
    descricao:
      "Caixa de 40 mm, pulseira em aço e vidro mineral. Um clássico de pulso para o dia e para a noite, com fecho regulável e mostrador limpo.",
    preco_centavos: 89000,
    preco_de_centavos: 112000,
    categoria: "Relógios",
    destaque: true,
    imagens: [
      { url: photo("photo-1523275335684-37898b6baf30"), alt: "Relógio de pulso sobre fundo claro" },
      { url: photo("photo-1524805444758-089113d48a6d"), alt: "Detalhe do mostrador" },
    ],
    variacoes: [
      { cor: "Prata", cor_hex: "#d7d7d7", tamanho: "Único", estoque: 6, preco_centavos: null },
      { cor: "Ouro", cor_hex: "#c6a15b", tamanho: "Único", estoque: 3, preco_centavos: 96000 },
    ],
  },
  {
    nome: "Bolsa Nuvem",
    slug: "bolsa-nuvem",
    descricao:
      "Couro macio, alça de ombro e forro em algodão. Cabe carteira, óculos e o essencial do dia sem perder o desenho compacto.",
    preco_centavos: 64000,
    preco_de_centavos: null,
    categoria: "Bolsas",
    destaque: true,
    imagens: [
      { url: photo("photo-1548036328-c9fa89d128fa"), alt: "Bolsa de couro" },
      { url: photo("photo-1590874103328-eac38a683ce7"), alt: "Bolsa aberta" },
    ],
    variacoes: [
      { cor: "Preto", cor_hex: "#161616", tamanho: null, estoque: 4, preco_centavos: null },
      { cor: "Caramelo", cor_hex: "#a56b3c", tamanho: null, estoque: 2, preco_centavos: null },
    ],
  },
  {
    nome: "Óculos Ata",
    slug: "oculos-ata",
    descricao:
      "Armação acetato e lentes com proteção UV. Leve no rosto, com hastes retas e um recorte que funciona do café ao fim de tarde.",
    preco_centavos: 42000,
    preco_de_centavos: 51000,
    categoria: "Óculos",
    destaque: false,
    imagens: [
      { url: photo("photo-1511499767150-a48a237f0083"), alt: "Óculos de sol" },
      { url: photo("photo-1572635196237-14b3f281503f"), alt: "Óculos sobre mesa" },
    ],
    variacoes: [
      { cor: "Tartaruga", cor_hex: "#6b4a32", tamanho: null, estoque: 8, preco_centavos: null },
      { cor: "Preto", cor_hex: "#111111", tamanho: null, estoque: 5, preco_centavos: null },
    ],
  },
  {
    nome: "Jaqueta Bruma",
    slug: "jaqueta-bruma",
    descricao:
      "Lã leve, corte reto e bolsos internos. Peça de meia-estação com forro liso e botões forrados. Entrega em cabide.",
    preco_centavos: 128000,
    preco_de_centavos: null,
    categoria: "Roupas",
    destaque: false,
    imagens: [
      { url: photo("photo-1591047139829-d91aecb6caea"), alt: "Jaqueta bege" },
      { url: photo("photo-1551028719-00167b16eac5"), alt: "Jaqueta de couro preta" },
    ],
    variacoes: [
      { cor: "Areia", cor_hex: "#d9c7a5", tamanho: "P", estoque: 2, preco_centavos: null },
      { cor: "Areia", cor_hex: "#d9c7a5", tamanho: "M", estoque: 3, preco_centavos: null },
      { cor: "Areia", cor_hex: "#d9c7a5", tamanho: "G", estoque: 2, preco_centavos: null },
      { cor: "Preto", cor_hex: "#111111", tamanho: "P", estoque: 1, preco_centavos: null },
      { cor: "Preto", cor_hex: "#111111", tamanho: "M", estoque: 4, preco_centavos: null },
      { cor: "Preto", cor_hex: "#111111", tamanho: "G", estoque: 2, preco_centavos: null },
    ],
  },
];
