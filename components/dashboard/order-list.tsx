import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import type { Pedido } from "@/features/domain/types";
import { paymentLabel } from "@/features/orders/labels";
import { formatBRL } from "@/lib/money";
import { formatPhone } from "@/lib/phone";

export function OrderList({ orders }: { orders: Pedido[] }) {
  if (orders.length === 0) {
    return (
      <div className="px-5 pt-8">
        <h1 className="font-serif text-4xl">Nenhum pedido</h1>
        <p className="mt-3 text-sm leading-6 text-mute">
          Quando um cliente fechar a compra, o pagamento, o WhatsApp e o endereço aparecem aqui.
        </p>
      </div>
    );
  }

  return (
    <div className="px-5 pt-6">
      <h1 className="font-serif text-4xl">Pedidos</h1>
      <ul className="mt-5 space-y-3 lg:grid lg:grid-cols-2 lg:gap-3 lg:space-y-0">
        {orders.map((order) => (
          <li key={order.id}>
            <Link href={`/dashboard/pedidos/${order.id}`} className="block h-full rounded-3xl border border-white/15 p-4 transition hover:border-white/40">
              <div className="flex items-center justify-between gap-3">
                <Badge tone={order.status_pagamento === "paid" ? "solid" : "line"}>
                  {paymentLabel[order.status_pagamento]}
                </Badge>
                <span className="font-serif text-xl">{formatBRL(order.total_centavos)}</span>
              </div>
              <p className="mt-3 text-sm">{order.nome_completo}</p>
              <p className="text-sm text-mute">{formatPhone(order.whatsapp)}</p>
              <p className="mt-2 text-xs text-mute">
                {order.tipo_entrega === "retirada" ? "Retirada na loja" : `${order.cidade}/${order.estado}`} ·{" "}
                {order.itens_pedido.length}{" "}
                {order.itens_pedido.length === 1 ? "item" : "itens"}
              </p>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
