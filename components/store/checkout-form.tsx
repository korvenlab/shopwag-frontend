"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { lookupCep } from "@/features/checkout/cep";
import { placeOrder } from "@/features/checkout/place-order";
import { checkoutSchema, firstIssue } from "@/features/checkout/schema";
import { useCart, useCartSummary } from "@/features/cart/store";
import type { Loja } from "@/features/domain/types";
import { apiJson } from "@/lib/api";
import { totalWithFeesCents } from "@/lib/mercadopago/platform-fee";
import { formatBRL } from "@/lib/money";
import { formatCep, formatPhone } from "@/lib/phone";

const empty = {
  nome: "",
  whatsapp: "",
  cep: "",
  rua: "",
  numero: "",
  complemento: "",
  bairro: "",
  cidade: "",
  estado: "",
  observacoes: "",
  email: "",
};

export function CheckoutForm({ store }: { store: Loja }) {
  const router = useRouter();
  const { items, total } = useCartSummary(store.slug);
  const clear = useCart((state) => state.clear);
  const [form, setForm] = useState(empty);
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const charged = store.repassar_taxas ? totalWithFeesCents(total, Number(store.taxa_pix_percent)) : total;
  const feeCents = charged - total;

  function setField(key: keyof typeof empty, value: string) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  async function onCepBlur() {
    const address = await lookupCep(form.cep);
    if (!address) return;
    setForm((current) => ({
      ...current,
      rua: address.rua || current.rua,
      bairro: address.bairro || current.bairro,
      cidade: address.cidade || current.cidade,
      estado: address.estado || current.estado,
    }));
  }

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    const parsed = checkoutSchema.safeParse(form);
    if (!parsed.success) {
      setError(firstIssue(parsed.error));
      return;
    }
    setPending(true);
    setError(null);
    if (store.mp_status !== "connected") {
      setError("Esta loja ainda não conectou o Mercado Pago.");
      setPending(false);
      return;
    }
    try {
      const order = await placeOrder(store.slug, parsed.data, items);
      const pix = await apiJson("/api/mercadopago/pix", {
        method: "POST",
        body: JSON.stringify({
          pedido_id: order.pedido_id,
          token: order.token,
          email: parsed.data.email,
        }),
      });
      clear();
      const query = new URLSearchParams({ t: order.token });
      if (!pix.ok && pix.data.error) query.set("pix", pix.data.error);
      router.push(`/s/${store.slug}/pedido/${order.pedido_id}?${query.toString()}`);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Não foi possível fechar o pedido");
      setPending(false);
    }
  }

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-xl px-5 pt-8 md:pt-16">
        <h1 className="font-serif text-4xl">Sacola vazia</h1>
        <Button asChild className="mt-6">
          <Link href={`/s/${store.slug}`}>Voltar à vitrine</Link>
        </Button>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="mx-auto max-w-xl px-5 pt-6 md:pt-10">
      <h1 className="font-serif text-4xl">Entrega</h1>
      <p className="mt-2 text-sm text-mute">Pagamento por Pix, direto para a conta Mercado Pago da loja.</p>

      <div className="mt-6 space-y-4">
        <Field label="Nome completo" htmlFor="nome">
          <Input id="nome" value={form.nome} onChange={(event) => setField("nome", event.target.value)} autoComplete="name" />
        </Field>
        <Field label="WhatsApp" htmlFor="whatsapp">
          <Input
            id="whatsapp"
            inputMode="tel"
            autoComplete="tel"
            value={form.whatsapp}
            onChange={(event) => setField("whatsapp", formatPhone(event.target.value))}
          />
        </Field>
        <Field label="E-mail" htmlFor="email">
          <Input
            id="email"
            type="email"
            autoComplete="email"
            value={form.email}
            onChange={(event) => setField("email", event.target.value)}
          />
        </Field>
        <Field label="CEP" htmlFor="cep">
          <Input
            id="cep"
            inputMode="numeric"
            autoComplete="postal-code"
            value={form.cep}
            onChange={(event) => setField("cep", formatCep(event.target.value))}
            onBlur={onCepBlur}
          />
        </Field>
        <Field label="Rua" htmlFor="rua">
          <Input id="rua" value={form.rua} onChange={(event) => setField("rua", event.target.value)} autoComplete="address-line1" />
        </Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Número" htmlFor="numero">
            <Input id="numero" value={form.numero} onChange={(event) => setField("numero", event.target.value)} />
          </Field>
          <Field label="Complemento" htmlFor="complemento">
            <Input id="complemento" value={form.complemento} onChange={(event) => setField("complemento", event.target.value)} />
          </Field>
        </div>
        <Field label="Bairro" htmlFor="bairro">
          <Input id="bairro" value={form.bairro} onChange={(event) => setField("bairro", event.target.value)} />
        </Field>
        <div className="grid grid-cols-[1fr_5rem] gap-3">
          <Field label="Cidade" htmlFor="cidade">
            <Input id="cidade" value={form.cidade} onChange={(event) => setField("cidade", event.target.value)} />
          </Field>
          <Field label="UF" htmlFor="estado">
            <Input
              id="estado"
              maxLength={2}
              value={form.estado}
              onChange={(event) => setField("estado", event.target.value.toUpperCase())}
            />
          </Field>
        </div>
        <Field label="Observações" htmlFor="observacoes">
          <Textarea
            id="observacoes"
            value={form.observacoes}
            onChange={(event) => setField("observacoes", event.target.value)}
            placeholder="Referência, horário, recado"
          />
        </Field>
      </div>

      <div className="mt-6 space-y-2 rounded-3xl border border-white/15 p-4 text-sm">
        <div className="flex items-center justify-between">
          <span className="text-mute">Produtos</span>
          <span>{formatBRL(total)}</span>
        </div>
        {feeCents > 0 ? (
          <div className="flex items-center justify-between">
            <span className="text-mute">Taxas de pagamento</span>
            <span>{formatBRL(feeCents)}</span>
          </div>
        ) : null}
        <div className="flex items-center justify-between border-t border-white/10 pt-2">
          <span>Total no Pix</span>
          <span className="font-serif text-2xl">{formatBRL(charged)}</span>
        </div>
        {store.mp_status !== "connected" ? (
          <p className="text-xs leading-5 text-mute">
            A loja ainda não está recebendo. O pagamento abre quando ela conectar o Mercado Pago.
          </p>
        ) : null}
      </div>

      {error ? <p className="mt-4 text-sm text-[#ff8d8d]">{error}</p> : null}

      <Button type="submit" className="mt-5 w-full" disabled={pending || store.mp_status !== "connected"}>
        {pending ? "Gerando Pix…" : `Pagar ${formatBRL(charged)}`}
      </Button>
    </form>
  );
}

function Field({ label, htmlFor, children }: { label: string; htmlFor: string; children: React.ReactNode }) {
  return (
    <div className="space-y-2">
      <Label htmlFor={htmlFor}>{label}</Label>
      {children}
    </div>
  );
}
