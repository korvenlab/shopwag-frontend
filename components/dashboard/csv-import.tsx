"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Download, FileSpreadsheet, ImagePlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CSV_TEMPLATE, buildImport, matchPhotos, productIssues, type ImportProduct, type ImportResult } from "@/features/catalog/csv-import";
import { readXlsx } from "@/features/catalog/xlsx-import";
import { friendlyError } from "@/lib/friendly-error";
import { parseReais } from "@/lib/money";
import { Input } from "@/components/ui/input";
import { slugify } from "@/lib/slug";
import { createClient } from "@/lib/supabase/client";
import { uploadImage } from "@/lib/upload";

export function CsvImport({ lojaId, existingSlugs }: { lojaId: string; existingSlugs: string[] }) {
  const router = useRouter();
  const input = useRef<HTMLInputElement>(null);
  const photosInput = useRef<HTMLInputElement>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [photos, setPhotos] = useState<File[]>([]);
  const [previews, setPreviews] = useState<Map<File, string>>(new Map());
  const [products, setProducts] = useState<ImportProduct[] | null>(null);
  const [notes, setNotes] = useState<string[]>([]);
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

  function show(built: ImportResult) {
    const embedded = built.products.flatMap((product) => product.arquivos);
    if (embedded.length) {
      setPreviews((current) => {
        const next = new Map(current);
        for (const file of embedded) if (!next.has(file)) next.set(file, URL.createObjectURL(file));
        return next;
      });
    }
    setNotes(built.errors);
    setProducts(built.products);
  }

  function patch(id: string, update: (product: ImportProduct) => ImportProduct) {
    setProducts((current) => current?.map((product) => (product.id === id ? update(product) : product)) ?? current);
  }

  async function onFile(file: File) {
    setError(null);
    setFinished(null);
    const excel = /\.xlsx$/i.test(file.name);
    if (/\.xls$/i.test(file.name)) {
      setError("Esse formato antigo não abre aqui. No Excel, use Salvar como e escolha .xlsx.");
      return;
    }
    if (file.size > (excel ? 20 : 2) * 1024 * 1024) {
      setError(excel ? "A planilha precisa ter até 20 MB." : "A planilha precisa ter até 2 MB.");
      return;
    }
    setFileName(file.name);
    try {
      if (excel) {
        const read = readXlsx(await file.arrayBuffer());
        const built = buildImport(read.csv, read.imagesByLine);
        built.errors.unshift(...read.notes);
        show(built);
        return;
      }
      const buffer = await file.arrayBuffer();
      let text = new TextDecoder("utf-8").decode(buffer);
      if (text.includes("\uFFFD")) text = new TextDecoder("windows-1252").decode(buffer);
      show(buildImport(text));
    } catch (caught) {
      setProducts(null);
      setError(caught instanceof Error ? caught.message : "Não conseguimos ler essa planilha.");
    }
  }

  const photoMatch = products ? matchPhotos(products, photos) : null;

  function extraFiles(product: ImportProduct) {
    return [...product.arquivos, ...(photoMatch?.matched.get(product.nome.toLowerCase()) ?? [])];
  }

  async function runImport() {
    if (!products) return;
    const ready = products.filter((product) => productIssues(product).length === 0);
    if (!ready.length) return;
    const supabase = createClient();
    const used = new Set(existingSlugs);
    setError(null);
    setProgress({ done: 0, total: ready.length });
    const imported: string[] = [];
    for (const product of ready) {
      const price = parseReais(product.precoTexto) ?? 0;
      const base = slugify(product.nome) || "produto";
      let slug = base;
      for (let suffix = 2; used.has(slug); suffix += 1) slug = `${base}-${suffix}`;
      used.add(slug);

      const created = await supabase
        .from("produtos")
        .insert({
          loja_id: lojaId,
          nome: product.nome.trim(),
          slug,
          descricao: product.descricao,
          preco_centavos: price,
          preco_de_centavos: product.preco_de_centavos && product.preco_de_centavos > price ? product.preco_de_centavos : null,
          categoria: product.categoria.trim() || "Geral",
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
      const files = extraFiles(product);
      const uploaded: string[] = [];
      for (const file of files) {
        const sent = await uploadImage(lojaId, "produtos", file);
        if (sent.url) uploaded.push(sent.url);
      }
      const urls = [...product.fotos, ...uploaded].slice(0, 10);
      if (urls.length) {
        await supabase
          .from("produto_imagens")
          .insert(urls.map((url, ordem) => ({ produto_id: id, url, alt: product.nome.trim(), ordem })));
      }
      const variants = product.variacoes.filter((variant) => variant.cor || variant.tamanho || variant.estoque > 0);
      if (variants.length) {
        await supabase.from("produto_variacoes").insert(
          variants.map((variant) => ({
            produto_id: id,
            cor: variant.cor,
            cor_hex: variant.cor_hex,
            tamanho: variant.tamanho,
            estoque: variant.estoque,
            preco_centavos: variant.precoTexto ? parseReais(variant.precoTexto) : null,
            ativo: true,
          })),
        );
      }
      imported.push(product.id);
      setProgress({ done: imported.length, total: ready.length });
    }
    setProducts((current) => current?.filter((product) => !imported.includes(product.id)) ?? current);
    setProgress(null);
    setFinished(imported.length);
    if (imported.length) router.refresh();
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
        <p className="mt-1 text-xs leading-5 text-mute">
          CSV ou Excel (.xlsx), até 20 MB no Excel. A foto que estiver na mesma linha do produto, dentro da célula ou sobre ela,
          entra com o produto.
        </p>
        <Button type="button" variant="ghost" size="sm" className="mt-3" disabled={busy} onClick={() => input.current?.click()}>
          <FileSpreadsheet size={14} /> {fileName ?? "Escolher arquivo"}
        </Button>
        <input
          ref={input}
          type="file"
          accept=".csv,.xlsx,text/csv,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
          className="hidden"
          onChange={(event) => {
            const file = event.target.files?.[0];
            event.target.value = "";
            if (file) void onFile(file);
          }}
        />
      </div>

      <div className="rounded-3xl border border-paper/15 p-4">
        <p className="text-sm font-medium">3. Envie as fotos, se tiver</p>
        <p className="mt-1 text-xs leading-5 text-mute">
          Use isto quando a foto não estiver dentro da planilha. Nomeie cada arquivo com o nome do produto, como Vestido Midi
          Linho.jpg. Para mais de uma foto, use 2, 3 no final. PNG, JPG ou WEBP, até 3 MB cada.
        </p>
        <Button type="button" variant="ghost" size="sm" className="mt-3" disabled={busy} onClick={() => photosInput.current?.click()}>
          <ImagePlus size={14} /> {photos.length ? `${photos.length} ${photos.length === 1 ? "foto" : "fotos"}` : "Escolher fotos"}
        </Button>
        <input
          ref={photosInput}
          type="file"
          accept="image/png,image/jpeg,image/webp"
          multiple
          className="hidden"
          onChange={(event) => {
            const files = [...(event.target.files ?? [])];
            previews.forEach((url) => URL.revokeObjectURL(url));
            setPreviews(new Map(files.map((file) => [file, URL.createObjectURL(file)])));
            setPhotos(files);
            event.target.value = "";
          }}
        />
      </div>

      {products ? (
        <div className="rounded-3xl border border-paper/15 p-4">
          <p className="text-sm font-medium">4. Confira e importe</p>
          <p className="mt-1 text-xs leading-5 text-mute">
            Cada linha da planilha virou um produto. Linhas com o mesmo nome entram como tamanhos e cores. O que estiver marcado,
            corrija aqui.
          </p>
          {notes.length ? (
            <ul className="mt-3 space-y-1 text-xs leading-5 text-[#ffb36b]">
              {notes.map((message) => (
                <li key={message}>{message}</li>
              ))}
            </ul>
          ) : null}
          {photoMatch?.unused.length ? (
            <p className="mt-3 text-xs leading-5 text-[#ffb36b]">
              {photoMatch.unused.length === 1 ? "1 foto não combina" : `${photoMatch.unused.length} fotos não combinam`} com
              nenhum produto: {photoMatch.unused.slice(0, 4).join(", ")}
              {photoMatch.unused.length > 4 ? "…" : ""}. Renomeie o arquivo com o nome do produto ou deixe de fora.
            </p>
          ) : null}
          {products.length ? (
            <>
              <ul className="mt-3 max-h-[32rem] space-y-3 overflow-y-auto">
                {products.map((product) => {
                  const issues = productIssues(product);
                  const photoCount = product.fotos.length + extraFiles(product).length;
                  return (
                    <li key={product.id} className="rounded-2xl border border-paper/10 p-3">
                      <div className="flex items-start gap-3">
                        {product.fotos[0] || extraFiles(product)[0] ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={product.fotos[0] || previews.get(extraFiles(product)[0])}
                            alt=""
                            className="h-12 w-10 rounded-lg bg-panel object-cover"
                          />
                        ) : (
                          <span className="h-12 w-10 rounded-lg bg-panel" />
                        )}
                        <div className="grid min-w-0 flex-1 gap-2 sm:grid-cols-[minmax(0,1fr)_8rem]">
                          <Input
                            aria-label="Nome do produto"
                            value={product.nome}
                            placeholder="Nome do produto"
                            disabled={busy}
                            className={product.nome.trim().length < 2 ? "border-danger" : undefined}
                            onChange={(event) => patch(product.id, (item) => ({ ...item, nome: event.target.value.slice(0, 120) }))}
                          />
                          <Input
                            aria-label="Preço"
                            inputMode="decimal"
                            value={product.precoTexto}
                            placeholder="49,90"
                            disabled={busy}
                            className={(parseReais(product.precoTexto) ?? 0) <= 0 ? "border-danger" : undefined}
                            onChange={(event) => {
                              const precoTexto = event.target.value;
                              const cents = parseReais(precoTexto);
                              patch(product.id, (item) => ({
                                ...item,
                                precoTexto,
                                preco_centavos: cents != null && cents > 0 ? cents : 0,
                              }));
                            }}
                          />
                        </div>
                      </div>
                      <p className="mt-2 text-xs text-mute">
                        {product.categoria}
                        {product.variacoes.length ? ` · ${product.variacoes.length} ${product.variacoes.length === 1 ? "variação" : "variações"}` : ""}
                        {photoCount ? ` · ${photoCount} ${photoCount === 1 ? "foto" : "fotos"}` : " · sem foto"}
                      </p>
                      {issues.map((issue) => (
                        <p key={issue} className="mt-1 text-xs text-danger">
                          {issue}
                        </p>
                      ))}
                      {product.aviso ? <p className="mt-1 text-xs text-[#ffb36b]">{product.aviso}</p> : null}
                      {product.variacoes.length ? (
                        <ul className="mt-2 space-y-2">
                          {product.variacoes.map((variant, index) => (
                            <li key={index} className={`grid gap-2 ${variant.precoTexto != null ? "grid-cols-2 sm:grid-cols-4" : "grid-cols-3"}`}>
                              <Input
                                aria-label="Tamanho"
                                value={variant.tamanho ?? ""}
                                placeholder="Tamanho"
                                disabled={busy}
                                className="h-9"
                                onChange={(event) =>
                                  patch(product.id, (item) => ({
                                    ...item,
                                    variacoes: item.variacoes.map((current, position) =>
                                      position === index ? { ...current, tamanho: event.target.value.trim() || null } : current,
                                    ),
                                  }))
                                }
                              />
                              <Input
                                aria-label="Cor"
                                value={variant.cor ?? ""}
                                placeholder="Cor"
                                disabled={busy}
                                className="h-9"
                                onChange={(event) =>
                                  patch(product.id, (item) => ({
                                    ...item,
                                    variacoes: item.variacoes.map((current, position) =>
                                      position === index ? { ...current, cor: event.target.value.trim() || null } : current,
                                    ),
                                  }))
                                }
                              />
                              <Input
                                aria-label="Estoque"
                                inputMode="numeric"
                                value={String(variant.estoque)}
                                placeholder="Estoque"
                                disabled={busy}
                                className="h-9"
                                onChange={(event) =>
                                  patch(product.id, (item) => ({
                                    ...item,
                                    variacoes: item.variacoes.map((current, position) =>
                                      position === index
                                        ? { ...current, estoque: Math.max(0, Math.floor(Number(event.target.value.replace(",", ".")) || 0)) }
                                        : current,
                                    ),
                                  }))
                                }
                              />
                              {variant.precoTexto != null ? (
                                <Input
                                  aria-label="Preço deste tamanho"
                                  inputMode="decimal"
                                  value={variant.precoTexto}
                                  placeholder="Preço deste tamanho"
                                  disabled={busy}
                                  className="h-9"
                                  onChange={(event) => {
                                    const precoTexto = event.target.value;
                                    const cents = parseReais(precoTexto);
                                    patch(product.id, (item) => ({
                                      ...item,
                                      variacoes: item.variacoes.map((current, position) =>
                                        position === index
                                          ? { ...current, precoTexto, preco_centavos: cents != null && cents > 0 ? cents : null }
                                          : current,
                                      ),
                                    }));
                                  }}
                                />
                              ) : null}
                            </li>
                          ))}
                        </ul>
                      ) : null}
                    </li>
                  );
                })}
              </ul>
              <Button
                type="button"
                variant="success"
                className="mt-4 w-full lg:w-auto lg:px-10"
                disabled={busy || products.every((product) => productIssues(product).length > 0)}
                onClick={() => void runImport()}
              >
                {progress
                  ? `Importando ${progress.done} de ${progress.total}…`
                  : `Importar ${products.filter((product) => productIssues(product).length === 0).length} ${
                      products.filter((product) => productIssues(product).length === 0).length === 1 ? "produto" : "produtos"
                    }`}
              </Button>
              {products.some((product) => productIssues(product).length > 0) ? (
                <p className="mt-2 text-xs text-mute">O que ainda estiver marcado fica de fora até você preencher.</p>
              ) : null}
            </>
          ) : (
            <p className="mt-3 text-sm text-mute">Nenhum produto encontrado nessa planilha.</p>
          )}
        </div>
      ) : null}

      {error ? <p className="text-sm text-danger">{error}</p> : null}
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
