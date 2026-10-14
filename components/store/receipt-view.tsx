"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { Recibo } from "@/features/domain/types";
import { paymentLabel } from "@/features/orders/labels";
import { apiJson } from "@/lib/api";
import { formatBRL } from "@/lib/money";
import { formatCep, formatPhone, whatsappHref } from "@/lib/phone";

export function ReceiptView({
  receipt,
  token,
  pixError,
}: {
  receipt: Recibo;
  token: string;
  pixError: string | null;
}) {
  const [copied, setCopied] = useState(false);
  const [status, setStatus] = useState(receipt.status_pagamento);
  const address = receipt.endereco;
  const charged = receipt.total_centavos + receipt.taxa_cliente_centavos;
  const pix = receipt.pix_copia_cola;
  const qr = receipt.pix_qr_base64
    ? receipt.pix_qr_base64.startsWith("data:")
      ? receipt.pix_qr_base64
      : `data:image/png;base64,${receipt.pix_qr_base64}`
    : null;
  const message = `Olá, ${receipt.loja.nome}. Pedido ${receipt.id.slice(0, 8)} no valor de ${formatBRL(receipt.total_centavos + receipt.taxa_cliente_centavos)}.`;

  useEffect(() => {
    if (status !== "pending" || !pix) return;
    let stopped = false;
    async function poll() {
      const query = new URLSearchParams({ pedido: receipt.id, t: token });
      const result = await apiJson<{ status_pagamento?: Recibo["status_pagamento"] }>(
        `/api/mercadopago/status?${query.toString()}`,
      );
      if (!result.ok || stopped) return;
      if (result.data.status_pagamento) setStatus(result.data.status_pagamento);
    }
    const timer = window.setInterval(() => void poll(), 4000);
    return () => {
      stopped = true;
      window.clearInterval(timer);
    };
  }, [pix, receipt.id, status, token]);

  async function copyPix() {
    if (!pix) return;
    await navigator.clipboard.writeText(pix);
    setCopied(true);
  }

  return (
    <div className="px-5 pt-8">
      <p className="text-[11px] uppercase tracking-[0.22em] text-mute">{receipt.loja.nome}</p>
      <h1 className="mt-3 font-serif text-4xl leading-none">
        {status === "paid" ? "Pagamento confirmado" : "Pague com Pix"}
      </h1>
      <div className="mt-4">
        <Badge tone={status === "paid" ? "solid" : "line"}>{paymentLabel[status]}</Badge>
      </div>

      <section className="mt-8 rounded-3xl border border-white/15 p-4">
        <h2 className="text-[11px] uppercase tracking-[0.16em] text-mute">Pix</h2>
        {status === "paid" ? (
          <p className="mt-3 text-sm leading-6">O Mercado Pago confirmou este pagamento.</p>
        ) : qr || pix ? (
          <>
            {qr ? (
              // eslint-disable-next-line @next/next/no-img-element -- data URL do QR do Mercado Pago
              <img src={qr} alt="QR Code Pix" className="mx-auto mt-4 w-56 rounded-2xl bg-white p-3" />
            ) : null}
            {pix ? <p className="mt-4 text-xs leading-5 break-all text-mute">{pix}</p> : null}
            <Button type="button" variant="ghost" className="mt-4 w-full" onClick={copyPix}>
              {copied ? "Código copiado" : "Copiar Pix"}
            </Button>
          </>
        ) : (
          <p className="mt-3 text-sm leading-6 text-mute">
            {pixError || "O Pix ainda não foi gerado. A loja precisa estar com o Mercado Pago conectado."}
          </p>
        )}
        <p className="mt-4 font-serif text-3xl">{formatBRL(charged)}</p>
        {receipt.taxa_cliente_centavos > 0 ? (
          <p className="mt-1 text-xs text-mute">
            Produtos {formatBRL(receipt.total_centavos)} + taxas de pagamento {formatBRL(receipt.taxa_cliente_centavos)}
          </p>
        ) : null}
      </section>

      <section className="mt-6">
        <h2 className="text-[11px] uppercase tracking-[0.16em] text-mute">Itens</h2>
        <ul className="mt-3 divide-y divide-white/10">
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
        <h2 className="text-[11px] uppercase tracking-[0.16em] text-mute">Entrega</h2>
        <p className="mt-3">{receipt.nome_completo}</p>
        <p className="text-mute">{formatPhone(receipt.whatsapp)}</p>
        <p className="mt-2">
          {address.rua}, {address.numero}
          {address.complemento ? ` — ${address.complemento}` : ""}
          <br />
          {address.bairro}, {address.cidade}/{address.estado}
          <br />
          {formatCep(address.cep)}
        </p>
      </section>

      {receipt.loja.whatsapp ? (
        <Button asChild className="mt-8 w-full">
          <a href={whatsappHref(receipt.loja.whatsapp, message)} target="_blank" rel="noreferrer">
            Avisar a loja no WhatsApp
          </a>
        </Button>
      ) : null}
      <Button asChild variant="ghost" className="mt-3 w-full">
        <Link href={`/s/${receipt.loja.slug}`}>Voltar à vitrine</Link>
      </Button>
    </div>
  );
}
