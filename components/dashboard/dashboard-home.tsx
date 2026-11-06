"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { AlertTriangle, CreditCard, PackageCheck, Wallet } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import type { Loja, Pedido } from "@/features/domain/types";
import { fulfillmentLabel, fulfillmentTone, paymentLabel, paymentTone } from "@/features/orders/labels";
import { formatBRL } from "@/lib/money";
import { formatPhone } from "@/lib/phone";

type Filter = "todos" | "receber" | "preparar";

function shippingIncomplete(store: Loja, rangeCount: number) {
  if (!store.entrega_ativa && !store.retirada_ativa) return true;
  if (store.retirada_ativa && !store.retirada_endereco?.trim()) return true;
  if (store.entrega_ativa && store.frete_padrao_centavos == null && rangeCount === 0) return true;
  return false;
}

function needsPrepare(order: Pedido) {
  return order.status_pagamento === "paid" && (order.status_pedido === "new" || order.status_pedido === "preparing");
}

export function DashboardHome({
  store,
  orders,
  shippingRangeCount,
}: {
  store: Loja;
  orders: Pedido[];
  shippingRangeCount: number;
}) {
  const [filter, setFilter] = useState<Filter>("todos");
  const awaiting = useMemo(() => orders.filter((order) => order.status_pagamento === "pending"), [orders]);
  const prepare = useMemo(() => orders.filter(needsPrepare), [orders]);
  const mpOk = store.mp_status === "connected";
  const freteOk = !shippingIncomplete(store, shippingRangeCount);

  const visible = filter === "receber" ? awaiting : filter === "preparar" ? prepare : orders;

  return (
    <div className="px-5 pt-6">
      <h1 className="font-serif text-4xl">Início</h1>
      <p className="mt-2 text-sm text-mute">Resumo do dia e pedidos da loja.</p>

      <div className="mt-5 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <SummaryCard
          active={filter === "receber"}
          onClick={() => setFilter(filter === "receber" ? "todos" : "receber")}
          icon={<Wallet size={16} />}
          label="A receber"
          value={String(awaiting.length)}
          hint="Pagamento pendente"
        />
        <SummaryCard
          active={filter === "preparar"}
          onClick={() => setFilter(filter === "preparar" ? "todos" : "preparar")}
          icon={<PackageCheck size={16} />}
          label="Preparar"
          value={String(prepare.length)}
          hint="Pagos, ainda não enviados"
        />
        <SummaryLink
          href="/dashboard/loja"
          icon={<CreditCard size={16} />}
          label="Mercado Pago"
          value={mpOk ? "Conectado" : "Atenção"}
          hint={mpOk ? "Recebendo na conta" : "Conectar para vender"}
          warn={!mpOk}
        />
        <SummaryLink
          href="/dashboard/vitrine#entrega"
          icon={<AlertTriangle size={16} />}
          label="Frete"
          value={freteOk ? "Ok" : "Incompleto"}
          hint={freteOk ? "Entrega configurada" : "Ajustar entrega ou retirada"}
          warn={!freteOk}
        />
      </div>

      <div className="mt-8 flex items-end justify-between gap-3">
        <h2 className="font-serif text-3xl">Pedidos</h2>
        {filter !== "todos" ? (
          <button type="button" onClick={() => setFilter("todos")} className="text-xs text-mute underline-offset-4 hover:underline">
            Ver todos
          </button>
        ) : null}
      </div>

      {visible.length === 0 ? (
        <p className="mt-5 text-sm leading-6 text-mute">
          {orders.length === 0
            ? "Quando um cliente fechar a compra, o pagamento, o WhatsApp e o endereço aparecem aqui."
            : filter === "receber"
              ? "Nenhum pedido aguardando pagamento."
              : "Nenhum pedido pago para preparar agora."}
        </p>
      ) : (
        <ul className="mt-5 space-y-3 lg:grid lg:grid-cols-2 lg:gap-3 lg:space-y-0">
          {visible.map((order) => (
            <li key={order.id}>
              <Link
                href={`/dashboard/pedidos/${order.id}`}
                className="dash-card block h-full rounded-3xl border border-paper/10 p-4 transition hover:border-paper/30"
              >
                <div className="flex items-center justify-between gap-3">
                  <span className="flex flex-wrap gap-1.5">
                    <Badge tone={paymentTone[order.status_pagamento]}>{paymentLabel[order.status_pagamento]}</Badge>
                    <Badge tone={fulfillmentTone[order.status_pedido]}>{fulfillmentLabel[order.status_pedido]}</Badge>
                  </span>
                  <span className="font-serif text-xl">{formatBRL(order.total_centavos)}</span>
                </div>
                <p className="mt-3 text-sm">{order.nome_completo}</p>
                <p className="text-sm text-mute">{formatPhone(order.whatsapp)}</p>
                <p className="mt-2 text-xs text-mute">
                  {order.tipo_entrega === "retirada" ? "Retirada na loja" : `${order.cidade}/${order.estado}`} ·{" "}
                  {order.itens_pedido.length} {order.itens_pedido.length === 1 ? "item" : "itens"}
                </p>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function SummaryCard({
  active,
  onClick,
  icon,
  label,
  value,
  hint,
}: {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
  value: string;
  hint: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`dash-card rounded-3xl border p-4 text-left transition ${
        active ? "border-paper/40 bg-paper/5" : "border-paper/10 hover:border-paper/25"
      }`}
    >
      <span className="inline-flex items-center gap-1.5 text-[11px] uppercase tracking-[0.14em] text-mute">
        {icon}
        {label}
      </span>
      <p className="mt-2 font-serif text-3xl leading-none">{value}</p>
      <p className="mt-2 text-xs text-mute">{hint}</p>
    </button>
  );
}

function SummaryLink({
  href,
  icon,
  label,
  value,
  hint,
  warn,
}: {
  href: string;
  icon: React.ReactNode;
  label: string;
  value: string;
  hint: string;
  warn?: boolean;
}) {
  return (
    <Link
      href={href}
      className={`dash-card rounded-3xl border p-4 transition hover:border-paper/25 ${
        warn ? "border-warn/40" : "border-paper/10"
      }`}
    >
      <span className="inline-flex items-center gap-1.5 text-[11px] uppercase tracking-[0.14em] text-mute">
        {icon}
        {label}
      </span>
      <p className={`mt-2 font-serif text-2xl leading-none ${warn ? "text-warn" : ""}`}>{value}</p>
      <p className="mt-2 text-xs text-mute">{hint}</p>
    </Link>
  );
}
