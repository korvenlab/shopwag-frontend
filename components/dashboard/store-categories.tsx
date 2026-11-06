"use client";

import { useMemo, useRef, useState } from "react";
import { ArrowDown, ArrowUp, ImagePlus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Loja, Produto } from "@/features/domain/types";
import {
  CATEGORIA_ESTILOS,
  asCategoriaEstilo,
  mergeCategoryNav,
  type CategoriaEstilo,
  type CategoryNavItem,
} from "@/lib/storefront";
import { uploadImage } from "@/lib/upload";
import { cn } from "@/lib/cn";
import { Group, SaveBar, Section, useStoreSave } from "./settings-ui";

export function StoreCategories({ store, products }: { store: Loja; products: Produto[] }) {
  const productCategories = useMemo(() => {
    const names = new Set<string>();
    for (const product of products) {
      const name = product.categoria?.trim();
      if (name) names.add(name);
    }
    return Array.from(names).sort((a, b) => a.localeCompare(b, "pt-BR"));
  }, [products]);
  const [items, setItems] = useState<CategoryNavItem[]>(() => mergeCategoryNav(store.categorias_nav, productCategories));
  const [estilo, setEstilo] = useState<CategoriaEstilo>(asCategoriaEstilo(store.categoria_estilo));
  const [uploading, setUploading] = useState<string | null>(null);
  const { pending, message, setMessage, save } = useStoreSave(store.id, "Categorias salvas. Já aparecem na vitrine.");
  const fileRef = useRef<HTMLInputElement>(null);
  const [uploadTarget, setUploadTarget] = useState<string | null>(null);

  const byCategory = useMemo(() => {
    const map = new Map<string, Produto[]>();
    for (const product of products) {
      const name = product.categoria?.trim();
      if (!name) continue;
      const list = map.get(name) ?? [];
      list.push(product);
      map.set(name, list);
    }
    return map;
  }, [products]);

  function move(index: number, delta: number) {
    setItems((current) => {
      const next = [...current];
      const target = index + delta;
      if (target < 0 || target >= next.length) return current;
      [next[index], next[target]] = [next[target], next[index]];
      return next;
    });
  }

  function setCover(nome: string, capa_url: string | null) {
    setItems((current) => current.map((item) => (item.nome === nome ? { ...item, capa_url } : item)));
  }

  async function onUpload(file: File) {
    if (!uploadTarget) return;
    setUploading(uploadTarget);
    setMessage(null);
    const result = await uploadImage(store.id, "categorias", file);
    setUploading(null);
    setUploadTarget(null);
    if (result.url === null) {
      setMessage({ ok: false, text: result.error });
      return;
    }
    setCover(uploadTarget, result.url);
  }

  if (productCategories.length === 0) {
    return (
      <Section id="categorias" eyebrow="Categorias" title="Navegação por categoria" description="Cadastre produtos com categoria para montar esta seção.">
        <p className="text-sm text-mute">Ainda não há categorias no catálogo.</p>
      </Section>
    );
  }

  return (
    <Section
      id="categorias"
      eyebrow="Categorias"
      title="Navegação por categoria"
      description="Ordem, capa e estilo das bolhas/chips/cards na home."
    >
      <Group title="Estilo">
        <div className="grid gap-2 sm:grid-cols-3">
          {CATEGORIA_ESTILOS.map((item) => {
            const active = estilo === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setEstilo(item.id)}
                className={cn(
                  "rounded-2xl border p-3 text-left transition",
                  active ? "border-paper bg-paper/5" : "border-paper/10 hover:border-paper/40",
                )}
              >
                <span className="block text-sm">{item.label}</span>
                <span className="mt-1 block text-xs leading-5 text-mute">{item.blurb}</span>
              </button>
            );
          })}
        </div>
      </Group>

      <Group title="Ordem e capas">
        <ul className="space-y-3">
          {items.map((item, index) => {
            const options = byCategory.get(item.nome) ?? [];
            const productCover = options.find((product) => product.produto_imagens[0]?.url)?.produto_imagens[0]?.url ?? null;
            const preview = item.capa_url || productCover;
            return (
              <li key={item.nome} className="rounded-2xl border border-paper/10 p-3">
                <div className="flex items-start gap-3">
                  <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-2xl bg-panel">
                    {preview ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={preview} alt="" className="h-full w-full object-cover" />
                    ) : (
                      <span className="grid h-full place-items-center text-[10px] text-mute">Sem capa</span>
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium">{item.nome}</p>
                    <p className="text-xs text-mute">
                      {options.length} {options.length === 1 ? "produto" : "produtos"}
                    </p>
                    <label className="mt-2 block text-[11px] text-mute">
                      Capa a partir de um produto
                      <select
                        className="mt-1 h-10 w-full rounded-xl border border-paper/15 bg-transparent px-3 text-sm outline-none focus:border-paper/50"
                        value=""
                        onChange={(event) => {
                          const product = options.find((option) => option.id === event.target.value);
                          const url = product?.produto_imagens[0]?.url ?? null;
                          if (url) setCover(item.nome, url);
                          event.target.value = "";
                        }}
                      >
                        <option value="">Escolher produto…</option>
                        {options.map((product) => (
                          <option key={product.id} value={product.id} disabled={!product.produto_imagens[0]?.url}>
                            {product.nome}
                            {!product.produto_imagens[0]?.url ? " (sem foto)" : ""}
                          </option>
                        ))}
                      </select>
                    </label>
                    <div className="mt-2 flex flex-wrap gap-2">
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        disabled={uploading === item.nome}
                        onClick={() => {
                          setUploadTarget(item.nome);
                          fileRef.current?.click();
                        }}
                      >
                        <ImagePlus size={14} />
                        {uploading === item.nome ? "Enviando…" : "Upload"}
                      </Button>
                      {item.capa_url ? (
                        <button
                          type="button"
                          onClick={() => setCover(item.nome, null)}
                          className="inline-flex h-9 items-center gap-1.5 px-2 text-xs text-danger/70 transition hover:text-danger"
                        >
                          <Trash2 size={13} />
                          Usar capa automática
                        </button>
                      ) : null}
                    </div>
                  </div>
                  <div className="flex shrink-0 flex-col gap-1">
                    <button
                      type="button"
                      aria-label={`Subir ${item.nome}`}
                      disabled={index === 0}
                      onClick={() => move(index, -1)}
                      className="grid h-9 w-9 place-items-center rounded-full text-mute transition hover:text-paper disabled:opacity-30"
                    >
                      <ArrowUp size={15} />
                    </button>
                    <button
                      type="button"
                      aria-label={`Descer ${item.nome}`}
                      disabled={index === items.length - 1}
                      onClick={() => move(index, 1)}
                      className="grid h-9 w-9 place-items-center rounded-full text-mute transition hover:text-paper disabled:opacity-30"
                    >
                      <ArrowDown size={15} />
                    </button>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      </Group>

      <input
        ref={fileRef}
        type="file"
        accept="image/png,image/jpeg,image/webp"
        className="hidden"
        onChange={(event) => {
          const file = event.target.files?.[0];
          event.target.value = "";
          if (file) void onUpload(file);
        }}
      />

      <SaveBar
        pending={pending}
        message={message}
        label="Salvar categorias"
        onSave={() =>
          void save({
            categorias_nav: items,
            categoria_estilo: estilo,
          })
        }
      />
    </Section>
  );
}
