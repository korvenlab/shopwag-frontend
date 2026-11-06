"use client";

import { useState } from "react";
import { ArrowDown, ArrowUp } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import type { Loja } from "@/features/domain/types";
import {
  LAYOUT_MODOS,
  STORE_SECTION_LABELS,
  asLayoutModo,
  asProvaTipo,
  defaultStoreSections,
  normalizeStoreSections,
  type LayoutModo,
  type ProvaTipo,
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

export function StoreLanding({ store, categories = [] }: { store: Loja; categories?: string[] }) {
  const [headline, setHeadline] = useState(store.headline ?? "");
  const [subtitulo, setSubtitulo] = useState(store.subtitulo ?? "");
  const [ctaTexto, setCtaTexto] = useState(store.cta_texto ?? "");
  const [ctaLink, setCtaLink] = useState(store.cta_link ?? "");
  const [promoTexto, setPromoTexto] = useState(store.promo_texto ?? "");
  const [promoAte, setPromoAte] = useState(toDatetimeLocal(store.promo_ate));
  const [layoutModo, setLayoutModo] = useState<LayoutModo>(asLayoutModo(store.layout_modo));
  const [provaAtiva, setProvaAtiva] = useState(Boolean(store.prova_ativa));
  const [provaTipo, setProvaTipo] = useState<ProvaTipo>(asProvaTipo(store.prova_tipo));
  const [provaTexto, setProvaTexto] = useState(store.prova_texto ?? "");
  const [provaAutor, setProvaAutor] = useState(store.prova_autor ?? "");
  const [colecao, setColecao] = useState(store.colecao_destaque ?? "");
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
    const cta = ctaTexto.trim();
    const link = ctaLink.trim();
    const prova = provaTexto.trim();
    const autor = provaAutor.trim();
    if (head && head.length < 2) return setMessage({ ok: false, text: "A headline precisa ter pelo menos 2 caracteres." });
    if (sub && sub.length < 2) return setMessage({ ok: false, text: "O subtítulo precisa ter pelo menos 2 caracteres." });
    if (promo && promo.length < 2) return setMessage({ ok: false, text: "A faixa promo precisa ter pelo menos 2 caracteres." });
    if (cta && cta.length < 2) return setMessage({ ok: false, text: "O texto do botão precisa ter pelo menos 2 caracteres." });
    if (cta && !link) return setMessage({ ok: false, text: "Informe o link ou âncora do botão (ex.: #categorias)." });
    if (link && !cta) return setMessage({ ok: false, text: "Informe o texto do botão junto com o link." });
    if (provaAtiva && prova.length < 2) {
      return setMessage({ ok: false, text: "A prova social precisa de um texto com pelo menos 2 caracteres." });
    }
    if (provaAtiva && provaTipo === "depoimento" && autor.length < 2) {
      return setMessage({ ok: false, text: "Depoimento precisa de um autor (ex.: Marina, SP)." });
    }
    void save({
      headline: emptyToNull(head),
      subtitulo: emptyToNull(sub),
      cta_texto: emptyToNull(cta),
      cta_link: emptyToNull(link),
      promo_texto: emptyToNull(promo),
      promo_ate: promo ? fromDatetimeLocal(promoAte) : null,
      layout_modo: layoutModo,
      prova_ativa: provaAtiva,
      prova_tipo: provaTipo,
      prova_texto: provaAtiva ? emptyToNull(prova) : null,
      prova_autor: provaAtiva && provaTipo === "depoimento" ? emptyToNull(autor) : null,
      colecao_destaque: emptyToNull(colecao.trim()),
      secoes,
    });
  }

  return (
    <Section
      id="landing"
      eyebrow="Landing"
      title="Textos e seções da home"
      description="Headline, CTA, layout, prova social, coleção em destaque e ordem das seções."
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
        <div className="grid gap-3 sm:grid-cols-2">
          <Field label="Texto do botão (CTA)" htmlFor="cta-texto">
            <Input
              id="cta-texto"
              value={ctaTexto}
              maxLength={40}
              placeholder="Ex.: Ver camisas"
              onChange={(event) => setCtaTexto(event.target.value)}
            />
          </Field>
          <Field label="Link ou âncora" htmlFor="cta-link">
            <Input
              id="cta-link"
              value={ctaLink}
              maxLength={200}
              placeholder="#categorias"
              onChange={(event) => setCtaLink(event.target.value)}
            />
          </Field>
        </div>
        <p className="text-xs text-mute">
          Âncoras: #categorias, #times, #destaques, #promocoes, #catalogo. Também aceita URL completa. Sem CTA, o
          WhatsApp continua como botão principal.
        </p>
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
      </Group>

      <Group title="Modo da grade">
        <div className="grid gap-2 sm:grid-cols-3">
          {LAYOUT_MODOS.map((modo) => {
            const active = layoutModo === modo.id;
            return (
              <button
                key={modo.id}
                type="button"
                onClick={() => setLayoutModo(modo.id)}
                className={cn(
                  "rounded-2xl border p-3 text-left transition",
                  active ? "border-paper bg-paper/5" : "border-paper/10 hover:border-paper/40",
                )}
              >
                <span className="block text-sm">{modo.label}</span>
                <span className="mt-1 block text-xs leading-5 text-mute">{modo.blurb}</span>
              </button>
            );
          })}
        </div>
      </Group>

      <Group title="Coleção em destaque">
        <Field label="Categoria" htmlFor="colecao">
          {categories.length > 0 ? (
            <select
              id="colecao"
              value={colecao}
              onChange={(event) => setColecao(event.target.value)}
              className="h-11 w-full rounded-2xl border border-paper/15 bg-transparent px-3 text-sm outline-none focus:border-paper/50"
            >
              <option value="">Nenhuma</option>
              {categories.map((name) => (
                <option key={name} value={name}>
                  {name}
                </option>
              ))}
            </select>
          ) : (
            <Input
              id="colecao"
              value={colecao}
              maxLength={60}
              placeholder="Nome exato da categoria"
              onChange={(event) => setColecao(event.target.value)}
            />
          )}
        </Field>
        <p className="text-xs text-mute">Aparece logo abaixo da capa, com as peças dessa categoria.</p>
      </Group>

      <Group title="Prova social">
        <label className="flex cursor-pointer items-center justify-between gap-3 rounded-2xl border border-paper/10 px-4 py-3">
          <span className="text-sm">
            Mostrar bloco de prova social
            <span className="mt-0.5 block text-xs text-mute">Selo numérico ou depoimento curto.</span>
          </span>
          <input
            type="checkbox"
            checked={provaAtiva}
            onChange={(event) => setProvaAtiva(event.target.checked)}
            className="h-5 w-5 shrink-0 accent-[var(--color-accent)]"
          />
        </label>
        {provaAtiva ? (
          <div className="mt-3 space-y-3">
            <div className="grid grid-cols-2 gap-2">
              {(
                [
                  { id: "selo" as const, label: "Selo" },
                  { id: "depoimento" as const, label: "Depoimento" },
                ] as const
              ).map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setProvaTipo(item.id)}
                  className={cn(
                    "rounded-2xl border px-3 py-2 text-sm transition",
                    provaTipo === item.id ? "border-paper bg-paper/5" : "border-paper/10 hover:border-paper/40",
                  )}
                >
                  {item.label}
                </button>
              ))}
            </div>
            <Field label={provaTipo === "selo" ? "Texto do selo" : "Depoimento"} htmlFor="prova-texto">
              <Input
                id="prova-texto"
                value={provaTexto}
                maxLength={160}
                placeholder={provaTipo === "selo" ? "+500 pedidos" : "Achei uma peça única…"}
                onChange={(event) => setProvaTexto(event.target.value)}
              />
            </Field>
            {provaTipo === "depoimento" ? (
              <Field label="Autor" htmlFor="prova-autor">
                <Input
                  id="prova-autor"
                  value={provaAutor}
                  maxLength={60}
                  placeholder="Marina, SP"
                  onChange={(event) => setProvaAutor(event.target.value)}
                />
              </Field>
            ) : null}
          </div>
        ) : null}
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
