"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { updateOrderStatus } from "@/features/merchant/actions";
import type { Pedido } from "@/features/domain/types";
import {
  formatAddress,
  fulfillmentLabel,
  fulfillmentTone,
  methodLabel,
  paymentLabel,
  paymentTone,
} from "@/features/orders/labels";
import { formatBRL } from "@/lib/money";
import { formatPhone, whatsappHref } from "@/lib/phone";

export function OrderManager({ order }: { order: Pedido }) {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function save(statusPagamento: Pedido["status_pagamento"], statusPedido: Pedido["status_pedido"]) {
    setPending(true);
    setError(null);
    try {
      const result = await updateOrderStatus(order.id, statusPagamento, statusPedido);
      if (result.error) setError(result.error);
      else router.refresh();
    } catch {
      setError("Sem conexão. Confira a internet e tente de novo.");
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="px-5 pt-6">
      <p className="text-[11px] uppercase tracking-[0.18em] text-mute">Pedido</p>
      <h1 className="mt-2 font-serif text-4xl leading-none">{order.nome_completo}</h1>
      <div className="mt-4 flex flex-wrap gap-2">
        <Badge tone={paymentTone[order.status_pagamento]}>{paymentLabel[order.status_pagamento]}</Badge>
        <Badge tone={fulfillmentTone[order.status_pedido]}>{fulfillmentLabel[order.status_pedido]}</Badge>
        <Badge tone="line">{methodLabel[order.metodo_pagamento] ?? "Pix"}</Badge>
      </div>

      <a
        href={whatsappHref(order.whatsapp, `Olá, ${order.nome_completo}. Sobre o seu pedido na loja.`)}
        target="_blank"
        rel="noreferrer"
        className="mt-5 block text-sm underline underline-offset-4"
      >
        WhatsApp {formatPhone(order.whatsapp)}
      </a>

      <div className="lg:grid lg:grid-cols-[minmax(0,1fr)_300px] lg:items-start lg:gap-10">
        <div className="dash-card mt-6 rounded-3xl border border-paper/10 p-4 lg:p-6">
          <section>
            <h2 className="text-[11px] uppercase tracking-[0.16em] text-mute">
              {order.tipo_entrega === "retirada" ? "Retirada" : "Endereço de entrega"}
            </h2>
            <p className="mt-2 text-sm leading-6">
              {order.tipo_entrega === "retirada" ? "O cliente vai retirar na loja." : formatAddress(order)}
            </p>
            {order.observacoes ? <p className="mt-2 text-sm text-mute">{order.observacoes}</p> : null}
          </section>

          <section className="mt-6">
            <h2 className="text-[11px] uppercase tracking-[0.16em] text-mute">Itens</h2>
            <ul className="mt-2 divide-y divide-paper/10">
              {order.itens_pedido.map((item) => (
                <li key={item.id} className="flex justify-between gap-3 py-3 text-sm">
                  <span>
                    {item.quantidade}× {item.nome_produto}
                    {item.variacao_label ? <span className="block text-xs text-mute">{item.variacao_label}</span> : null}
                  </span>
                  <span>{formatBRL(item.total_item_centavos)}</span>
                </li>
              ))}
            </ul>
            {order.frete_centavos > 0 ? (
              <div className="flex justify-between border-t border-paper/10 py-3 text-sm">
                <span className="text-mute">Frete</span>
                <span>{formatBRL(order.frete_centavos)}</span>
              </div>
            ) : null}
            <div className="mt-3 flex justify-between border-t border-paper/10 pt-3">
              <span className="text-sm text-mute">Total</span>
              <span className="font-serif text-2xl">{formatBRL(order.total_centavos)}</span>
            </div>
            {order.taxa_cliente_centavos > 0 ? (
              <p className="mt-2 text-xs text-mute">
                Cliente pagou {formatBRL(order.total_centavos + order.taxa_cliente_centavos)}
                {order.taxa_plataforma_centavos > 0 ? `, com taxa de serviço de ${formatBRL(order.taxa_plataforma_centavos)}` : ""}
                {order.taxa_cliente_centavos > order.taxa_plataforma_centavos
                  ? ` e taxa do Mercado Pago de ${formatBRL(order.taxa_cliente_centavos - order.taxa_plataforma_centavos)}`
                  : ""}
              </p>
            ) : null}
          </section>
        </div>

        <section className="dash-card mt-6 space-y-2 rounded-3xl border border-paper/10 p-4 lg:sticky lg:top-6 lg:p-5">
          <h2 className="text-[11px] uppercase tracking-[0.16em] text-mute">Pagamento</h2>
          <div className="grid grid-cols-2 gap-2">
            <Button
              type="button"
              variant="success"
              disabled={pending || order.status_pagamento === "paid"}
              onClick={() => save("paid", order.status_pedido)}
            >
              Marcar pago
            </Button>
            <Button
              type="button"
              variant="ghost"
              disabled={pending || order.status_pagamento === "pending"}
              onClick={() => save("pending", order.status_pedido)}
            >
              Aguardando
            </Button>
          </div>
          <h2 className="pt-3 text-[11px] uppercase tracking-[0.16em] text-mute">Entrega</h2>
          <div className="grid grid-cols-2 gap-2">
            {(["preparing", "shipped", "delivered", "cancelled"] as const).map((status) => {
              const current = order.status_pedido === status;
              return (
                <Button
                  key={status}
                  type="button"
                  variant={status === "cancelled" ? (current ? "danger" : "danger-line") : current ? "solid" : "ghost"}
                  disabled={pending || current}
                  aria-pressed={current}
                  onClick={() => save(order.status_pagamento, status)}
                  className={current ? "disabled:opacity-100" : undefined}
                >
                  {fulfillmentLabel[status]}
                </Button>
              );
            })}
          </div>
        </section>
      </div>
      {error ? <p className="mt-4 text-sm text-danger">{error}</p> : null}
    </div>
  );
}
