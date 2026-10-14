import type { CSSProperties } from "react";

export const FONTS = {
  elegante: { label: "Elegante", family: "var(--font-serif)", weight: 400, tracking: "normal" },
  moderna: { label: "Moderna", family: "var(--font-geist-sans)", weight: 600, tracking: "-0.03em" },
  classica: { label: "Clássica", family: "var(--font-classic)", weight: 500, tracking: "-0.01em" },
  marcante: { label: "Marcante", family: "var(--font-bold)", weight: 700, tracking: "-0.04em" },
} as const;

export type FontKey = keyof typeof FONTS;
export type LogoShape = "circulo" | "arredondado" | "quadrado";

export type StoreTheme = {
  cor_fundo: string;
  cor_texto: string;
  cor_destaque: string;
  fonte_titulo: FontKey;
};

export const DEFAULT_THEME: StoreTheme = {
  cor_fundo: "#050505",
  cor_texto: "#f4f1ea",
  cor_destaque: "#f4f1ea",
  fonte_titulo: "elegante",
};

export const PRESETS: Array<{ name: string } & Omit<StoreTheme, "fonte_titulo">> = [
  { name: "Noite", cor_fundo: "#050505", cor_texto: "#f4f1ea", cor_destaque: "#f4f1ea" },
  { name: "Areia", cor_fundo: "#f4efe6", cor_texto: "#1f1b16", cor_destaque: "#1f1b16" },
  { name: "Ouro", cor_fundo: "#0c0b09", cor_texto: "#f3ecdc", cor_destaque: "#d4af37" },
  { name: "Rosa", cor_fundo: "#fff4f5", cor_texto: "#3b1820", cor_destaque: "#e04f78" },
  { name: "Terracota", cor_fundo: "#f6ece2", cor_texto: "#3a2417", cor_destaque: "#c35f2c" },
  { name: "Oliva", cor_fundo: "#f1f1e8", cor_texto: "#262a1d", cor_destaque: "#5f6f3a" },
  { name: "Oceano", cor_fundo: "#08161f", cor_texto: "#e6f1f5", cor_destaque: "#4fc3e6" },
  { name: "Esmeralda", cor_fundo: "#05201a", cor_texto: "#e8f4ee", cor_destaque: "#3ad29a" },
];

const HEX = /^#[0-9a-f]{6}$/i;

export function safeHex(value: string | null | undefined, fallback: string) {
  return value && HEX.test(value) ? value.toLowerCase() : fallback;
}

function luminance(hex: string) {
  const channel = (index: number) => {
    const value = parseInt(hex.slice(index, index + 2), 16) / 255;
    return value <= 0.03928 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4;
  };
  return 0.2126 * channel(1) + 0.7152 * channel(3) + 0.0722 * channel(5);
}

export function contrastRatio(a: string, b: string) {
  const [light, dark] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (light + 0.05) / (dark + 0.05);
}

export function normalizeTheme(theme: Partial<StoreTheme> | null | undefined): StoreTheme {
  const font = theme?.fonte_titulo;
  return {
    cor_fundo: safeHex(theme?.cor_fundo, DEFAULT_THEME.cor_fundo),
    cor_texto: safeHex(theme?.cor_texto, DEFAULT_THEME.cor_texto),
    cor_destaque: safeHex(theme?.cor_destaque, DEFAULT_THEME.cor_destaque),
    fonte_titulo: font && font in FONTS ? font : DEFAULT_THEME.fonte_titulo,
  };
}

export function themeVars(input: Partial<StoreTheme> | null | undefined): Record<string, string> {
  const theme = normalizeTheme(input);
  const font = FONTS[theme.fonte_titulo];
  const onAccent =
    contrastRatio(theme.cor_destaque, "#ffffff") >= contrastRatio(theme.cor_destaque, "#0a0a0a")
      ? "#ffffff"
      : "#0a0a0a";
  return {
    "--theme-bg": theme.cor_fundo,
    "--theme-text": theme.cor_texto,
    "--theme-panel": `color-mix(in srgb, ${theme.cor_texto} 7%, ${theme.cor_fundo})`,
    "--theme-mute": `color-mix(in srgb, ${theme.cor_texto} 58%, ${theme.cor_fundo})`,
    "--theme-accent": theme.cor_destaque,
    "--theme-on-accent": onAccent,
    "--theme-display": font.family,
    "--theme-display-weight": String(font.weight),
    "--theme-display-tracking": font.tracking,
  };
}

export function themeStyle(input: Partial<StoreTheme> | null | undefined) {
  return themeVars(input) as CSSProperties;
}

export function themeCss(input: Partial<StoreTheme> | null | undefined) {
  const body = Object.entries(themeVars(input))
    .map(([key, value]) => `${key}:${value};`)
    .join("");
  return `:root{${body}color-scheme:${luminance(normalizeTheme(input).cor_fundo) > 0.4 ? "light" : "dark"};}`;
}
