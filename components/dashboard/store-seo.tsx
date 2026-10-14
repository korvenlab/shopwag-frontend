"use client";

import { useState } from "react";
import { Check, Copy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import type { Loja } from "@/features/domain/types";
import { storeUrl } from "@/lib/site";
import { Field, Group, SaveBar, Section, Toggle, emptyToNull, useStoreSave } from "./settings-ui";

export function StoreCatalogSettings({ store, publicUrl }: { store: Loja; publicUrl: string }) {
  const [esconder, setEsconder] = useState(store.esconder_esgotados);
  const { pending, message, save } = useStoreSave(store.id, "Catálogo salvo.");
  const feed = `${publicUrl}/feed.xml`;

  return (
    <Section id="catalogo" eyebrow="Catálogo" title="Produtos e anúncios">
      <Group title="Esgotados">
        <Toggle
          label="Esconder produtos esgotados"
          hint="Desligado, eles aparecem com a etiqueta Esgotado e o botão Avise-me quando chegar."
          checked={esconder}
          onChange={setEsconder}
        />
        <SaveBar message={message} pending={pending} label="Salvar catálogo" onSave={() => void save({ esconder_esgotados: esconder })} />
      </Group>

      <Group title="Catálogo para Instagram, Facebook e Google">
        <p className="text-sm leading-6 text-mute">
          Cole este link no Gerenciador de Comércio da Meta (Catálogo → Fontes de dados → Feed programado) ou no Google
          Merchant Center. Ele se atualiza sozinho com seus produtos.
        </p>
        <CopyField value={feed} label="Link do catálogo" />
      </Group>
    </Section>
  );
}

export function StoreSeo({ store }: { store: Loja }) {
  const [titulo, setTitulo] = useState(store.seo_titulo ?? "");
  const [descricao, setDescricao] = useState(store.seo_descricao ?? "");
  const [indexar, setIndexar] = useState(store.seo_indexar);
  const { pending, message, save } = useStoreSave(store.id, "Dados para o Google salvos.");

  return (
    <Section
      id="seo"
      eyebrow="Google"
      title="Aparecer nas buscas"
      description="Como a loja aparece no Google e quando alguém compartilha o link."
    >
      <div className="mt-5 rounded-2xl border border-paper/10 p-4">
        <p className="truncate text-xs text-mute">{storeUrl(store).replace(/^https?:\/\//, "")}</p>
        <p className="mt-1 truncate text-lg text-[#8ab4f8]">{titulo.trim() || store.nome}</p>
        <p className="mt-1 line-clamp-2 text-sm text-mute">
          {descricao.trim() || store.descricao || `Confira a vitrine de ${store.nome}.`}
        </p>
      </div>
      <div className="mt-5 space-y-4">
        <Field label={`Título (${titulo.length}/70)`} htmlFor="seo_titulo">
          <Input id="seo_titulo" value={titulo} maxLength={70} placeholder={store.nome} onChange={(event) => setTitulo(event.target.value)} />
        </Field>
        <Field label={`Descrição (${descricao.length}/160)`} htmlFor="seo_descricao">
          <Textarea
            id="seo_descricao"
            rows={3}
            value={descricao}
            maxLength={160}
            placeholder="Moda feminina com entrega rápida em São Paulo"
            onChange={(event) => setDescricao(event.target.value)}
          />
        </Field>
        <Toggle
          label="Permitir que o Google mostre a loja"
          hint="Desligue enquanto a loja ainda está sendo montada."
          checked={indexar}
          onChange={setIndexar}
        />
      </div>
      <SaveBar
        message={message}
        pending={pending}
        label="Salvar"
        onSave={() => void save({ seo_titulo: emptyToNull(titulo), seo_descricao: emptyToNull(descricao), seo_indexar: indexar })}
      />
    </Section>
  );
}

function CopyField({ value, label }: { value: string; label: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <div className="mt-3 flex items-center gap-2 rounded-2xl border border-paper/10 py-1.5 pr-1.5 pl-3">
      <span className="min-w-0 flex-1 truncate font-mono text-xs" title={value} aria-label={label}>
        {value}
      </span>
      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={async () => {
          await navigator.clipboard.writeText(value);
          setCopied(true);
          window.setTimeout(() => setCopied(false), 2000);
        }}
      >
        {copied ? <Check size={14} /> : <Copy size={14} />}
        {copied ? "Copiado" : "Copiar"}
      </Button>
    </div>
  );
}
