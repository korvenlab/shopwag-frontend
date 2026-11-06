"use client";

import { useState } from "react";
import { ArrowDown, ArrowUp } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import type { Loja } from "@/features/domain/types";
import {
  STORE_SECTION_LABELS,
  defaultStoreSections,
  normalizeStoreSections,
  type StoreSection,
} from "@/lib/storefront";
import { cn } from "@/lib/cn";
import { Field, Group, SaveBar, Section, emptyToNull, useStoreSave } from "./settings-ui";

function toDatetimeLocal(value: string | null) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  const offset = date.getTimezoneOffset();
  const local = new Date(date.getTime() - offset * 60_000);
  return local.toISOString().slice(0, 16);
}

function fromDatetimeLocal(value: string) {
  if (!value.trim()) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return date.toISOString();
}

export function StoreLanding({ store }: { store: Loja }) {
  const [headline, setHeadline] = useState(store.headline ?? "");
  const [subtitulo, setSubtitulo] = useState(store.subtitulo ?? "");
  const [promoTexto, setPromoTexto] = useState(store.promo_texto ?? "");
  const [promoAte, setPromoAte] = useState(toDatetimeLocal(store.promo_ate));
  const [secoes, setSecoes] = useState<StoreSection[]>(
    normalizeStoreSections(store.secoes?.length ? store.secoes : defaultStoreSections()),
  );
  const { pending, message, setMessage, save } = useStoreSave(store.id, "Landing salva. Já aparece na vitrine.");

  function move(index: number, delta: number) {
    setSecoes((current) => {
      const next = [...current];
      const target = index + delta;
      if (target < 0 || target >= next.length) return current;
      [next[index], next[target]] = [next[target], next[index]];
      return next;
    });
  }

  function onSave() {
    const head = headline.trim();
    const sub = subtitulo.trim();
    const promo = promoTexto.trim();
    if (head && head.length < 2) return setMessage({ ok: false, text: "A headline precisa ter pelo menos 2 caracteres." });
    if (sub && sub.length < 2) return setMessage({ ok: false, text: "O subtítulo precisa ter pelo menos 2 caracteres." });
    if (promo && promo.length < 2) return setMessage({ ok: false, text: "A faixa promo precisa ter pelo menos 2 caracteres." });
    void save({
      headline: emptyToNull(head),
      subtitulo: emptyToNull(sub),
      promo_texto: emptyToNull(promo),
      promo_ate: promo ? fromDatetimeLocal(promoAte) : null,
      secoes,
    });
  }

  return (
    <Section
      id="landing"
      eyebrow="Landing"
      title="Textos e seções da home"
      description="Headline, subtítulo, faixa promocional e a ordem do que aparece na vitrine."
    >
      <Group title="Primeira dobra">
        <Field label="Headline" htmlFor="headline">
          <Input
            id="headline"
            value={headline}
            maxLength={80}
            placeholder="Ex.: Escolha seu manto"
            onChange={(event) => setHeadline(event.target.value)}
          />
        </Field>
        <Field label="Subtítulo" htmlFor="subtitulo">
          <Textarea
            id="subtitulo"
            value={subtitulo}
            maxLength={180}
            placeholder="Uma frase curta sob o título"
            onChange={(event) => setSubtitulo(event.target.value)}
          />
        </Field>
        <p className="text-xs text-mute">Se ficar vazio, a vitrine usa o nome da loja e a descrição.</p>
      </Group>

      <Group title="Faixa promocional">
        <Field label="Texto da faixa" htmlFor="promo">
          <Input
            id="promo"
            value={promoTexto}
            maxLength={120}
            placeholder="Ex.: Frete grátis até domingo"
            onChange={(event) => setPromoTexto(event.target.value)}
          />
        </Field>
        <Field label="Válida até (opcional)" htmlFor="promo-ate">
          <Input id="promo-ate" type="datetime-local" value={promoAte} onChange={(event) => setPromoAte(event.target.value)} />
        </Field>
        <p className="text-xs text-mute">Depois do prazo, a faixa some sozinha. O aviso fixo do topo continua em Banners.</p>
      </Group>

      <Group title="Seções da home">
        <ul className="space-y-2">
          {secoes.map((section, index) => (
            <li key={section.id} className="flex items-center gap-2 rounded-2xl border border-paper/10 px-3 py-2">
              <div className="min-w-0 flex-1">
                <p className="text-sm">{STORE_SECTION_LABELS[section.id]}</p>
                <p className="text-xs text-mute">{section.on ? "Visível na home" : "Oculta"}</p>
              </div>
              <button
                type="button"
                role="switch"
                aria-checked={section.on}
                aria-label={`${section.on ? "Desligar" : "Ligar"} ${STORE_SECTION_LABELS[section.id]}`}
                onClick={() =>
                  setSecoes((current) => current.map((item) => (item.id === section.id ? { ...item, on: !item.on } : item)))
                }
                className={cn(
                  "relative h-7 w-12 shrink-0 rounded-full border transition",
                  section.on ? "border-ok bg-ok" : "border-paper/25 bg-paper/5",
                )}
              >
                <span
                  className={cn(
                    "absolute top-1/2 size-5 -translate-y-1/2 rounded-full transition-all",
                    section.on ? "left-[calc(100%-1.4rem)] bg-white" : "left-1 bg-paper/60",
                  )}
                />
              </button>
              <button
                type="button"
                aria-label={`Subir ${STORE_SECTION_LABELS[section.id]}`}
                disabled={index === 0}
                onClick={() => move(index, -1)}
                className="grid h-9 w-9 place-items-center rounded-full text-mute transition hover:text-paper disabled:opacity-30"
              >
                <ArrowUp size={15} />
              </button>
              <button
                type="button"
                aria-label={`Descer ${STORE_SECTION_LABELS[section.id]}`}
                disabled={index === secoes.length - 1}
                onClick={() => move(index, 1)}
                className="grid h-9 w-9 place-items-center rounded-full text-mute transition hover:text-paper disabled:opacity-30"
              >
                <ArrowDown size={15} />
              </button>
            </li>
          ))}
        </ul>
      </Group>

      <SaveBar pending={pending} message={message} label="Salvar landing" onSave={onSave} />
    </Section>
  );
}
