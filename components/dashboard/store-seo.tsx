"use client";

import { useEffect, useState } from "react";
import { Check, Copy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import type { Loja } from "@/features/domain/types";
import { apiJson } from "@/lib/api";
import { createClient } from "@/lib/supabase/client";
import { Field, Group, SaveBar, Section, Toggle, emptyToNull, useStoreSave } from "./settings-ui";

type DomainView = {
  dominio: string | null;
  status: "none" | "pending" | "active" | "manual";
  records: Array<{ type: string; name: string; value: string }>;
};

async function accessToken() {
  const { data } = await createClient().auth.getSession();
  return data.session?.access_token;
}

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
        <p className="truncate text-xs text-mute">{store.dominio || `shopwag · ${store.slug}`}</p>
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

export function StoreDomain({ store }: { store: Loja }) {
  const [domain, setDomain] = useState<DomainView>({
    dominio: store.dominio,
    status: store.dominio ? "pending" : "none",
    records: [],
  });
  const [draft, setDraft] = useState(store.dominio ?? "");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!store.dominio) return;
    let cancelled = false;
    void (async () => {
      const result = await apiJson<DomainView>("/api/domains", { accessToken: await accessToken() });
      if (!cancelled && result.ok) setDomain(result.data);
    })();
    return () => {
      cancelled = true;
    };
  }, [store.dominio]);

  async function run(method: "PUT" | "DELETE" | "GET") {
    setBusy(true);
    setError(null);
    const result = await apiJson<DomainView>("/api/domains", {
      method,
      body: method === "PUT" ? JSON.stringify({ dominio: draft }) : undefined,
      accessToken: await accessToken(),
    });
    setBusy(false);
    if (!result.ok) {
      setError(result.data.error || "Não foi possível salvar o domínio.");
      return;
    }
    setDomain(result.data);
    if (method === "DELETE") setDraft("");
  }

  return (
    <Section
      id="dominio"
      eyebrow="Endereço"
      title="Domínio próprio"
      description="Use um endereço seu, como www.sualoja.com.br, no lugar do link da Shopwag."
    >
      <div className="mt-5 space-y-3">
        <Field label="Seu domínio" htmlFor="dominio">
          <Input
            id="dominio"
            value={draft}
            placeholder="www.sualoja.com.br"
            autoCapitalize="none"
            spellCheck={false}
            onChange={(event) => setDraft(event.target.value.toLowerCase())}
          />
        </Field>
        <div className="flex gap-2">
          <Button type="button" className="flex-1" disabled={busy || !draft.trim()} onClick={() => void run("PUT")}>
            {busy ? "Salvando…" : domain.dominio ? "Trocar domínio" : "Usar este domínio"}
          </Button>
          {domain.dominio ? (
            <Button type="button" variant="ghost" disabled={busy} onClick={() => void run("DELETE")}>
              Remover
            </Button>
          ) : null}
        </div>
        {error ? <p className="text-sm text-[#ff8d8d]">{error}</p> : null}
      </div>

      {domain.dominio ? (
        <Group title={domain.status === "active" ? "Tudo certo" : "Falta um passo"}>
          {domain.status === "active" ? (
            <p className="flex items-center gap-2 text-sm">
              <Check size={16} className="text-accent" /> Sua loja já abre em{" "}
              <a href={`https://${domain.dominio}`} target="_blank" rel="noreferrer" className="underline underline-offset-4">
                {domain.dominio}
              </a>
            </p>
          ) : (
            <>
              <p className="text-sm leading-6 text-mute">
                Entre no site onde você comprou o domínio (Registro.br, GoDaddy, Hostinger…), abra a parte de DNS e crie:
              </p>
              <ul className="mt-3 space-y-2">
                {(domain.records.length ? domain.records : []).map((record, index) => (
                  <li key={`${record.type}-${index}`} className="grid grid-cols-[4.5rem_1fr] gap-x-3 gap-y-1 rounded-2xl border border-paper/10 p-3 text-xs">
                    <span className="text-mute">Tipo</span>
                    <span className="font-mono">{record.type}</span>
                    <span className="text-mute">Nome</span>
                    <span className="font-mono break-all">{record.name}</span>
                    <span className="text-mute">Valor</span>
                    <span className="font-mono break-all">{record.value}</span>
                  </li>
                ))}
              </ul>
              <p className="mt-3 text-xs leading-5 text-mute">
                {domain.status === "manual"
                  ? "Depois de criar, a equipe Shopwag finaliza a ativação. Pode levar até 24 horas."
                  : "A mudança pode levar de alguns minutos até 24 horas para valer."}
              </p>
              <Button type="button" variant="ghost" className="mt-3 w-full" disabled={busy} onClick={() => void run("GET")}>
                Verificar agora
              </Button>
            </>
          )}
        </Group>
      ) : null}
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
