"use client";

import { useSyncExternalStore } from "react";
import type { Loja } from "@/features/domain/types";
import { storeStatus } from "@/lib/hours";
import { formatPromoDeadline, promoIsActive } from "@/lib/storefront";

type NoticeStore = Pick<
  Loja,
  | "aviso_topo"
  | "fechada"
  | "mensagem_fechada"
  | "horario_ativo"
  | "horarios"
  | "promo_texto"
  | "promo_ate"
>;

const subscribe = (onChange: () => void) => {
  const timer = window.setInterval(onChange, 60_000);
  return () => window.clearInterval(timer);
};

/** Faixa no topo: promo com prazo, aviso do lojista e loja fechada. */
export function StoreNotice({ store }: { store: NoticeStore }) {
  const minute = useSyncExternalStore(
    subscribe,
    () => Math.floor(Date.now() / 60_000),
    () => 0,
  );
  const now = minute ? new Date(minute * 60_000) : new Date(0);
  const status = minute ? storeStatus(store, now) : null;
  const closed = status && !status.open ? status.label : null;
  const aviso = store.aviso_topo?.trim();
  const promoOn = promoIsActive(store.promo_texto, store.promo_ate, now);
  const promo = promoOn ? store.promo_texto?.trim() : null;
  const deadline = promoOn ? formatPromoDeadline(store.promo_ate) : null;

  if (!closed && !aviso && !promo) return null;

  return (
    <div className="page-enter">
      {promo ? (
        <div className="bg-accent px-4 py-2 text-center text-[11px] leading-5 font-semibold tracking-[0.14em] text-on-accent uppercase md:text-xs">
          {promo}
          {deadline ? <span className="opacity-80"> · até {deadline}</span> : null}
        </div>
      ) : null}
      {closed || aviso ? (
        <div
          className={`px-4 py-2 text-center text-[11px] leading-5 font-semibold tracking-[0.14em] uppercase md:text-xs ${
            closed ? "bg-[#3a1d1d] text-[#ffd6d6]" : "bg-paper text-ink"
          }`}
        >
          {closed ?? aviso}
          {closed && aviso ? <span className="opacity-70"> · {aviso}</span> : null}
        </div>
      ) : null}
    </div>
  );
}
