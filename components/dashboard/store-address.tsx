"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Check, Copy, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Loja } from "@/features/domain/types";
import { getStoreAddress, syncStoreAddress, type AddressView } from "@/features/merchant/store-address";
import { storeHost, storeUrl } from "@/lib/site";
import { Section } from "./settings-ui";

export function StoreAddress({ store }: { store: Loja }) {
  const host = storeHost(store.slug);
  const [address, setAddress] = useState<AddressView | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const url = storeUrl(store);

  useEffect(() => {
    if (!host) return;
    let cancelled = false;
    void getStoreAddress().then((result) => {
      if (!cancelled && result.ok) setAddress(result.data);
    });
    return () => {
      cancelled = true;
    };
  }, [host]);

  async function activate() {
    setBusy(true);
    setError(null);
    const result = await syncStoreAddress();
    setBusy(false);
    if (result.ok) setAddress(result.data);
    else setError(result.data.error || "Não foi possível ativar o endereço.");
  }

  return (
    <Section
      id="endereco"
      eyebrow="Endereço"
      title="Link da sua loja"
      description="É por este endereço que os clientes entram na loja. Coloque na bio do Instagram e no WhatsApp."
    >
      <div className="mt-5 flex items-center gap-2 rounded-2xl border border-paper/10 bg-paper/5 py-1.5 pr-1.5 pl-3">
        <span className="min-w-0 flex-1 truncate font-mono text-sm" title={url}>
          {url.replace(/^https?:\/\//, "")}
        </span>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={async () => {
            await navigator.clipboard.writeText(url);
            setCopied(true);
            window.setTimeout(() => setCopied(false), 2000);
          }}
        >
          {copied ? <Check size={14} /> : <Copy size={14} />}
          {copied ? "Copiado" : "Copiar"}
        </Button>
        <Button asChild variant="info" size="sm">
          <a href={url} target="_blank" rel="noreferrer" aria-label="Abrir a loja">
            <ExternalLink size={14} />
          </a>
        </Button>
      </div>

      {host ? (
        <div className="mt-3 text-sm leading-6">
          {address?.status === "active" ? (
            <p className="flex items-center gap-2 font-medium text-ok">
              <Check size={16} /> Endereço ativo.
            </p>
          ) : address?.status === "manual" ? (
            <p className="text-mute">Estamos preparando este endereço. Enquanto isso, o link antigo continua funcionando.</p>
          ) : address ? (
            <>
              <p className="text-mute">O endereço ainda não está ativo.</p>
              <Button type="button" variant="success" className="mt-3 w-full lg:w-auto lg:px-8" disabled={busy} onClick={() => void activate()}>
                {busy ? "Ativando…" : "Ativar endereço"}
              </Button>
            </>
          ) : null}
          {error ? <p className="mt-2 text-danger">{error}</p> : null}
        </div>
      ) : null}

      <p className="mt-4 text-xs leading-5 text-mute">
        Para trocar o nome do endereço, mude o campo “Endereço da vitrine” em{" "}
        <Link href="/dashboard/loja" className="underline underline-offset-4">
          Loja
        </Link>
        .
      </p>
    </Section>
  );
}
