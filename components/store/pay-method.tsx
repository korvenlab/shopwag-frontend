"use client";

import { CreditCard, QrCode, Wallet } from "lucide-react";
import type { Loja } from "@/features/domain/types";
import { chargeBreakdown } from "@/lib/mercadopago/platform-fee";

export type PayMethod = "pix" | "credito" | "debito";

const OPTIONS: Array<{ id: PayMethod; label: string; icon: React.ReactNode }> = [
  { id: "pix", label: "Pix", icon: <QrCode size={16} /> },
  { id: "credito", label: "Crédito", icon: <CreditCard size={16} /> },
  { id: "debito", label: "Débito", icon: <Wallet size={16} /> },
];

export function asPayMethod(value: string | null | undefined): PayMethod {
  return value === "credito" || value === "debito" ? value : "pix";
}

/** Mesma conta do backend: taxa de serviço sempre; taxa do Mercado Pago só quando a loja repassa. */
export function chargeForMethod(
  store: Pick<Loja, "repassar_taxas" | "taxa_pix_percent" | "taxa_credito_percent" | "taxa_debito_percent">,
  baseCents: number,
  method: PayMethod,
) {
  if (!store.repassar_taxas) return chargeBreakdown(baseCents, null);
  const percent =
    method === "credito" ? store.taxa_credito_percent : method === "debito" ? store.taxa_debito_percent : store.taxa_pix_percent;
  return chargeBreakdown(baseCents, Number(percent));
}

export const paymentFeeLabel: Record<PayMethod, string> = {
  pix: "Taxa do Pix",
  credito: "Taxa do cartão",
  debito: "Taxa do cartão",
};

export function PayMethodPicker({
  value,
  onChange,
  disabled,
}: {
  value: PayMethod;
  onChange: (method: PayMethod) => void;
  disabled?: boolean;
}) {
  return (
    <div>
      <p className="text-[11px] uppercase tracking-[0.16em] text-mute">Como quer pagar</p>
      <div className="mt-2 grid grid-cols-3 gap-2 rounded-full border border-paper/15 p-1" role="radiogroup" aria-label="Como quer pagar">
        {OPTIONS.map((option) => (
          <button
            key={option.id}
            type="button"
            role="radio"
            aria-checked={value === option.id}
            disabled={disabled}
            onClick={() => onChange(option.id)}
            className={`flex h-11 items-center justify-center gap-2 rounded-full text-sm transition duration-300 disabled:opacity-50 ${
              value === option.id ? "bg-paper text-ink" : "text-mute hover:text-paper"
            }`}
          >
            {option.icon}
            {option.label}
          </button>
        ))}
      </div>
      <p className="mt-2 text-xs text-mute">
        {value === "credito" ? "Em até 12x no cartão de crédito." : value === "debito" ? "Cartão de débito, à vista." : "Aprovação na hora."}{" "}
        Você conclui o pagamento no Mercado Pago.
      </p>
    </div>
  );
}
