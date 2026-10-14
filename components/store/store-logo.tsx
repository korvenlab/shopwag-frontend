import type { Loja } from "@/features/domain/types";
import type { LogoShape } from "@/lib/theme";

export type LogoStore = Pick<Loja, "nome" | "logo_url"> & {
  logo_formato?: LogoShape;
  logo_texto?: string | null;
};

const RADIUS: Record<LogoShape, string> = {
  circulo: "9999px",
  arredondado: "28%",
  quadrado: "10%",
};

export function monogram(store: Pick<LogoStore, "nome" | "logo_texto">) {
  const custom = store.logo_texto?.trim();
  if (custom) return custom.slice(0, 3);
  const words = store.nome.trim().split(/\s+/).filter(Boolean);
  return words
    .slice(0, 2)
    .map((word) => word.charAt(0))
    .join("")
    .toUpperCase();
}

export function StoreLogo({ store, size = 40 }: { store: LogoStore; size?: number }) {
  const radius = RADIUS[store.logo_formato ?? "arredondado"];
  if (store.logo_url) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={store.logo_url}
        alt=""
        width={size}
        height={size}
        className="shrink-0 border border-paper/15 bg-panel object-cover transition-[width,height,border-radius] duration-500 ease-out-expo"
        style={{ width: size, height: size, borderRadius: radius }}
      />
    );
  }
  const text = monogram(store);
  return (
    <span
      aria-hidden
      className="grid shrink-0 place-items-center bg-accent font-serif leading-none text-on-accent transition-[width,height,border-radius,font-size] duration-500 ease-out-expo"
      style={{
        width: size,
        height: size,
        borderRadius: radius,
        fontSize: size * (text.length > 2 ? 0.34 : text.length > 1 ? 0.42 : 0.52),
      }}
    >
      {text}
    </span>
  );
}
