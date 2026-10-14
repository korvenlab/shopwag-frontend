"use client";

import { useState } from "react";
import { MpFees } from "@/components/dashboard/mp-fees";
import { Button } from "@/components/ui/button";
import type { MpConnection } from "@/features/merchant/mercadopago";
import { apiJson } from "@/lib/api";
import { PLATFORM_FEE_PERCENT } from "@/lib/mercadopago/platform-fee";
import { createClient } from "@/lib/supabase/client";

async function accessToken() {
  const { data } = await createClient().auth.getSession();
  return data.session?.access_token;
}

export function MercadoPagoConnect({
  notice,
  initial,
}: {
  notice: { text: string; ok: boolean } | null;
  initial: MpConnection;
}) {
  const [connection, setConnection] = useState(initial);
  const [error, setError] = useState<string | null>(initial.error ?? null);
  const [busy, setBusy] = useState(false);

  async function connect() {
    setBusy(true);
    setError(null);
    const result = await apiJson<{ url?: string }>("/api/mercadopago/connect/start", {
      accessToken: await accessToken(),
    });
    if (!result.ok || !result.data.url) {
      setError(result.data.error || "Não foi possível abrir o Mercado Pago.");
      setBusy(false);
      return;
    }
    window.location.assign(result.data.url);
  }

  async function saveFees(patch: { pass_fees?: boolean; pix_percent?: string }) {
    setError(null);
    const result = await apiJson<MpConnection>("/api/mercadopago/connect/fees", {
      method: "PATCH",
      body: JSON.stringify(patch),
      accessToken: await accessToken(),
    });
    if (!result.ok) {
      setError(result.data.error || "Não foi possível salvar as taxas.");
      return null;
    }
    setConnection(result.data);
    return result.data;
  }

  async function disconnect() {
    setBusy(true);
    setError(null);
    const result = await apiJson<MpConnection>("/api/mercadopago/connect", {
      method: "DELETE",
      accessToken: await accessToken(),
    });
    if (!result.ok) {
      setError(result.data.error || "Não foi possível desconectar.");
      setBusy(false);
      return;
    }
    setConnection(result.data);
    setBusy(false);
  }

  return (
    <section className="dash-card mx-5 mt-6 rounded-3xl border border-paper/10 p-4 lg:p-7">
      <p className="text-[11px] uppercase tracking-[0.16em] text-mute">Recebimento</p>
      <h2 className="mt-2 font-serif text-3xl">Mercado Pago</h2>
      <p className="mt-2 text-sm leading-6 text-mute">
        O cliente paga direto na sua conta, com Pix ou cartão. A taxa de serviço de {PLATFORM_FEE_PERCENT}% da Shopwag é paga
        pelo cliente, à parte do valor dos seus produtos.
      </p>
      {notice && !error ? (
        <p className={`mt-3 text-sm ${notice.ok ? "text-ok" : "text-danger"}`}>{notice.text}</p>
      ) : null}
      {error ? <p className="mt-3 text-sm text-danger">{error}</p> : null}
      {connection.connected ? (
        <div className="mt-4 space-y-3">
          <p className="text-sm font-medium text-ok">
            Conta conectada
            {connection.live_mode === false ? " (modo de teste, sem cobrança real)" : ""}
          </p>
          <Button type="button" variant="danger-line" disabled={busy} onClick={() => void disconnect()}>
            Desconectar
          </Button>
        </div>
      ) : (
        <Button type="button" variant="info" className="mt-4 w-full lg:w-auto lg:px-10" disabled={busy || !connection.available} onClick={() => void connect()}>
          {busy ? "Abrindo…" : "Conectar Mercado Pago"}
        </Button>
      )}
      {connection.fees ? <MpFees fees={connection.fees} save={saveFees} /> : null}
      {!connection.available && !error ? (
        <p className="mt-3 text-xs leading-5 text-mute">
          A conexão com o Mercado Pago estará disponível em breve. Enquanto isso, combine o pagamento com o cliente pelo
          WhatsApp.
        </p>
      ) : null}
    </section>
  );
}
