import type { FontKey, StoreTheme } from "@/lib/theme";

export const STORE_SECTION_IDS = [
  "destaques",
  "categorias",
  "times",
  "mais_vendidos",
  "promocoes",
  "catalogo",
] as const;

export type StoreSectionId = (typeof STORE_SECTION_IDS)[number];

export type StoreSection = {
  id: StoreSectionId;
  on: boolean;
};

export const STORE_SECTION_LABELS: Record<StoreSectionId, string> = {
  destaques: "Destaques",
  categorias: "Categorias",
  times: "Times",
  mais_vendidos: "Mais vendidos",
  promocoes: "Promoções",
  catalogo: "Catálogo",
};

const DEFAULT_ORDER: StoreSectionId[] = [
  "destaques",
  "categorias",
  "times",
  "mais_vendidos",
  "promocoes",
  "catalogo",
];

export function defaultStoreSections(order: StoreSectionId[] = DEFAULT_ORDER): StoreSection[] {
  return order.map((id) => ({ id, on: true }));
}

export function normalizeStoreSections(value: unknown): StoreSection[] {
  if (!Array.isArray(value) || value.length === 0) return defaultStoreSections();
  const seen = new Set<StoreSectionId>();
  const parsed: StoreSection[] = [];
  for (const item of value) {
    if (!item || typeof item !== "object") continue;
    const id = (item as { id?: unknown }).id;
    if (typeof id !== "string" || !STORE_SECTION_IDS.includes(id as StoreSectionId)) continue;
    const sectionId = id as StoreSectionId;
    if (seen.has(sectionId)) continue;
    seen.add(sectionId);
    parsed.push({ id: sectionId, on: (item as { on?: unknown }).on !== false });
  }
  for (const id of DEFAULT_ORDER) {
    if (!seen.has(id)) parsed.push({ id, on: true });
  }
  return parsed;
}

export type NicheTemplate = {
  id: string;
  label: string;
  blurb: string;
  headline: string;
  subtitulo: string;
  promo_texto: string;
  theme: StoreTheme;
  secoes: StoreSectionId[];
};

export const NICHE_TEMPLATES: NicheTemplate[] = [
  {
    id: "camisas",
    label: "Camisas",
    blurb: "Times em evidência, visual escuro e títulos marcantes.",
    headline: "Escolha seu manto",
    subtitulo: "Versão jogador e torcedor. Envie o link e feche no Pix.",
    promo_texto: "Pronta entrega com envio para todo o Brasil",
    theme: {
      cor_fundo: "#050505",
      cor_texto: "#f4f1ea",
      cor_destaque: "#f4f1ea",
      fonte_titulo: "marcante",
    },
    secoes: ["destaques", "times", "categorias", "mais_vendidos", "promocoes", "catalogo"],
  },
  {
    id: "brecho",
    label: "Brechó",
    blurb: "Clima areia, tipografia clássica e foco em novidades.",
    headline: "Peças com história",
    subtitulo: "Curadoria semanal. Achados únicos, preço justo.",
    promo_texto: "Novidades toda semana — garanta a sua",
    theme: {
      cor_fundo: "#f4efe6",
      cor_texto: "#1f1b16",
      cor_destaque: "#1f1b16",
      fonte_titulo: "classica",
    },
    secoes: ["destaques", "categorias", "promocoes", "mais_vendidos", "catalogo", "times"],
  },
  {
    id: "acessorios",
    label: "Acessórios",
    blurb: "Fundo escuro com ouro, catálogo limpo e direto.",
    headline: "Detalhes que fecham o look",
    subtitulo: "Bolsas, cintos e complementos para o dia a dia.",
    promo_texto: "Frete grátis acima de R$ 199",
    theme: {
      cor_fundo: "#0c0b09",
      cor_texto: "#f3ecdc",
      cor_destaque: "#d4af37",
      fonte_titulo: "elegante",
    },
    secoes: ["destaques", "categorias", "promocoes", "catalogo", "mais_vendidos", "times"],
  },
  {
    id: "moda",
    label: "Moda",
    blurb: "Visual claro, tipografia moderna e seções comerciais.",
    headline: "Nova coleção no ar",
    subtitulo: "Looks prontos para vestir. Compre no site e receba em casa.",
    promo_texto: "Lançamento com 10% na primeira compra",
    theme: {
      cor_fundo: "#fff4f5",
      cor_texto: "#3b1820",
      cor_destaque: "#e04f78",
      fonte_titulo: "moderna",
    },
    secoes: ["destaques", "promocoes", "categorias", "mais_vendidos", "catalogo", "times"],
  },
];

export function nicheById(id: string | null | undefined) {
  return NICHE_TEMPLATES.find((item) => item.id === id) ?? null;
}

export function promoIsActive(promoTexto: string | null | undefined, promoAte: string | null | undefined, now = new Date()) {
  const text = promoTexto?.trim();
  if (!text) return false;
  if (!promoAte) return true;
  const until = new Date(promoAte);
  if (Number.isNaN(until.getTime())) return true;
  return until.getTime() > now.getTime();
}

export function formatPromoDeadline(promoAte: string | null | undefined) {
  if (!promoAte) return null;
  const until = new Date(promoAte);
  if (Number.isNaN(until.getTime())) return null;
  return until.toLocaleDateString("pt-BR", { day: "2-digit", month: "short" });
}

export function asFontKey(value: string | null | undefined): FontKey {
  return value === "moderna" || value === "classica" || value === "marcante" || value === "elegante"
    ? value
    : "elegante";
}
