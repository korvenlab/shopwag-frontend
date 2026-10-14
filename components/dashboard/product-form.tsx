"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { sampleCatalog } from "@/features/catalog/sample";
import type { Produto } from "@/features/domain/types";
import { friendlyError } from "@/lib/friendly-error";
import { createClient } from "@/lib/supabase/client";
import { centsToInput, parseReais } from "@/lib/money";
import { slugify } from "@/lib/slug";

type VariantDraft = {
  key: string;
  cor: string;
  cor_hex: string;
  tamanho: string;
  estoque: string;
  preco: string;
};

function blankVariant(): VariantDraft {
  return { key: crypto.randomUUID(), cor: "", cor_hex: "#f4f1ea", tamanho: "", estoque: "5", preco: "" };
}

export function ProductForm({ lojaId, product }: { lojaId: string; product?: Produto }) {
  const router = useRouter();
  const [nome, setNome] = useState(product?.nome ?? "");
  const [descricao, setDescricao] = useState(product?.descricao ?? "");
  const [categoria, setCategoria] = useState(product?.categoria ?? "Geral");
  const [preco, setPreco] = useState(centsToInput(product?.preco_centavos ?? null));
  const [precoDe, setPrecoDe] = useState(centsToInput(product?.preco_de_centavos ?? null));
  const [ativo, setAtivo] = useState(product?.ativo ?? true);
  const [destaque, setDestaque] = useState(product?.destaque ?? false);
  const [images, setImages] = useState(product?.produto_imagens.map((image) => image.url) ?? [""]);
  const [variants, setVariants] = useState<VariantDraft[]>(
    product?.produto_variacoes.map((variant) => ({
      key: variant.id,
      cor: variant.cor ?? "",
      cor_hex: variant.cor_hex ?? "#f4f1ea",
      tamanho: variant.tamanho ?? "",
      estoque: String(variant.estoque),
      preco: centsToInput(variant.preco_centavos),
    })) ?? [],
  );
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function save(event: React.FormEvent) {
    event.preventDefault();
    const price = parseReais(preco);
    if (price == null) {
      setError("Informe o preço");
      return;
    }
    const compare = precoDe.trim() ? parseReais(precoDe) : null;
    if (precoDe.trim() && compare == null) {
      setError("Preço anterior inválido");
      return;
    }

    setPending(true);
    setError(null);
    const supabase = createClient();
    const payload = {
      loja_id: lojaId,
      nome: nome.trim(),
      slug: product?.slug ?? slugify(nome),
      descricao: descricao.trim(),
      categoria: categoria.trim() || "Geral",
      preco_centavos: price,
      preco_de_centavos: compare,
      ativo,
      destaque,
    };

    const saved = product
      ? await supabase.from("produtos").update(payload).eq("id", product.id).select("id").single()
      : await supabase.from("produtos").insert(payload).select("id").single();

    if (saved.error || !saved.data) {
      setError(friendlyError(saved.error, "Não foi possível salvar a peça. Tente de novo."));
      setPending(false);
      return;
    }

    const productId = saved.data.id;
    await supabase.from("produto_imagens").delete().eq("produto_id", productId);
    await supabase.from("produto_variacoes").delete().eq("produto_id", productId);

    const imageRows = images
      .map((url) => url.trim())
      .filter(Boolean)
      .map((url, ordem) => ({ produto_id: productId, url, alt: nome.trim(), ordem }));
    if (imageRows.length > 0) {
      const imageResult = await supabase.from("produto_imagens").insert(imageRows);
      if (imageResult.error) {
        setError(friendlyError(imageResult.error, "A peça foi salva, mas as fotos não. Confira os links e salve de novo."));
        setPending(false);
        return;
      }
    }

    const variantRows = variants
      .filter((variant) => variant.cor.trim() || variant.tamanho.trim())
      .map((variant) => ({
        produto_id: productId,
        cor: variant.cor.trim() || null,
        cor_hex: /^#[0-9A-Fa-f]{6}$/.test(variant.cor_hex) ? variant.cor_hex : null,
        tamanho: variant.tamanho.trim() || null,
        estoque: Math.max(0, Number(variant.estoque) || 0),
        preco_centavos: variant.preco.trim() ? parseReais(variant.preco) : null,
        ativo: true,
      }));
    if (variantRows.length > 0) {
      const variantResult = await supabase.from("produto_variacoes").insert(variantRows);
      if (variantResult.error) {
        setError(friendlyError(variantResult.error, "A peça foi salva, mas as variações não. Confira e salve de novo."));
        setPending(false);
        return;
      }
    }

    router.push("/dashboard/produtos");
    router.refresh();
  }

  async function remove() {
    if (!product) return;
    const supabase = createClient();
    await supabase.from("produtos").delete().eq("id", product.id);
    router.push("/dashboard/produtos");
    router.refresh();
  }

  return (
    <form onSubmit={save} className="px-5 pt-6">
      <h1 className="font-serif text-4xl">{product ? "Editar peça" : "Nova peça"}</h1>
      <div className="mt-6 space-y-4">
        <div className="space-y-2">
          <Label htmlFor="nome">Nome</Label>
          <Input id="nome" value={nome} onChange={(event) => setNome(event.target.value)} required />
        </div>
        <div className="space-y-2">
          <Label htmlFor="descricao">Descrição</Label>
          <Textarea id="descricao" value={descricao} onChange={(event) => setDescricao(event.target.value)} />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-2">
            <Label htmlFor="preco">Preço</Label>
            <Input id="preco" inputMode="decimal" value={preco} onChange={(event) => setPreco(event.target.value)} placeholder="199,90" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="de">Preço anterior</Label>
            <Input id="de" inputMode="decimal" value={precoDe} onChange={(event) => setPrecoDe(event.target.value)} placeholder="249,90" />
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="categoria">Categoria</Label>
          <Input id="categoria" value={categoria} onChange={(event) => setCategoria(event.target.value)} />
        </div>
        <div className="space-y-2">
          <Label>Fotos</Label>
          {images.map((url, index) => (
            <Input
              key={index}
              value={url}
              placeholder="https://"
              onChange={(event) =>
                setImages((current) => current.map((item, itemIndex) => (itemIndex === index ? event.target.value : item)))
              }
            />
          ))}
          <button type="button" className="text-xs text-mute underline underline-offset-4" onClick={() => setImages((current) => [...current, ""])}>
            Adicionar foto
          </button>
        </div>
        <div className="space-y-3">
          <Label>Variações</Label>
          {variants.map((variant) => (
            <div key={variant.key} className="grid grid-cols-2 gap-2 rounded-2xl border border-white/10 p-3">
              <Input placeholder="Cor" value={variant.cor} onChange={(event) => updateVariant(variant.key, { cor: event.target.value })} />
              <Input placeholder="#000000" value={variant.cor_hex} onChange={(event) => updateVariant(variant.key, { cor_hex: event.target.value })} />
              <Input placeholder="Tamanho" value={variant.tamanho} onChange={(event) => updateVariant(variant.key, { tamanho: event.target.value })} />
              <Input inputMode="numeric" placeholder="Estoque" value={variant.estoque} onChange={(event) => updateVariant(variant.key, { estoque: event.target.value })} />
            </div>
          ))}
          <button type="button" className="text-xs text-mute underline underline-offset-4" onClick={() => setVariants((current) => [...current, blankVariant()])}>
            Adicionar variação
          </button>
        </div>
        <label className="flex items-center gap-3 text-sm">
          <input type="checkbox" checked={ativo} onChange={(event) => setAtivo(event.target.checked)} />
          Visível na vitrine
        </label>
        <label className="flex items-center gap-3 text-sm">
          <input type="checkbox" checked={destaque} onChange={(event) => setDestaque(event.target.checked)} />
          Destaque
        </label>
      </div>
      {error ? <p className="mt-4 text-sm text-[#ff8d8d]">{error}</p> : null}
      <Button type="submit" className="mt-6 w-full" disabled={pending}>
        {pending ? "Salvando…" : "Salvar produto"}
      </Button>
      {product ? (
        <div className="mt-3">
          <ConfirmDialog title="Remover peça" description="A peça sai da vitrine. Pedidos já feitos guardam o nome e o valor." confirmLabel="Remover" onConfirm={remove}>
            <Button type="button" variant="ghost" className="w-full">
              Remover
            </Button>
          </ConfirmDialog>
        </div>
      ) : null}
    </form>
  );

  function updateVariant(key: string, patch: Partial<VariantDraft>) {
    setVariants((current) => current.map((variant) => (variant.key === key ? { ...variant, ...patch } : variant)));
  }
}

export function SampleCatalogButton({ lojaId }: { lojaId: string }) {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    setPending(true);
    setError(null);
    const supabase = createClient();

    for (const sample of sampleCatalog) {
      const created = await supabase
        .from("produtos")
        .insert({
          loja_id: lojaId,
          nome: sample.nome,
          slug: sample.slug,
          descricao: sample.descricao,
          preco_centavos: sample.preco_centavos,
          preco_de_centavos: sample.preco_de_centavos,
          categoria: sample.categoria,
          destaque: sample.destaque,
          ativo: true,
        })
        .select("id")
        .single();

      if (created.error || !created.data) {
        setError(friendlyError(created.error, "Não foi possível montar a vitrine de exemplo. Tente de novo."));
        setPending(false);
        return;
      }

      await supabase.from("produto_imagens").insert(
        sample.imagens.map((image, ordem) => ({
          produto_id: created.data.id,
          url: image.url,
          alt: image.alt,
          ordem,
        })),
      );
      await supabase.from("produto_variacoes").insert(
        sample.variacoes.map((variant) => ({
          produto_id: created.data.id,
          cor: variant.cor,
          cor_hex: variant.cor_hex,
          tamanho: variant.tamanho,
          estoque: variant.estoque,
          preco_centavos: variant.preco_centavos,
          ativo: true,
        })),
      );
    }

    router.refresh();
    setPending(false);
  }

  return (
    <div>
      <Button type="button" variant="ghost" className="w-full" disabled={pending} onClick={load}>
        {pending ? "Montando vitrine…" : "Carregar vitrine de exemplo"}
      </Button>
      {error ? <p className="mt-2 text-sm text-[#ff8d8d]">{error}</p> : null}
    </div>
  );
}
