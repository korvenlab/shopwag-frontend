"use client";

import { useState } from "react";
import type { MpConnection, MpFees as Fees } from "@/features/merchant/mercadopago";
import { cn } from "@/lib/cn";

export function MpFees({
  fees,
  save,
}: {
  fees: Fees;
  save: (patch: { pass_fees?: boolean }) => Promise<MpConnection | null>;
}) {
  const [passFees, setPassFees] = useState(fees.pass_fees);
  const [busy, setBusy] = useState(false);
  const [saved, setSaved] = useState(false);

  async function toggle() {
    setBusy(true);
    setSaved(false);
    const result = await save({ pass_fees: !passFees });
    setBusy(false);
    if (result?.fees) {
      setPassFees(result.fees.pass_fees);
      setSaved(true);
    }
  }

  return (
    <div className="mt-6 border-t border-paper/10 pt-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm">Repassar taxas para o cliente</p>
          <p className="mt-1 text-xs leading-5 text-mute">
            O cliente paga a taxa do Mercado Pago e o {fees.platform_percent}% da Shopwag, no Pix ou no cartão. Você recebe o
            valor cheio do catálogo.
          </p>
        </div>
        <button
          type="button"
          role="switch"
          aria-checked={passFees}
          aria-label="Repassar taxas para o cliente"
          disabled={busy}
          onClick={() => void toggle()}
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
      {saved ? <p className="mt-3 text-xs text-ok">Salvo. Vale para os próximos pedidos.</p> : null}
    </div>
  );
}
