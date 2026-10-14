"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Download, FileSpreadsheet } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CSV_TEMPLATE, buildImport, type ImportResult } from "@/features/catalog/csv-import";
import { friendlyError } from "@/lib/friendly-error";
import { formatBRL } from "@/lib/money";
import { slugify } from "@/lib/slug";
import { createClient } from "@/lib/supabase/client";

export function CsvImport({ lojaId, existingSlugs }: { lojaId: string; existingSlugs: string[] }) {
  const router = useRouter();
  const input = useRef<HTMLInputElement>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [result, setResult] = useState<ImportResult | null>(null);
  const [progress, setProgress] = useState<{ done: number; total: number } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [finished, setFinished] = useState<number | null>(null);

  function downloadTemplate() {
    const blob = new Blob([`\uFEFF${CSV_TEMPLATE}`], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "modelo-produtos-shopwag.csv";
    link.click();
    URL.revokeObjectURL(url);
  }

  async function onFile(file: File) {
    setError(null);
    setFinished(null);
    if (file.size > 2 * 1024 * 1024) {
      setError("A planilha precisa ter até 2 MB.");
      return;
    }
    setFileName(file.name);
    const buffer = await file.arrayBuffer();
    let text = new TextDecoder("utf-8").decode(buffer);
    if (text.includes("\uFFFD")) text = new TextDecoder("windows-1252").decode(buffer);
    setResult(buildImport(text));
  }

  async function runImport() {
    if (!result?.products.length) return;
    const supabase = createClient();
    const used = new Set(existingSlugs);
    const total = result.products.length;
    setError(null);
    setProgress({ done: 0, total });
    let done = 0;
    for (const product of result.products) {
      const base = slugify(product.nome) || "produto";
      let slug = base;
      for (let suffix = 2; used.has(slug); suffix += 1) slug = `${base}-${suffix}`;
      used.add(slug);

      const created = await supabase
        .from("produtos")
        .insert({
          loja_id: lojaId,
          nome: product.nome,
          slug,
          descricao: product.descricao,
          preco_centavos: product.preco_centavos,
          preco_de_centavos: product.preco_de_centavos,
          categoria: product.categoria,
          destaque: product.destaque,
          ativo: true,
        })
        .select("id")
        .single();
      if (created.error || !created.data) {
        setError(`${product.nome}: ${friendlyError(created.error, "não foi possível cadastrar.")}`);
        break;
      }
      const id = created.data.id;
      if (product.fotos.length) {
        await supabase
          .from("produto_imagens")
          .insert(product.fotos.map((url, ordem) => ({ produto_id: id, url, alt: product.nome, ordem })));
      }
      if (product.variacoes.length) {
        await supabase
          .from("produto_variacoes")
          .insert(product.variacoes.map((variant) => ({ ...variant, produto_id: id, preco_centavos: null, ativo: true })));
      }
      done += 1;
      setProgress({ done, total });
    }
    setProgress(null);
    setFinished(done);
    if (done) router.refresh();
  }

  const busy = progress !== null;

  return (
    <div className="mt-6 space-y-5">
      <div className="rounded-3xl border border-paper/15 p-4">
        <p className="text-sm font-medium">1. Baixe o modelo</p>
        <p className="mt-1 text-xs leading-5 text-mute">
          Abra no Excel ou Google Planilhas. Colunas: nome, descricao, preco, preco_anterior, categoria, destaque (sim/não),
          fotos (links separados por |), cor, cor_hex, tamanho, estoque.
        </p>
        <Button type="button" variant="ghost" size="sm" className="mt-3" onClick={downloadTemplate}>
          <Download size={14} /> Baixar modelo
        </Button>
      </div>

      <div className="rounded-3xl border border-paper/15 p-4">
        <p className="text-sm font-medium">2. Envie a planilha preenchida</p>
        <p className="mt-1 text-xs leading-5 text-mute">Salve como CSV (separado por ponto e vírgula ou vírgula).</p>
        <Button type="button" variant="ghost" size="sm" className="mt-3" disabled={busy} onClick={() => input.current?.click()}>
          <FileSpreadsheet size={14} /> {fileName ?? "Escolher arquivo"}
        </Button>
        <input
          ref={input}
          type="file"
          accept=".csv,text/csv"
          className="hidden"
          onChange={(event) => {
            const file = event.target.files?.[0];
            event.target.value = "";
            if (file) void onFile(file);
          }}
        />
      </div>

      {result ? (
        <div className="rounded-3xl border border-paper/15 p-4">
          <p className="text-sm font-medium">3. Confira e importe</p>
          {result.errors.length ? (
            <ul className="mt-3 space-y-1 text-xs text-[#ffb36b]">
              {result.errors.slice(0, 8).map((message) => (
                <li key={message}>{message}</li>
              ))}
              {result.errors.length > 8 ? <li>E mais {result.errors.length - 8} linhas com problema.</li> : null}
            </ul>
          ) : null}
          {result.products.length ? (
            <>
              <ul className="mt-3 max-h-80 divide-y divide-paper/10 overflow-y-auto rounded-2xl border border-paper/10">
                {result.products.map((product) => (
                  <li key={product.nome} className="flex items-center gap-3 px-3 py-2.5 text-sm">
                    {product.fotos[0] ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={product.fotos[0]} alt="" className="h-10 w-8 rounded-lg bg-panel object-cover" />
                    ) : (
                      <span className="h-10 w-8 rounded-lg bg-panel" />
                    )}
                    <span className="min-w-0 flex-1">
                      <span className="block truncate">{product.nome}</span>
                      <span className="text-xs text-mute">
                        {product.categoria}
                        {product.variacoes.length ? ` · ${product.variacoes.length} variações` : ""}
                        {product.fotos.length ? ` · ${product.fotos.length} fotos` : " · sem foto"}
                      </span>
                    </span>
                    <span>{formatBRL(product.preco_centavos)}</span>
                  </li>
                ))}
              </ul>
              <Button type="button" className="mt-4 w-full lg:w-auto lg:px-10" disabled={busy} onClick={() => void runImport()}>
                {progress
                  ? `Importando ${progress.done} de ${progress.total}…`
                  : `Importar ${result.products.length} ${result.products.length === 1 ? "produto" : "produtos"}`}
              </Button>
            </>
          ) : (
            <p className="mt-3 text-sm text-mute">Nenhum produto válido encontrado.</p>
          )}
        </div>
      ) : null}

      {error ? <p className="text-sm text-[#ff8d8d]">{error}</p> : null}
      {finished !== null ? (
        <p className="text-sm">
          {finished} {finished === 1 ? "produto importado" : "produtos importados"}.{" "}
          <Link href="/dashboard/produtos" className="underline underline-offset-4">
            Ver produtos
          </Link>
        </p>
      ) : null}
    </div>
  );
}
