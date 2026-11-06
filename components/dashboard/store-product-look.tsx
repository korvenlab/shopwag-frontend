"use client";

import { useState } from "react";
import { ArrowDown, ArrowUp } from "lucide-react";
import type { Loja } from "@/features/domain/types";
import {
  BADGE_MODOS,
  CARD_LAYOUTS,
  PRODUCT_BLOCK_LABELS,
  asBadgeModo,
  asCardLayout,
  defaultProductBlocks,
  normalizeProductBlocks,
  type BadgeModo,
  type CardLayout,
  type ProductBlock,
} from "@/lib/storefront";
import { cn } from "@/lib/cn";
import { Group, SaveBar, Section, useStoreSave } from "./settings-ui";

export function StoreProductLook({ store }: { store: Loja }) {
  const [cardLayout, setCardLayout] = useState<CardLayout>(asCardLayout(store.card_layout));
  const [cardHover, setCardHover] = useState(store.card_hover !== false);
  const [badgeModo, setBadgeModo] = useState<BadgeModo>(asBadgeModo(store.badge_modo));
  const [blocos, setBlocos] = useState<ProductBlock[]>(
    normalizeProductBlocks(store.produto_blocos?.length ? store.produto_blocos : defaultProductBlocks()),
  );
  const { pending, message, save } = useStoreSave(store.id, "Visual de produtos salvo.");

  function move(index: number, delta: number) {
    setBlocos((current) => {
      const next = [...current];
      const target = index + delta;
      if (target < 0 || target >= next.length) return current;
      [next[index], next[target]] = [next[target], next[index]];
      return next;
    });
  }

  return (
    <Section
      id="produtos"
      eyebrow="Produtos"
      title="Cards e página do produto"
      description="Layout do card, selos, hover e a ordem dos blocos na página da peça."
    >
      <Group title="Layout do card">
        <div className="grid gap-2 sm:grid-cols-3">
          {CARD_LAYOUTS.map((item) => {
            const active = cardLayout === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setCardLayout(item.id)}
                className={cn(
                  "rounded-2xl border p-3 text-left transition",
                  active ? "border-paper bg-paper/5" : "border-paper/10 hover:border-paper/40",
                )}
              >
                <span className="block text-sm">{item.label}</span>
                <span className="mt-1 block text-xs leading-5 text-mute">{item.blurb}</span>
              </button>
            );
          })}
        </div>
        <label className="mt-3 flex cursor-pointer items-center justify-between gap-3 rounded-2xl border border-paper/10 px-4 py-3">
          <span className="text-sm">
            Efeito hover no card
            <span className="mt-0.5 block text-xs text-mute">Troca de foto, zoom e botão Comprar no desktop.</span>
          </span>
          <input
            type="checkbox"
            checked={cardHover}
            onChange={(event) => setCardHover(event.target.checked)}
            className="h-5 w-5 shrink-0 accent-[var(--color-accent)]"
          />
        </label>
      </Group>

      <Group title="Selo no card">
        <div className="grid gap-2 sm:grid-cols-2">
          {BADGE_MODOS.map((item) => {
            const active = badgeModo === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setBadgeModo(item.id)}
                className={cn(
                  "rounded-2xl border p-3 text-left transition",
                  active ? "border-paper bg-paper/5" : "border-paper/10 hover:border-paper/40",
                )}
              >
                <span className="block text-sm">{item.label}</span>
                <span className="mt-1 block text-xs leading-5 text-mute">{item.blurb}</span>
              </button>
            );
          })}
        </div>
      </Group>

      <Group title="Blocos da página do produto">
        <ul className="space-y-2">
          {blocos.map((block, index) => (
            <li key={block.id} className="flex items-center gap-2 rounded-2xl border border-paper/10 px-3 py-2">
              <div className="min-w-0 flex-1">
                <p className="text-sm">{PRODUCT_BLOCK_LABELS[block.id]}</p>
                <p className="text-xs text-mute">{block.on ? "Visível" : "Oculto"}</p>
              </div>
              <button
                type="button"
                role="switch"
                aria-checked={block.on}
                aria-label={`${block.on ? "Desligar" : "Ligar"} ${PRODUCT_BLOCK_LABELS[block.id]}`}
                onClick={() =>
                  setBlocos((current) =>
                    current.map((item) => (item.id === block.id ? { ...item, on: !item.on } : item)),
                  )
                }
                className={cn(
                  "relative h-7 w-12 shrink-0 rounded-full border transition",
                  block.on ? "border-ok bg-ok" : "border-paper/25 bg-paper/5",
                )}
              >
                <span
                  className={cn(
                    "absolute top-1/2 size-5 -translate-y-1/2 rounded-full transition-all",
                    block.on ? "left-[calc(100%-1.4rem)] bg-white" : "left-1 bg-paper/60",
                  )}
                />
              </button>
              <button
                type="button"
                aria-label={`Subir ${PRODUCT_BLOCK_LABELS[block.id]}`}
                disabled={index === 0}
                onClick={() => move(index, -1)}
                className="grid h-9 w-9 place-items-center rounded-full text-mute transition hover:text-paper disabled:opacity-30"
              >
                <ArrowUp size={15} />
              </button>
              <button
                type="button"
                aria-label={`Descer ${PRODUCT_BLOCK_LABELS[block.id]}`}
                disabled={index === blocos.length - 1}
                onClick={() => move(index, 1)}
                className="grid h-9 w-9 place-items-center rounded-full text-mute transition hover:text-paper disabled:opacity-30"
              >
                <ArrowDown size={15} />
              </button>
            </li>
          ))}
        </ul>
        <p className="text-xs text-mute">Fotos ficam à esquerda no desktop; os demais blocos montam a coluna de compra.</p>
      </Group>

      <SaveBar
        pending={pending}
        message={message}
        label="Salvar produtos"
        onSave={() =>
          void save({
            card_layout: cardLayout,
            card_hover: cardHover,
            badge_modo: badgeModo,
            produto_blocos: blocos,
          })
        }
      />
    </Section>
  );
}
