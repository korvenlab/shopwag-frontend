import Link from "next/link";
import { Bell, FileSpreadsheet } from "lucide-react";
import { SampleCatalogButton } from "@/components/dashboard/product-form";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { isSoldOut } from "@/features/catalog/stock";
import type { Produto } from "@/features/domain/types";
import { formatBRL } from "@/lib/money";

export function ProductList({
  lojaId,
  products,
  waiting,
}: {
  lojaId: string;
  products: Produto[];
  waiting: Record<string, number>;
}) {
  const totalWaiting = Object.values(waiting).reduce((sum, count) => sum + count, 0);

  return (
    <div className="px-5 pt-6">
      <div className="flex items-end justify-between">
        <h1 className="font-serif text-4xl">Produtos</h1>
        <Button asChild size="sm">
          <Link href="/dashboard/produtos/novo">Novo</Link>
        </Button>
      </div>
      <div className="mt-4 flex flex-wrap gap-2">
        <Link
          href="/dashboard/produtos/importar"
          className="inline-flex h-9 items-center gap-2 rounded-full border border-paper/15 px-4 text-xs transition hover:border-paper/50"
        >
          <FileSpreadsheet size={14} /> Importar planilha
        </Link>
        <Link
          href="/dashboard/produtos/interessados"
          className="inline-flex h-9 items-center gap-2 rounded-full border border-paper/15 px-4 text-xs transition hover:border-paper/50"
        >
          <Bell size={14} /> Avise-me
          {totalWaiting ? (
            <span className="rounded-full bg-accent px-1.5 text-[10px] leading-4 text-on-accent">{totalWaiting}</span>
          ) : null}
        </Link>
      </div>
      {products.length === 0 ? (
        <div className="mt-8 space-y-4">
          <p className="text-sm leading-6 text-mute">A vitrine ainda está vazia. Crie uma peça, importe uma planilha ou carregue o catálogo de exemplo.</p>
          <SampleCatalogButton lojaId={lojaId} />
        </div>
      ) : (
        <ul className="mt-5 space-y-3 lg:grid lg:grid-cols-2 lg:gap-3 lg:space-y-0">
          {products.map((product) => (
            <li key={product.id}>
              <Link href={`/dashboard/produtos/${product.id}`} className="flex h-full items-center gap-3 rounded-3xl border border-white/15 p-3 transition hover:border-white/40">
                {product.produto_imagens[0] ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={product.produto_imagens[0].url} alt="" className="h-16 w-14 rounded-2xl object-cover" />
                ) : (
                  <div className="h-16 w-14 rounded-2xl bg-panel" />
                )}
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm">{product.nome}</span>
                  <span className="font-serif text-lg">{formatBRL(product.preco_centavos)}</span>
                  {waiting[product.id] ? (
                    <span className="block text-xs text-mute">
                      {waiting[product.id]} {waiting[product.id] === 1 ? "pessoa esperando" : "pessoas esperando"}
                    </span>
                  ) : null}
                </span>
                <span className="flex flex-col items-end gap-1">
                  {!product.ativo ? <Badge tone="line">Oculto</Badge> : null}
                  {isSoldOut(product) ? <Badge tone="line">Esgotado</Badge> : null}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
