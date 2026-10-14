"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { updateOrderStatus } from "@/features/merchant/actions";
import type { Pedido } from "@/features/domain/types";
import { formatAddress, fulfillmentLabel, paymentLabel } from "@/features/orders/labels";
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
      await updateOrderStatus(order.id, statusPagamento, statusPedido);
      router.refresh();
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Não foi possível atualizar");
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="px-5 pt-6">
      <p className="text-[11px] uppercase tracking-[0.18em] text-mute">Pedido</p>
      <h1 className="mt-2 font-serif text-4xl leading-none">{order.nome_completo}</h1>
      <div className="mt-4 flex flex-wrap gap-2">
        <Badge tone={order.status_pagamento === "paid" ? "solid" : "line"}>
          {paymentLabel[order.status_pagamento]}
        </Badge>
        <Badge tone="line">{fulfillmentLabel[order.status_pedido]}</Badge>
      </div>

      <a
        href={whatsappHref(order.whatsapp, `Olá, ${order.nome_completo}. Sobre o seu pedido na loja.`)}
        target="_blank"
        rel="noreferrer"
        className="mt-5 block text-sm underline underline-offset-4"
      >
        WhatsApp {formatPhone(order.whatsapp)}
      </a>

      <section className="mt-6">
        <h2 className="text-[11px] uppercase tracking-[0.16em] text-mute">Endereço de entrega</h2>
        <p className="mt-2 text-sm leading-6">{formatAddress(order)}</p>
        {order.observacoes ? <p className="mt-2 text-sm text-mute">{order.observacoes}</p> : null}
      </section>

      <section className="mt-6">
        <h2 className="text-[11px] uppercase tracking-[0.16em] text-mute">Itens</h2>
        <ul className="mt-2 divide-y divide-white/10">
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
        <div className="mt-3 flex justify-between border-t border-white/10 pt-3">
          <span className="text-sm text-mute">Total</span>
          <span className="font-serif text-2xl">{formatBRL(order.total_centavos)}</span>
        </div>
        {order.taxa_cliente_centavos > 0 ? (
          <p className="mt-2 text-xs text-mute">
            Cliente pagou {formatBRL(order.total_centavos + order.taxa_cliente_centavos)}, com{" "}
            {formatBRL(order.taxa_cliente_centavos)} de taxas repassadas
          </p>
        ) : null}
        {order.taxa_plataforma_centavos > 0 ? (
          <p className="mt-1 text-xs text-mute">Taxa Shopwag {formatBRL(order.taxa_plataforma_centavos)}</p>
        ) : null}
      </section>

      <section className="mt-6 space-y-2">
        <h2 className="text-[11px] uppercase tracking-[0.16em] text-mute">Pagamento</h2>
        <div className="grid grid-cols-2 gap-2">
          <Button type="button" disabled={pending} onClick={() => save("paid", order.status_pedido)}>
            Marcar pago
          </Button>
          <Button type="button" variant="ghost" disabled={pending} onClick={() => save("pending", order.status_pedido)}>
            Aguardando
          </Button>
        </div>
        <h2 className="pt-3 text-[11px] uppercase tracking-[0.16em] text-mute">Entrega</h2>
        <div className="grid grid-cols-2 gap-2">
          {(["preparing", "shipped", "delivered", "cancelled"] as const).map((status) => (
            <Button
              key={status}
              type="button"
              variant="ghost"
              disabled={pending}
              onClick={() => save(order.status_pagamento, status)}
            >
              {fulfillmentLabel[status]}
            </Button>
          ))}
        </div>
      </section>
      {error ? <p className="mt-4 text-sm text-[#ff8d8d]">{error}</p> : null}
    </div>
  );
}
