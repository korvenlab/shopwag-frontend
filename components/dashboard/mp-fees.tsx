"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { MpConnection, MpFees as Fees } from "@/features/merchant/mercadopago";
import { cn } from "@/lib/cn";
import { totalWithFeesCents } from "@/lib/mercadopago/platform-fee";
import { formatBRL } from "@/lib/money";

const EXAMPLE_CENTS = 10000;

export function MpFees({
  fees,
  save,
}: {
  fees: Fees;
  save: (patch: { pass_fees?: boolean; pix_percent?: string }) => Promise<MpConnection | null>;
}) {
  const [passFees, setPassFees] = useState(fees.pass_fees);
  const [pixPercent, setPixPercent] = useState(String(fees.pix_percent).replace(".", ","));
  const [busy, setBusy] = useState(false);
  const [saved, setSaved] = useState(false);

  const pix = Number(pixPercent.replace(",", "."));
  const pixValid = Number.isFinite(pix) && pix >= 0 && pix < 20;
  const effectivePix = pixValid ? pix : fees.pix_percent;
  const charged = passFees ? totalWithFeesCents(EXAMPLE_CENTS, effectivePix) : EXAMPLE_CENTS;
  const mpFee = Math.round((charged * effectivePix) / 100);
  const platformFee = Math.round((charged * fees.platform_percent) / 100);
  const store = charged - mpFee - platformFee;

  async function submit(next: { pass_fees?: boolean; pix_percent?: string }) {
    setBusy(true);
    setSaved(false);
    const result = await save(next);
    setBusy(false);
    if (result?.fees) {
      setPassFees(result.fees.pass_fees);
      setPixPercent(String(result.fees.pix_percent).replace(".", ","));
      setSaved(true);
    }
  }

  return (
    <div className="mt-6 border-t border-white/10 pt-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm">Repassar taxas para o cliente</p>
          <p className="mt-1 text-xs leading-5 text-mute">
            O cliente paga a taxa Pix do Mercado Pago e o {fees.platform_percent}% da Shopwag. Você recebe o valor cheio do
            catálogo.
          </p>
        </div>
        <button
          type="button"
          role="switch"
          aria-checked={passFees}
          aria-label="Repassar taxas para o cliente"
          disabled={busy}
          onClick={() => void submit({ pass_fees: !passFees })}
          className={cn(
            "relative h-7 w-12 shrink-0 rounded-full border transition disabled:opacity-40",
            passFees ? "border-paper bg-paper" : "border-white/25 bg-white/5",
          )}
        >
          <span
            className={cn(
              "absolute top-1/2 size-5 -translate-y-1/2 rounded-full transition-all",
              passFees ? "left-[calc(100%-1.4rem)] bg-ink" : "left-1 bg-white/60",
            )}
          />
        </button>
      </div>

      <div className="mt-5 grid grid-cols-[1fr_auto] items-end gap-3">
        <div className="space-y-2">
          <Label htmlFor="pix-percent">Taxa Pix do Mercado Pago (%)</Label>
          <Input
            id="pix-percent"
            inputMode="decimal"
            value={pixPercent}
            onChange={(event) => {
              setPixPercent(event.target.value);
              setSaved(false);
            }}
          />
        </div>
        <Button
          type="button"
          variant="ghost"
          disabled={busy || !pixValid || pix === fees.pix_percent}
          onClick={() => void submit({ pix_percent: pixPercent })}
        >
          Salvar
        </Button>
      </div>
      <p className="mt-2 text-xs leading-5 text-mute">
        {fees.pix_observed_at
          ? "Ajustada automaticamente pela última venda aprovada."
          : "Começa em 0,99% e se ajusta sozinha depois da primeira venda aprovada."}
      </p>

      <dl className="mt-5 space-y-2 rounded-2xl border border-white/10 p-4 text-sm">
        <p className="text-[11px] uppercase tracking-[0.16em] text-mute">Venda de {formatBRL(EXAMPLE_CENTS)}</p>
        <Row label="Cliente paga" value={formatBRL(charged)} strong />
        <Row label={`Mercado Pago (${String(effectivePix).replace(".", ",")}%)`} value={`− ${formatBRL(mpFee)}`} />
        <Row label={`Shopwag (${fees.platform_percent}%)`} value={`− ${formatBRL(platformFee)}`} />
        <Row label="Você recebe" value={formatBRL(store)} strong />
      </dl>
      {saved ? <p className="mt-3 text-xs text-mute">Salvo. Vale para os próximos pedidos.</p> : null}
    </div>
  );
}

function Row({ label, value, strong }: { label: string; value: string; strong?: boolean }) {
  return (
    <div className="flex justify-between gap-3">
      <dt className="text-mute">{label}</dt>
      <dd className={strong ? "font-medium" : undefined}>{value}</dd>
    </div>
  );
}
