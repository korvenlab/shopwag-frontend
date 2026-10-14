"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { FaixaFrete, Loja } from "@/features/domain/types";
import { friendlyError } from "@/lib/friendly-error";
import { centsToInput, formatBRL, parseReais } from "@/lib/money";
import { formatCep, onlyDigits } from "@/lib/phone";
import { createClient } from "@/lib/supabase/client";
import { Field, Group, SaveBar, Section, Toggle, emptyToNull, useStoreSave } from "./settings-ui";

const emptyRange = { nome: "", inicio: "", fim: "", valor: "", prazo: "" };

export function StoreShipping({ store, ranges }: { store: Loja; ranges: FaixaFrete[] }) {
  const router = useRouter();
  const [entrega, setEntrega] = useState(store.entrega_ativa);
  const [foraFaixa, setForaFaixa] = useState(store.frete_padrao_centavos != null);
  const [padrao, setPadrao] = useState(centsToInput(store.frete_padrao_centavos ?? 0));
  const [gratisAtivo, setGratisAtivo] = useState(store.frete_gratis_acima_centavos != null);
  const [gratis, setGratis] = useState(centsToInput(store.frete_gratis_acima_centavos));
  const [prazo, setPrazo] = useState(store.prazo_padrao ?? "");
  const [retirada, setRetirada] = useState(store.retirada_ativa);
  const [endereco, setEndereco] = useState(store.retirada_endereco ?? "");
  const [draft, setDraft] = useState(emptyRange);
  const [rangeBusy, setRangeBusy] = useState(false);
  const [rangeError, setRangeError] = useState<string | null>(null);
  const { pending, message, setMessage, save } = useStoreSave(store.id, "Entrega salva.");

  function onSave() {
    if (!entrega && !retirada) {
      setMessage({ ok: false, text: "Deixe ao menos entrega ou retirada ligada." });
      return;
    }
    const padraoCents = foraFaixa ? parseReais(padrao || "0") : null;
    const gratisCents = gratisAtivo ? parseReais(gratis) : null;
    if (foraFaixa && padraoCents == null) {
      setMessage({ ok: false, text: "Confira o valor do frete." });
      return;
    }
    if (gratisAtivo && gratisCents == null) {
      setMessage({ ok: false, text: "Informe a partir de qual valor o frete é grátis." });
      return;
    }
    void save({
      entrega_ativa: entrega,
      frete_padrao_centavos: padraoCents,
      frete_gratis_acima_centavos: gratisCents,
      prazo_padrao: emptyToNull(prazo),
      retirada_ativa: retirada,
      retirada_endereco: emptyToNull(endereco),
    });
  }

  async function addRange() {
    setRangeError(null);
    const inicio = onlyDigits(draft.inicio);
    const fim = onlyDigits(draft.fim || draft.inicio);
    const valor = parseReais(draft.valor || "0");
    if (draft.nome.trim().length < 2) return setRangeError("Dê um nome para a região, como “Centro”.");
    if (inicio.length !== 8 || fim.length !== 8) return setRangeError("Informe os CEPs com 8 números.");
    if (inicio > fim) return setRangeError("O CEP inicial precisa ser menor que o final.");
    if (valor == null) return setRangeError("Confira o valor do frete.");
    setRangeBusy(true);
    const { error } = await createClient().from("loja_fretes").insert({
      loja_id: store.id,
      nome: draft.nome.trim(),
      cep_inicio: inicio,
      cep_fim: fim,
      valor_centavos: valor,
      prazo: emptyToNull(draft.prazo),
    });
    setRangeBusy(false);
    if (error) return setRangeError(friendlyError(error, "Não foi possível adicionar a região."));
    setDraft(emptyRange);
    router.refresh();
  }

  async function removeRange(id: string) {
    setRangeBusy(true);
    const { error } = await createClient().from("loja_fretes").delete().eq("id", id);
    setRangeBusy(false);
    if (error) setRangeError(friendlyError(error, "Não foi possível remover a região."));
    else router.refresh();
  }

  return (
    <Section
      id="entrega"
      eyebrow="Entrega e retirada"
      title="Frete"
      description="O frete é calculado pelo CEP no fechamento do pedido."
    >
      <Group title="Entrega">
        <Toggle label="Entregar no endereço do cliente" checked={entrega} onChange={setEntrega} />
        {entrega ? (
          <div className="mt-3 space-y-3">
            <Toggle
              label="Entregar fora das regiões cadastradas"
              hint="Desligado, a loja só entrega nos CEPs das regiões abaixo."
              checked={foraFaixa}
              onChange={setForaFaixa}
            />
            {foraFaixa ? (
              <div className="grid grid-cols-2 gap-3">
                <Field label="Frete padrão (R$)" htmlFor="frete_padrao" hint="Use 0 para frete grátis.">
                  <Input id="frete_padrao" inputMode="decimal" value={padrao} onChange={(event) => setPadrao(event.target.value)} />
                </Field>
                <Field label="Prazo" htmlFor="prazo_padrao">
                  <Input id="prazo_padrao" value={prazo} placeholder="3 a 7 dias úteis" onChange={(event) => setPrazo(event.target.value)} />
                </Field>
              </div>
            ) : null}
            <Toggle label="Frete grátis a partir de um valor" checked={gratisAtivo} onChange={setGratisAtivo} />
            {gratisAtivo ? (
              <Field label="Grátis em compras a partir de (R$)" htmlFor="frete_gratis">
                <Input id="frete_gratis" inputMode="decimal" value={gratis} placeholder="199,00" onChange={(event) => setGratis(event.target.value)} />
              </Field>
            ) : null}
          </div>
        ) : null}
      </Group>

      <Group title="Retirada">
        <Toggle label="Cliente pode retirar na loja" hint="Sem frete. O cliente escolhe no fechamento." checked={retirada} onChange={setRetirada} />
        {retirada ? (
          <div className="mt-3">
            <Field label="Onde retirar" htmlFor="retirada_endereco">
              <Input
                id="retirada_endereco"
                value={endereco}
                placeholder="Rua, número, bairro · seg a sex, 9h às 18h"
                onChange={(event) => setEndereco(event.target.value)}
              />
            </Field>
          </div>
        ) : null}
      </Group>

      <SaveBar message={message} pending={pending} label="Salvar entrega" onSave={onSave} />

      {entrega ? (
        <Group title="Regiões com preço próprio">
          <p className="mb-3 text-xs leading-5 text-mute">
            Cadastre faixas de CEP, como bairros ou cidades vizinhas. Se um CEP cair em mais de uma, vale a faixa menor.
          </p>
          {ranges.length ? (
            <ul className="mb-4 divide-y divide-paper/10 rounded-2xl border border-paper/10">
              {ranges.map((range) => (
                <li key={range.id} className="flex items-center gap-3 px-3 py-2.5 text-sm">
                  <div className="min-w-0 flex-1">
                    <p className="truncate">{range.nome}</p>
                    <p className="text-xs text-mute">
                      {formatCep(range.cep_inicio)} a {formatCep(range.cep_fim)}
                      {range.prazo ? ` · ${range.prazo}` : ""}
                    </p>
                  </div>
                  <span>{range.valor_centavos === 0 ? "Grátis" : formatBRL(range.valor_centavos)}</span>
                  <button
                    type="button"
                    aria-label={`Remover ${range.nome}`}
                    disabled={rangeBusy}
                    onClick={() => void removeRange(range.id)}
                    className="grid h-9 w-9 place-items-center rounded-full text-mute transition hover:text-paper"
                  >
                    <Trash2 size={15} />
                  </button>
                </li>
              ))}
            </ul>
          ) : null}
          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2">
              <Field label="Região" htmlFor="faixa_nome">
                <Input id="faixa_nome" value={draft.nome} placeholder="Centro" onChange={(event) => setDraft({ ...draft, nome: event.target.value })} />
              </Field>
            </div>
            <Field label="CEP inicial" htmlFor="faixa_inicio">
              <Input
                id="faixa_inicio"
                inputMode="numeric"
                value={draft.inicio}
                placeholder="01000-000"
                onChange={(event) => setDraft({ ...draft, inicio: formatCep(event.target.value) })}
              />
            </Field>
            <Field label="CEP final" htmlFor="faixa_fim">
              <Input
                id="faixa_fim"
                inputMode="numeric"
                value={draft.fim}
                placeholder="01999-999"
                onChange={(event) => setDraft({ ...draft, fim: formatCep(event.target.value) })}
              />
            </Field>
            <Field label="Frete (R$)" htmlFor="faixa_valor">
              <Input id="faixa_valor" inputMode="decimal" value={draft.valor} placeholder="10,00" onChange={(event) => setDraft({ ...draft, valor: event.target.value })} />
            </Field>
            <Field label="Prazo" htmlFor="faixa_prazo">
              <Input id="faixa_prazo" value={draft.prazo} placeholder="No mesmo dia" onChange={(event) => setDraft({ ...draft, prazo: event.target.value })} />
            </Field>
          </div>
          {rangeError ? <p className="mt-3 text-sm text-[#ff8d8d]">{rangeError}</p> : null}
          <Button type="button" variant="ghost" className="mt-4 w-full" disabled={rangeBusy} onClick={() => void addRange()}>
            <Plus size={15} /> Adicionar região
          </Button>
        </Group>
      ) : null}
    </Section>
  );
}
