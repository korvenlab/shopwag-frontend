"use client";

import { useSyncExternalStore } from "react";
import type { Loja } from "@/features/domain/types";
import { storeStatus } from "@/lib/hours";

type NoticeStore = Pick<Loja, "aviso_topo" | "fechada" | "mensagem_fechada" | "horario_ativo" | "horarios">;

const subscribe = (onChange: () => void) => {
  const timer = window.setInterval(onChange, 60_000);
  return () => window.clearInterval(timer);
};

/** Faixa no topo: aviso do lojista e situação da loja (aberta/fechada), calculada no navegador. */
export function StoreNotice({ store }: { store: NoticeStore }) {
  const minute = useSyncExternalStore(
    subscribe,
    () => Math.floor(Date.now() / 60_000),
    () => 0,
  );
  const status = minute ? storeStatus(store, new Date(minute * 60_000)) : null;
  const closed = status && !status.open ? status.label : null;
  const aviso = store.aviso_topo?.trim();

  if (!closed && !aviso) return null;

  return (
    <div
      className={`page-enter px-4 py-2 text-center text-xs leading-5 md:text-sm ${
        closed ? "bg-[#3a1d1d] text-[#ffd6d6]" : "bg-accent text-on-accent"
      }`}
    >
      {closed ?? aviso}
      {closed && aviso ? <span className="opacity-70"> · {aviso}</span> : null}
    </div>
  );
}
