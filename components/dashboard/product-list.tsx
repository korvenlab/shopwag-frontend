"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Bell, Check, FileSpreadsheet, Plus, Trash2 } from "lucide-react";
import { SampleCatalogButton } from "@/components/dashboard/product-form";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { isSoldOut } from "@/features/catalog/stock";
import type { Produto } from "@/features/domain/types";
import { formatBRL } from "@/lib/money";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/cn";

export function ProductList({
  lojaId,
  products,
  waiting,
}: {
  lojaId: string;
  products: Produto[];
  waiting: Record<string, number>;
}) {
  const router = useRouter();
  const [selected, setSelected] = useState<string[]>([]);
  const [removing, setRemoving] = useState(false);
  const totalWaiting = Object.values(waiting).reduce((sum, count) => sum + count, 0);
  const allSelected = products.length > 0 && selected.length === products.length;

  function toggle(id: string) {
    setSelected((current) => (current.includes(id) ? current.filter((item) => item !== id) : [...current, id]));
  }

  async function removeSelected() {
    setRemoving(true);
    const supabase = createClient();
    await supabase.from("produtos").delete().in("id", selected);
    setSelected([]);
    setRemoving(false);
    router.refresh();
  }

  return (
    <div className="px-5 pt-6">
      <div className="flex items-end justify-between">
        <h1 className="font-serif text-4xl">Produtos</h1>
        <Button asChild size="sm" variant="success">
          <Link href="/dashboard/produtos/novo">
            <Plus size={14} /> Novo produto
          </Link>
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
        <>
          <div className="mt-5 flex items-center justify-between">
            <button type="button" onClick={() => setSelected(allSelected ? [] : products.map((product) => product.id))} className="text-xs text-mute underline-offset-4 hover:underline">
              {allSelected ? "Limpar seleção" : "Selecionar todos"}
            </button>
            {selected.length > 0 ? (
              <ConfirmDialog
                title={selected.length === 1 ? "Remover 1 produto?" : `Remover ${selected.length} produtos?`}
                description="As fotos e variações desses produtos também saem. Os pedidos já feitos continuam no histórico."
                confirmLabel="Remover"
                onConfirm={() => void removeSelected()}
              >
                <Button type="button" variant="danger-line" size="sm" disabled={removing}>
                  <Trash2 size={14} /> Remover {selected.length}
                </Button>
              </ConfirmDialog>
            ) : null}
          </div>
          <ul className="mt-3 space-y-3 lg:grid lg:grid-cols-2 lg:gap-3 lg:space-y-0">
            {products.map((product) => {
              const checked = selected.includes(product.id);
              return (
                <li key={product.id} className="dash-card flex items-center gap-3 rounded-3xl border border-paper/10 p-3">
                  <button
                    type="button"
                    role="checkbox"
                    aria-checked={checked}
                    aria-label={`Selecionar ${product.nome}`}
                    onClick={() => toggle(product.id)}
                    className={cn(
                      "flex size-6 shrink-0 items-center justify-center rounded-full border transition",
                      checked ? "border-paper bg-paper text-ink" : "border-paper/30 text-transparent hover:border-paper/60",
                    )}
                  >
                    <Check size={14} />
                  </button>
                  <Link href={`/dashboard/produtos/${product.id}`} className="flex min-w-0 flex-1 items-center gap-3">
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
                      {isSoldOut(product) ? <Badge tone="danger">Esgotado</Badge> : null}
                    </span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </>
      )}
    </div>
  );
}
