"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import type { Horarios, Loja } from "@/features/domain/types";
import { WEEKDAYS } from "@/lib/hours";
import { Field, Group, SaveBar, Section, Toggle, emptyToNull, useStoreSave } from "./settings-ui";

type Day = keyof Horarios;
const DAYS = ["1", "2", "3", "4", "5", "6", "0"] as Day[];
const DEFAULT_SLOT = { abre: "09:00", fecha: "18:00" };

export function StoreHours({ store }: { store: Loja }) {
  const [ativo, setAtivo] = useState(store.horario_ativo);
  const [horarios, setHorarios] = useState<Horarios>(store.horarios ?? {});
  const [foraHorario, setForaHorario] = useState(store.pedidos_fora_horario);
  const [fechada, setFechada] = useState(store.fechada);
  const [mensagem, setMensagem] = useState(store.mensagem_fechada ?? "");
  const { pending, message, setMessage, save } = useStoreSave(store.id, "Horário salvo.");

  function setDay(day: Day, slot: { abre: string; fecha: string } | null) {
    setHorarios((current) => {
      const next = { ...current };
      if (slot) next[day] = slot;
      else delete next[day];
      return next;
    });
  }

  function onSave() {
    if (ativo && Object.keys(horarios).length === 0) {
      setMessage({ ok: false, text: "Marque pelo menos um dia de atendimento." });
      return;
    }
    const invalid = Object.values(horarios).some((slot) => slot && slot.abre === slot.fecha);
    if (invalid) {
      setMessage({ ok: false, text: "O horário de abrir e fechar precisa ser diferente." });
      return;
    }
    void save({
      horario_ativo: ativo,
      horarios,
      pedidos_fora_horario: foraHorario,
      fechada,
      mensagem_fechada: emptyToNull(mensagem),
    });
  }

  return (
    <Section
      id="horario"
      eyebrow="Atendimento"
      title="Horário da loja"
      description="Os clientes veem se a loja está aberta agora e os horários no rodapé."
    >
      <Group title="Fechar a loja">
        <Toggle
          label="Loja fechada temporariamente"
          hint="Ninguém consegue fechar pedido enquanto estiver ligado. Bom para férias ou falta de estoque."
          checked={fechada}
          onChange={setFechada}
        />
        {fechada ? (
          <div className="mt-3">
            <Field label="Recado para os clientes" htmlFor="mensagem_fechada">
              <Input
                id="mensagem_fechada"
                value={mensagem}
                maxLength={160}
                placeholder="Voltamos dia 10 com novidades"
                onChange={(event) => setMensagem(event.target.value)}
              />
            </Field>
          </div>
        ) : null}
      </Group>

      <Group title="Horário de atendimento">
        <Toggle label="Usar horário de atendimento" checked={ativo} onChange={setAtivo} />
        {ativo ? (
          <>
            <ul className="mt-3 space-y-2">
              {DAYS.map((day) => {
                const slot = horarios[day];
                return (
                  <li key={day} className="flex items-center gap-2 rounded-2xl border border-paper/10 px-3 py-2">
                    <label className="flex w-28 shrink-0 cursor-pointer items-center gap-2 text-sm">
                      <input
                        type="checkbox"
                        checked={Boolean(slot)}
                        onChange={(event) => setDay(day, event.target.checked ? DEFAULT_SLOT : null)}
                        className="h-4 w-4 accent-[var(--color-accent)]"
                      />
                      {WEEKDAYS[Number(day)]}
                    </label>
                    {slot ? (
                      <div className="flex flex-1 items-center gap-2">
                        <Input
                          type="time"
                          value={slot.abre}
                          aria-label={`Abre ${WEEKDAYS[Number(day)]}`}
                          onChange={(event) => setDay(day, { ...slot, abre: event.target.value })}
                        />
                        <span className="text-xs text-mute">às</span>
                        <Input
                          type="time"
                          value={slot.fecha}
                          aria-label={`Fecha ${WEEKDAYS[Number(day)]}`}
                          onChange={(event) => setDay(day, { ...slot, fecha: event.target.value })}
                        />
                      </div>
                    ) : (
                      <span className="text-sm text-mute">Fechado</span>
                    )}
                  </li>
                );
              })}
            </ul>
            <div className="mt-3">
              <Toggle
                label="Aceitar pedidos fora do horário"
                hint="Desligado, o cliente só consegue pagar com a loja aberta."
                checked={foraHorario}
                onChange={setForaHorario}
              />
            </div>
          </>
        ) : null}
      </Group>

      <SaveBar message={message} pending={pending} label="Salvar horário" onSave={onSave} />
    </Section>
  );
}
