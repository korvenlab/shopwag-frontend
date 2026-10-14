"use client";

import { useEffect, useState } from "react";
import { asPayMethod } from "@/components/store/pay-method";
import { StoreLink } from "@/components/store/store-link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { Recibo } from "@/features/domain/types";
import { methodLabel, paymentLabel } from "@/features/orders/labels";
import { apiJson } from "@/lib/api";
import { formatBRL } from "@/lib/money";
import { formatCep, formatPhone, whatsappHref } from "@/lib/phone";

export function ReceiptView({
  receipt,
  token,
  payError,
}: {
  receipt: Recibo;
  token: string;
  payError: string | null;
}) {
  const [status, setStatus] = useState(receipt.status_pagamento);
  const [opening, setOpening] = useState(false);
  const [error, setError] = useState(payError);
  const address = receipt.endereco;
  const charged = receipt.total_centavos + receipt.taxa_cliente_centavos;
  const canPay = (status === "pending" || status === "failed") && receipt.loja.mp_status === "connected";
  const message = `Olá, ${receipt.loja.nome}. Pedido ${receipt.id.slice(0, 8)} no valor de ${formatBRL(charged)}.`;

  useEffect(() => {
    if (status !== "pending") return;
    let stopped = false;
    async function poll() {
      const query = new URLSearchParams({ pedido: receipt.id, t: token });
      const result = await apiJson<{ status_pagamento?: Recibo["status_pagamento"] }>(
        `/api/mercadopago/status?${query.toString()}`,
      );
      if (!result.ok || stopped) return;
      if (result.data.status_pagamento) setStatus(result.data.status_pagamento);
    }
    void poll();
    const timer = window.setInterval(() => void poll(), 5000);
    return () => {
      stopped = true;
      window.clearInterval(timer);
    };
  }, [receipt.id, status, token]);

  async function openCheckout() {
    setOpening(true);
    setError(null);
    const result = await apiJson<{ url?: string | null; paid?: boolean }>("/api/mercadopago/checkout", {
      method: "POST",
      body: JSON.stringify({ pedido_id: receipt.id, token, metodo: asPayMethod(receipt.metodo_pagamento) }),
    });
    if (result.ok && result.data.url) {
      window.location.assign(result.data.url);
      return;
    }
    if (result.ok && result.data.paid) setStatus("paid");
    else setError(result.data.error || "Não conseguimos abrir o pagamento agora. Tente de novo em instantes.");
    setOpening(false);
  }

  return (
    <div className="mx-auto max-w-xl px-5 pt-8 md:pt-12">
      <p className="text-[11px] uppercase tracking-[0.22em] text-mute">{receipt.loja.nome}</p>
      <h1 className="mt-3 font-serif text-4xl leading-none">
        {status === "paid" ? "Pagamento confirmado" : status === "failed" ? "Pagamento recusado" : "Pedido recebido"}
      </h1>
      <div className="mt-4">
        <Badge tone={status === "paid" ? "solid" : "line"}>{paymentLabel[status]}</Badge>
      </div>

      <section className="mt-8 rounded-3xl border border-paper/15 p-4">
        <h2 className="text-[11px] uppercase tracking-[0.16em] text-mute">
          {methodLabel[receipt.metodo_pagamento] ?? "Pagamento"}
        </h2>
        <p className="mt-3 text-sm leading-6 text-mute">
          {status === "paid"
            ? "O Mercado Pago confirmou este pagamento."
            : status === "failed"
              ? "O pagamento não foi aprovado. Tente de novo ou fale com a loja pelo WhatsApp."
              : "Se você já pagou, a confirmação aparece aqui em instantes. Esta página atualiza sozinha."}
        </p>
        {error ? <p className="mt-3 text-sm text-[#ff8d8d]">{error}</p> : null}
        {canPay ? (
          <Button type="button" className="mt-4 w-full" disabled={opening} onClick={() => void openCheckout()}>
            {opening ? "Abrindo o Mercado Pago…" : status === "failed" ? "Tentar de novo no Mercado Pago" : "Pagar no Mercado Pago"}
          </Button>
        ) : null}
        <p className="mt-4 font-serif text-3xl">{formatBRL(charged)}</p>
        {receipt.taxa_cliente_centavos > 0 || receipt.frete_centavos > 0 ? (
          <p className="mt-1 text-xs text-mute">
            Produtos {formatBRL(receipt.subtotal_centavos)}
            {receipt.frete_centavos > 0 ? ` + frete ${formatBRL(receipt.frete_centavos)}` : ""}
            {receipt.taxa_plataforma_centavos > 0 ? ` + taxa de serviço ${formatBRL(receipt.taxa_plataforma_centavos)}` : ""}
            {receipt.taxa_cliente_centavos > receipt.taxa_plataforma_centavos
              ? ` + taxa do cartão ${formatBRL(receipt.taxa_cliente_centavos - receipt.taxa_plataforma_centavos)}`
              : ""}
          </p>
        ) : null}
      </section>

      <section className="mt-6">
        <h2 className="text-[11px] uppercase tracking-[0.16em] text-mute">Itens</h2>
        <ul className="mt-3 divide-y divide-paper/10">
          {receipt.itens.map((item, index) => (
            <li key={`${item.nome_produto}-${index}`} className="flex justify-between gap-3 py-3 text-sm">
              <span>
                {item.quantidade}× {item.nome_produto}
                {item.variacao_label ? <span className="block text-xs text-mute">{item.variacao_label}</span> : null}
              </span>
              <span>{formatBRL(item.total_item_centavos)}</span>
            </li>
          ))}
        </ul>
      </section>

      <section className="mt-6 text-sm leading-6">
        <h2 className="text-[11px] uppercase tracking-[0.16em] text-mute">
          {receipt.tipo_entrega === "retirada" ? "Retirada na loja" : "Entrega"}
        </h2>
        <p className="mt-3">{receipt.nome_completo}</p>
        <p className="text-mute">{formatPhone(receipt.whatsapp)}</p>
        {receipt.tipo_entrega === "retirada" ? (
          <p className="mt-2">
            {receipt.loja.retirada_endereco || "A loja vai combinar o local de retirada com você pelo WhatsApp."}
          </p>
        ) : (
          <p className="mt-2">
            {address.rua}, {address.numero}
            {address.complemento ? ` — ${address.complemento}` : ""}
            <br />
            {address.bairro}, {address.cidade}/{address.estado}
            <br />
            {formatCep(address.cep)}
          </p>
        )}
      </section>

      {receipt.loja.whatsapp ? (
        <Button asChild className="mt-8 w-full">
          <a href={whatsappHref(receipt.loja.whatsapp, message)} target="_blank" rel="noreferrer">
            Avisar a loja no WhatsApp
          </a>
        </Button>
      ) : null}
      <Button asChild variant="ghost" className="mt-3 w-full">
        <StoreLink slug={receipt.loja.slug}>Voltar à vitrine</StoreLink>
      </Button>
    </div>
  );
}
