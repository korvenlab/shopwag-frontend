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

export type LayoutModo = "padrao" | "compacto" | "editorial";
export type ProvaTipo = "selo" | "depoimento";
export type TemaVariante = "claro" | "escuro";

export const STORE_SECTION_LABELS: Record<StoreSectionId, string> = {
  destaques: "Destaques",
  categorias: "Categorias",
  times: "Times",
  mais_vendidos: "Mais vendidos",
  promocoes: "Promoções",
  catalogo: "Catálogo",
};

export const LAYOUT_MODOS: Array<{ id: LayoutModo; label: string; blurb: string }> = [
  { id: "padrao", label: "Padrão", blurb: "Grade equilibrada, títulos médios." },
  { id: "compacto", label: "Compacto", blurb: "Mais produtos por linha, ritmo rápido." },
  { id: "editorial", label: "Editorial", blurb: "Menos peças, tipografia maior e ar." },
];

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

export function asLayoutModo(value: string | null | undefined): LayoutModo {
  return value === "compacto" || value === "editorial" ? value : "padrao";
}

export function asProvaTipo(value: string | null | undefined): ProvaTipo {
  return value === "depoimento" ? "depoimento" : "selo";
}

export function asTemaVariante(value: string | null | undefined): TemaVariante {
  return value === "claro" ? "claro" : "escuro";
}

export function resolveCtaHref(link: string | null | undefined) {
  const raw = link?.trim();
  if (!raw) return null;
  if (raw.startsWith("#") || raw.startsWith("/") || /^https?:\/\//i.test(raw) || raw.startsWith("mailto:")) {
    return raw;
  }
  return `#${raw.replace(/^#/, "")}`;
}

export function catalogGridClass(modo: LayoutModo) {
  if (modo === "compacto") {
    return "grid grid-cols-2 gap-x-2 gap-y-5 sm:grid-cols-3 md:grid-cols-4 md:gap-x-3 lg:grid-cols-5";
  }
  if (modo === "editorial") {
    return "grid grid-cols-1 gap-x-6 gap-y-10 sm:grid-cols-2 md:gap-x-8 lg:grid-cols-2";
  }
  return "grid grid-cols-2 gap-x-3 gap-y-7 sm:grid-cols-3 md:gap-x-5 lg:grid-cols-4";
}

export function catalogRailCardClass(modo: LayoutModo) {
  if (modo === "compacto") {
    return "w-[42%] shrink-0 snap-start sm:w-[28%] lg:w-[calc(20%-12px)]";
  }
  if (modo === "editorial") {
    return "w-[78%] shrink-0 snap-start sm:w-[48%] lg:w-[calc(50%-16px)]";
  }
  return "w-[46%] shrink-0 snap-start sm:w-[32%] lg:w-[calc(25%-15px)]";
}

export function sectionTitleClass(modo: LayoutModo) {
  if (modo === "compacto") {
    return "reveal text-center text-base font-semibold tracking-[0.18em] uppercase md:text-lg";
  }
  if (modo === "editorial") {
    return "reveal text-center font-serif text-3xl font-normal tracking-normal normal-case md:text-5xl";
  }
  return "reveal text-center text-xl font-semibold tracking-[0.16em] uppercase md:text-2xl";
}

export type NicheTemplate = {
  id: string;
  label: string;
  blurb: string;
  headline: string;
  subtitulo: string;
  promo_texto: string;
  cta_texto: string;
  cta_link: string;
  layout_modo: LayoutModo;
  prova_tipo: ProvaTipo;
  prova_texto: string;
  prova_autor: string | null;
  claro: StoreTheme;
  escuro: StoreTheme;
  secoes: StoreSectionId[];
};

export const NICHE_TEMPLATES: NicheTemplate[] = [
  {
    id: "camisas",
    label: "Camisas",
    blurb: "Times em evidência e CTA direto para o catálogo.",
    headline: "Escolha seu manto",
    subtitulo: "Versão jogador e torcedor. Envie o link e feche no Pix.",
    promo_texto: "Pronta entrega com envio para todo o Brasil",
    cta_texto: "Ver camisas",
    cta_link: "#categorias",
    layout_modo: "padrao",
    prova_tipo: "selo",
    prova_texto: "+2.000 mantos enviados",
    prova_autor: null,
    claro: {
      cor_fundo: "#f3f4f6",
      cor_texto: "#111827",
      cor_destaque: "#0f766e",
      fonte_titulo: "marcante",
    },
    escuro: {
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
    blurb: "Clima editorial, tipografia clássica e prova social.",
    headline: "Peças com história",
    subtitulo: "Curadoria semanal. Achados únicos, preço justo.",
    promo_texto: "Novidades toda semana — garanta a sua",
    cta_texto: "Ver novidades",
    cta_link: "#destaques",
    layout_modo: "editorial",
    prova_tipo: "depoimento",
    prova_texto: "Achei uma peça única e o envio foi rápido.",
    prova_autor: "Marina, SP",
    claro: {
      cor_fundo: "#f4efe6",
      cor_texto: "#1f1b16",
      cor_destaque: "#1f1b16",
      fonte_titulo: "classica",
    },
    escuro: {
      cor_fundo: "#1c1814",
      cor_texto: "#f3ebe0",
      cor_destaque: "#e8d7bf",
      fonte_titulo: "classica",
    },
    secoes: ["destaques", "categorias", "promocoes", "mais_vendidos", "catalogo", "times"],
  },
  {
    id: "acessorios",
    label: "Acessórios",
    blurb: "Catálogo limpo, ouro no destaque e grade compacta.",
    headline: "Detalhes que fecham o look",
    subtitulo: "Bolsas, cintos e complementos para o dia a dia.",
    promo_texto: "Frete grátis acima de R$ 199",
    cta_texto: "Ver acessórios",
    cta_link: "#catalogo",
    layout_modo: "compacto",
    prova_tipo: "selo",
    prova_texto: "+500 pedidos este mês",
    prova_autor: null,
    claro: {
      cor_fundo: "#faf7f0",
      cor_texto: "#1c1915",
      cor_destaque: "#b8860b",
      fonte_titulo: "elegante",
    },
    escuro: {
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
    blurb: "Visual comercial com CTA forte e tom claro/rosa.",
    headline: "Nova coleção no ar",
    subtitulo: "Looks prontos para vestir. Compre no site e receba em casa.",
    promo_texto: "Lançamento com 10% na primeira compra",
    cta_texto: "Comprar agora",
    cta_link: "#promocoes",
    layout_modo: "padrao",
    prova_tipo: "selo",
    prova_texto: "Avaliação 4,9 · 800+ clientes",
    prova_autor: null,
    claro: {
      cor_fundo: "#fff4f5",
      cor_texto: "#3b1820",
      cor_destaque: "#e04f78",
      fonte_titulo: "moderna",
    },
    escuro: {
      cor_fundo: "#1a0f14",
      cor_texto: "#f8e9ee",
      cor_destaque: "#f07397",
      fonte_titulo: "moderna",
    },
    secoes: ["destaques", "promocoes", "categorias", "mais_vendidos", "catalogo", "times"],
  },
  {
    id: "esportes",
    label: "Esportes",
    blurb: "Energia alta, grade compacta e CTA para categorias.",
    headline: "Treine com o kit certo",
    subtitulo: "Performance e estilo para quem não para.",
    promo_texto: "Kit completo com desconto até sexta",
    cta_texto: "Explorar kits",
    cta_link: "#categorias",
    layout_modo: "compacto",
    prova_tipo: "selo",
    prova_texto: "+1.200 atletas atendidos",
    prova_autor: null,
    claro: {
      cor_fundo: "#eef6ff",
      cor_texto: "#0b1f33",
      cor_destaque: "#2563eb",
      fonte_titulo: "moderna",
    },
    escuro: {
      cor_fundo: "#07111d",
      cor_texto: "#e8f1ff",
      cor_destaque: "#3b82f6",
      fonte_titulo: "marcante",
    },
    secoes: ["destaques", "categorias", "mais_vendidos", "promocoes", "catalogo", "times"],
  },
  {
    id: "beleza",
    label: "Beleza",
    blurb: "Tom suave, editorial e depoimento em destaque.",
    headline: "Rotina que funciona",
    subtitulo: "Skincare e maquiagem com indicação clara.",
    promo_texto: "Brinde nas compras acima de R$ 149",
    cta_texto: "Ver rotinas",
    cta_link: "#destaques",
    layout_modo: "editorial",
    prova_tipo: "depoimento",
    prova_texto: "Minha pele mudou em duas semanas.",
    prova_autor: "Julia, RJ",
    claro: {
      cor_fundo: "#fbf5f7",
      cor_texto: "#3a2430",
      cor_destaque: "#c45b7a",
      fonte_titulo: "elegante",
    },
    escuro: {
      cor_fundo: "#160e12",
      cor_texto: "#f7eef2",
      cor_destaque: "#e08aa5",
      fonte_titulo: "elegante",
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
