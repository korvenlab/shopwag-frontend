import Link from "next/link";
import { SampleCatalogButton } from "@/components/dashboard/product-form";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { Produto } from "@/features/domain/types";
import { formatBRL } from "@/lib/money";

export function ProductList({ lojaId, products }: { lojaId: string; products: Produto[] }) {
  return (
    <div className="px-5 pt-6">
      <div className="flex items-end justify-between">
        <h1 className="font-serif text-4xl">Produtos</h1>
        <Button asChild size="sm">
          <Link href="/dashboard/produtos/novo">Novo</Link>
        </Button>
      </div>
      {products.length === 0 ? (
        <div className="mt-8 space-y-4">
          <p className="text-sm leading-6 text-mute">A vitrine ainda está vazia. Crie uma peça ou carregue o catálogo de exemplo.</p>
          <SampleCatalogButton lojaId={lojaId} />
        </div>
      ) : (
        <ul className="mt-5 space-y-3">
          {products.map((product) => (
            <li key={product.id}>
              <Link href={`/dashboard/produtos/${product.id}`} className="flex items-center gap-3 rounded-3xl border border-white/15 p-3">
                {product.produto_imagens[0] ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={product.produto_imagens[0].url} alt="" className="h-16 w-14 rounded-2xl object-cover" />
                ) : (
                  <div className="h-16 w-14 rounded-2xl bg-panel" />
                )}
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm">{product.nome}</span>
                  <span className="font-serif text-lg">{formatBRL(product.preco_centavos)}</span>
                </span>
                {!product.ativo ? <Badge tone="line">Oculto</Badge> : null}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
