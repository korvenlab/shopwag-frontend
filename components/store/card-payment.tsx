"use client";

import { useEffect, useMemo, useState } from "react";
import { CardPayment, initMercadoPago } from "@mercadopago/sdk-react";
import { apiJson } from "@/lib/api";
import { contrastRatio } from "@/lib/theme";

export type CardMethod = "credito" | "debito";

type CardFormData = {
  token: string;
  issuer_id: string;
  payment_method_id: string;
  installments: number;
  payer: { email?: string; identification?: { type: string; number: string } };
};

let initializedKey: string | null = null;

export function CardPaymentForm({
  lojaId,
  method,
  amountCents,
  email,
  background,
  onPay,
}: {
  lojaId: string;
  method: CardMethod;
  amountCents: number;
  email: string;
  background: string;
  onPay: (card: CardFormData) => Promise<void>;
}) {
  const [ready, setReady] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    void apiJson<{ public_key?: string }>(`/api/mercadopago/public-key?loja=${lojaId}`).then((result) => {
      if (cancelled) return;
      const key = result.ok ? result.data.public_key : undefined;
      if (!key) {
        setError(result.data.error || "Esta loja ainda não está recebendo cartão pelo site.");
        return;
      }
      if (initializedKey !== key) {
        initMercadoPago(key, { locale: "pt-BR" });
        initializedKey = key;
      }
      setReady(true);
    });
    return () => {
      cancelled = true;
    };
  }, [lojaId]);

  const customization = useMemo(
    () => ({
      paymentMethods: {
        types: { excluded: method === "credito" ? ["debit_card" as const, "prepaid_card" as const] : ["credit_card" as const] },
        maxInstallments: method === "credito" ? 12 : 1,
      },
      visual: {
        style: {
          theme: contrastRatio(background, "#000000") > contrastRatio(background, "#ffffff") ? ("default" as const) : ("dark" as const),
        },
      },
    }),
    [method, background],
  );

  if (error) return <p className="mt-4 text-sm text-[#ff8d8d]">{error}</p>;
  if (!ready) return <p className="mt-4 text-sm text-mute">Abrindo pagamento com cartão…</p>;

  return (
    <div className="mt-4">
      <CardPayment
        key={`${method}-${amountCents}`}
        initialization={{ amount: amountCents / 100, payer: { email } }}
        customization={customization}
        onSubmit={(formData) => onPay(formData as CardFormData)}
        onError={(brickError) => {
          if (brickError.type === "critical") {
            setError("Não conseguimos abrir o pagamento com cartão. Recarregue a página ou pague com Pix.");
          }
        }}
      />
    </div>
  );
}
