import type { Horarios, Loja } from "@/features/domain/types";

export const WEEKDAYS = ["Domingo", "Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado"] as const;
type Day = keyof Horarios;

function brasiliaNow(now: Date) {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: "America/Sao_Paulo",
    weekday: "short",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).formatToParts(now);
  const get = (type: string) => parts.find((part) => part.type === type)?.value ?? "";
  const day = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].indexOf(get("weekday"));
  return { day, minutes: Number(get("hour")) * 60 + Number(get("minute")) };
}

function toMinutes(value: string) {
  const [hours, minutes] = value.split(":").map(Number);
  return hours * 60 + (minutes || 0);
}

function within(slot: { abre: string; fecha: string }, minutes: number) {
  const open = toMinutes(slot.abre);
  const close = toMinutes(slot.fecha);
  return close > open ? minutes >= open && minutes < close : minutes >= open || minutes < close;
}

export type StoreStatus = { open: boolean; label: string };

/** Mesma regra de private.loja_aberta no banco. */
export function storeStatus(
  store: Pick<Loja, "fechada" | "mensagem_fechada" | "horario_ativo" | "horarios">,
  now = new Date(),
): StoreStatus {
  if (store.fechada) {
    return { open: false, label: store.mensagem_fechada?.trim() || "Loja fechada no momento" };
  }
  if (!store.horario_ativo) return { open: true, label: "" };
  const { day, minutes } = brasiliaNow(now);
  const today = store.horarios?.[String(day) as Day];
  if (today && within(today, minutes)) return { open: true, label: `Aberto agora · até ${today.fecha}` };
  for (let offset = 0; offset < 7; offset += 1) {
    const index = (day + offset) % 7;
    const slot = store.horarios?.[String(index) as Day];
    if (!slot) continue;
    if (offset === 0 && toMinutes(slot.abre) <= minutes) continue;
    const when = offset === 0 ? "hoje" : offset === 1 ? "amanhã" : WEEKDAYS[index].toLowerCase();
    return { open: false, label: `Fechado agora · abre ${when} às ${slot.abre}` };
  }
  return { open: false, label: "Fechado agora" };
}

export function hoursSummary(horarios: Horarios) {
  return WEEKDAYS.map((name, index) => {
    const slot = horarios?.[String(index) as Day];
    return { name, text: slot ? `${slot.abre} às ${slot.fecha}` : "Fechado" };
  });
}
