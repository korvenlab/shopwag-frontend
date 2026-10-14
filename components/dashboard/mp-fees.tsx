"use client";

import { useState } from "react";
import type { MpConnection, MpFees as Fees, ReceivePlan } from "@/features/merchant/mercadopago";
import { cn } from "@/lib/cn";

const PLANS: Array<{ id: ReceivePlan; label: string; percent: string }> = [
  { id: "na_hora", label: "Na hora", percent: "4,98%" },
  { id: "14_dias", label: "Em 14 dias", percent: "4,49%" },
  { id: "30_dias", label: "Em 30 dias", percent: "3,98%" },
];

export function MpFees({
  fees,
  save,
}: {
  fees: Fees;
  save: (patch: { pass_fees?: boolean; plan?: ReceivePlan }) => Promise<MpConnection | null>;
}) {
  const [passFees, setPassFees] = useState(fees.pass_fees);
  const [plan, setPlan] = useState<ReceivePlan>(fees.plan);
  const [busy, setBusy] = useState(false);
  const [saved, setSaved] = useState(false);

  async function apply(patch: { pass_fees?: boolean; plan?: ReceivePlan }) {
    setBusy(true);
    setSaved(false);
    const result = await save(patch);
    setBusy(false);
    if (result?.fees) {
      setPassFees(result.fees.pass_fees);
      setPlan(result.fees.plan);
      setSaved(true);
    }
  }

  return (
    <div className="mt-6 border-t border-paper/10 pt-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm">Repassar a taxa do Mercado Pago para o cliente</p>
          <p className="mt-1 text-xs leading-5 text-mute">
            No Pix, no crédito e no débito, o cliente paga a taxa do Mercado Pago e você recebe o valor cheio do catálogo. A taxa
            de serviço de {fees.platform_percent}% da Shopwag é sempre paga pelo cliente.
          </p>
        </div>
        <button
          type="button"
          role="switch"
          aria-checked={passFees}
          aria-label="Repassar a taxa do Mercado Pago para o cliente"
          disabled={busy}
          onClick={() => void apply({ pass_fees: !passFees })}
          className={cn(
            "relative h-7 w-12 shrink-0 rounded-full border transition disabled:opacity-40",
            passFees ? "border-ok bg-ok" : "border-paper/25 bg-paper/5",
          )}
        >
          <span
            className={cn(
              "absolute top-1/2 size-5 -translate-y-1/2 rounded-full transition-all",
              passFees ? "left-[calc(100%-1.4rem)] bg-white" : "left-1 bg-paper/60",
            )}
          />
        </button>
      </div>

      {passFees ? (
        <div className="mt-5">
          <p className="text-sm">Quando você recebe as vendas no crédito</p>
          <p className="mt-1 text-xs leading-5 text-mute">
            Use o mesmo prazo escolhido no app do Mercado Pago, em Seu negócio, Custos, Checkouts. Depois de cada venda, a taxa se
            ajusta sozinha ao valor real cobrado.
          </p>
          <div className="mt-3 grid grid-cols-3 gap-2 rounded-full border border-paper/15 p-1" role="radiogroup" aria-label="Prazo de recebimento no crédito">
            {PLANS.map((option) => (
              <button
                key={option.id}
                type="button"
                role="radio"
                aria-checked={plan === option.id}
                disabled={busy}
                onClick={() => option.id !== plan && void apply({ plan: option.id })}
                className={cn(
                  "flex h-11 flex-col items-center justify-center rounded-full text-xs leading-4 transition duration-300 disabled:opacity-50",
                  plan === option.id ? "bg-paper text-ink" : "text-mute hover:text-paper",
                )}
              >
                <span>{option.label}</span>
                <span className="opacity-70">{option.percent}</span>
              </button>
            ))}
          </div>
        </div>
      ) : null}

      {saved ? <p className="mt-3 text-xs text-ok">Salvo. Vale para os próximos pedidos.</p> : null}
    </div>
  );
}
