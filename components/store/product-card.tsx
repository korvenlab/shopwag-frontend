import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { discountPercent, formatBRL } from "@/lib/money";
import type { Produto } from "@/features/domain/types";

export function ProductCard({ storeSlug, product }: { storeSlug: string; product: Produto }) {
  const image = product.produto_imagens[0];
  const off = discountPercent(product.preco_centavos, product.preco_de_centavos);

  return (
    <Link href={`/s/${storeSlug}/produto/${product.slug}`} className="block">
      <article>
        <div className="relative aspect-[3/4] overflow-hidden rounded-3xl bg-panel">
          {image ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={image.url} alt={image.alt || product.nome} className="h-full w-full object-cover" />
          ) : (
            <div className="flex h-full items-end p-3 text-xs uppercase tracking-[0.16em] text-mute">
              Sem foto
            </div>
          )}
          {off ? (
            <div className="absolute top-3 left-3">
              <Badge>−{off}%</Badge>
            </div>
          ) : null}
        </div>
        <h3 className="mt-3 text-sm">{product.nome}</h3>
        <p className="mt-1 flex items-baseline gap-2">
          <span className="font-serif text-lg">{formatBRL(product.preco_centavos)}</span>
          {off ? (
            <span className="text-xs text-mute line-through">
              {formatBRL(product.preco_de_centavos ?? 0)}
            </span>
          ) : null}
        </p>
      </article>
    </Link>
  );
}
