"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, ArrowRight, Trash2 } from "lucide-react";
import { UploadButton } from "@/components/dashboard/settings-ui";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { sampleCatalog } from "@/features/catalog/sample";
import type { Atacado, Produto } from "@/features/domain/types";
import { friendlyError } from "@/lib/friendly-error";
import { createClient } from "@/lib/supabase/client";
import { centsToInput, parseReais } from "@/lib/money";
import { slugify } from "@/lib/slug";
import { uploadImage } from "@/lib/upload";

type TierDraft = { key: string; min: string; preco: string };

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
  const [images, setImages] = useState(product?.produto_imagens.map((image) => image.url) ?? []);
  const [uploading, setUploading] = useState(false);
  const [tiers, setTiers] = useState<TierDraft[]>(
    (product?.atacado ?? []).map((tier) => ({ key: crypto.randomUUID(), min: String(tier.min), preco: centsToInput(tier.preco) })),
  );
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
    const atacado: Atacado[] = [];
    for (const tier of tiers) {
      if (!tier.min && !tier.preco.trim()) continue;
      const min = Number(tier.min);
      const tierPrice = parseReais(tier.preco);
      if (!Number.isInteger(min) || min < 2 || tierPrice == null) {
        setError("No atacado, informe a quantidade (a partir de 2) e o preço de cada faixa.");
        return;
      }
      if (tierPrice >= price) {
        setError("O preço de atacado precisa ser menor que o preço normal.");
        return;
      }
      atacado.push({ min, preco: tierPrice });
    }
    atacado.sort((a, b) => a.min - b.min);

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
      atacado,
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
        setError(friendlyError(imageResult.error, "A peça foi salva, mas as fotos não. Salve de novo."));
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
          <PhotoManager lojaId={lojaId} images={images} onChange={setImages} onBusy={setUploading} onError={setError} />
        </div>
        <div className="space-y-3">
          <Label>Preço de atacado</Label>
          <p className="text-xs leading-5 text-mute">
            Preço menor para quem leva mais unidades. Vale somando cores e tamanhos do mesmo produto.
          </p>
          {tiers.map((tier, index) => (
            <div key={tier.key} className="flex items-center gap-2">
              <Input
                inputMode="numeric"
                aria-label="A partir de quantas unidades"
                placeholder="A partir de (un.)"
                value={tier.min}
                onChange={(event) => updateTier(tier.key, { min: event.target.value.replace(/\D/g, "") })}
              />
              <Input
                inputMode="decimal"
                aria-label="Preço por unidade"
                placeholder="Preço cada"
                value={tier.preco}
                onChange={(event) => updateTier(tier.key, { preco: event.target.value })}
              />
              <button
                type="button"
                aria-label={`Remover faixa ${index + 1}`}
                onClick={() => setTiers((current) => current.filter((item) => item.key !== tier.key))}
                className="grid h-11 w-11 shrink-0 place-items-center rounded-full text-mute transition hover:text-paper"
              >
                <Trash2 size={15} />
              </button>
            </div>
          ))}
          {tiers.length < 5 ? (
            <button
              type="button"
              className="text-xs text-mute underline underline-offset-4"
              onClick={() => setTiers((current) => [...current, { key: crypto.randomUUID(), min: "", preco: "" }])}
            >
              Adicionar faixa de atacado
            </button>
          ) : null}
        </div>
        <div className="space-y-3">
          <Label>Variações</Label>
          {variants.map((variant) => (
            <div key={variant.key} className="grid grid-cols-2 gap-2 rounded-2xl border border-white/10 p-3 lg:grid-cols-4">
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
      <div className="mt-6 flex flex-col gap-3 lg:flex-row">
        <Button type="submit" className="w-full lg:w-auto lg:px-10" disabled={pending || uploading}>
          {pending ? "Salvando…" : "Salvar produto"}
        </Button>
        {product ? (
          <ConfirmDialog title="Remover peça" description="A peça sai da vitrine. Pedidos já feitos guardam o nome e o valor." confirmLabel="Remover" onConfirm={remove}>
            <Button type="button" variant="ghost" className="w-full lg:w-auto lg:px-8">
              Remover
            </Button>
          </ConfirmDialog>
        ) : null}
      </div>
    </form>
  );

  function updateVariant(key: string, patch: Partial<VariantDraft>) {
    setVariants((current) => current.map((variant) => (variant.key === key ? { ...variant, ...patch } : variant)));
  }

  function updateTier(key: string, patch: Partial<TierDraft>) {
    setTiers((current) => current.map((tier) => (tier.key === key ? { ...tier, ...patch } : tier)));
  }
}

const MAX_PHOTOS = 10;

function PhotoManager({
  lojaId,
  images,
  onChange,
  onBusy,
  onError,
}: {
  lojaId: string;
  images: string[];
  onChange: (images: string[]) => void;
  onBusy: (busy: boolean) => void;
  onError: (message: string | null) => void;
}) {
  const [busy, setBusy] = useState(false);
  const [link, setLink] = useState("");

  async function add(files: File[]) {
    onError(null);
    const room = MAX_PHOTOS - images.length;
    if (room <= 0) return onError(`Até ${MAX_PHOTOS} fotos por produto.`);
    setBusy(true);
    onBusy(true);
    const added: string[] = [];
    for (const file of files.slice(0, room)) {
      const result = await uploadImage(lojaId, "produtos", file);
      if (result.url === null) {
        onError(result.error);
        break;
      }
      added.push(result.url);
    }
    setBusy(false);
    onBusy(false);
    onChange([...images, ...added]);
  }

  function move(index: number, delta: number) {
    const target = index + delta;
    if (target < 0 || target >= images.length) return;
    const next = [...images];
    [next[index], next[target]] = [next[target], next[index]];
    onChange(next);
  }

  return (
    <div>
      {images.length ? (
        <ul className="grid grid-cols-3 gap-2 lg:grid-cols-5">
          {images.map((url, index) => (
            <li key={`${url}-${index}`} className="group relative">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={url} alt="" className="aspect-[4/5] w-full rounded-2xl bg-panel object-cover" />
              {index === 0 ? (
                <span className="absolute top-1.5 left-1.5 rounded-full bg-ink/75 px-2 py-0.5 text-[10px]">Capa</span>
              ) : null}
              <div className="absolute inset-x-1.5 bottom-1.5 flex justify-between">
                <PhotoButton label="Mover para a esquerda" disabled={index === 0} onClick={() => move(index, -1)}>
                  <ArrowLeft size={13} />
                </PhotoButton>
                <PhotoButton label="Remover foto" onClick={() => onChange(images.filter((_, position) => position !== index))}>
                  <Trash2 size={13} />
                </PhotoButton>
                <PhotoButton label="Mover para a direita" disabled={index === images.length - 1} onClick={() => move(index, 1)}>
                  <ArrowRight size={13} />
                </PhotoButton>
              </div>
            </li>
          ))}
        </ul>
      ) : null}
      <div className="mt-2 flex flex-wrap items-center gap-2">
        <UploadButton label="Enviar fotos" multiple busy={busy} onFiles={(files) => void add(files)} />
        <span className="text-xs text-mute">PNG, JPG ou WEBP até 3 MB. A primeira é a capa.</span>
      </div>
      <div className="mt-2 flex gap-2">
        <Input value={link} placeholder="Ou cole o link de uma foto" onChange={(event) => setLink(event.target.value)} />
        <Button
          type="button"
          variant="ghost"
          size="sm"
          disabled={!/^https:\/\/\S+$/.test(link.trim()) || images.length >= MAX_PHOTOS}
          onClick={() => {
            onChange([...images, link.trim()]);
            setLink("");
          }}
        >
          Adicionar
        </Button>
      </div>
    </div>
  );
}

function PhotoButton({
  label,
  disabled,
  onClick,
  children,
}: {
  label: string;
  disabled?: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      disabled={disabled}
      onClick={onClick}
      className="grid h-7 w-7 place-items-center rounded-full bg-ink/75 text-paper backdrop-blur transition disabled:opacity-0"
    >
      {children}
    </button>
  );
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
      <Button type="button" variant="ghost" className="w-full lg:w-auto lg:px-8" disabled={pending} onClick={load}>
        {pending ? "Montando vitrine…" : "Carregar vitrine de exemplo"}
      </Button>
      {error ? <p className="mt-2 text-sm text-[#ff8d8d]">{error}</p> : null}
    </div>
  );
}
