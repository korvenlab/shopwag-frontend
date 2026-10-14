"use client";

import { useState } from "react";
import { StoreLink } from "@/components/store/store-link";
import { storeHref, useStoreBase } from "@/lib/store-path";
import { useRouter } from "next/navigation";
import { Store, Truck } from "lucide-react";
import { chargeForMethod, PayMethodPicker, type PayMethod } from "@/components/store/pay-method";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { lookupCep } from "@/features/checkout/cep";
import { placeOrder, quoteShipping, type ShippingQuote } from "@/features/checkout/place-order";
import { checkoutSchema, firstIssue, pickupSchema, type DeliveryType } from "@/features/checkout/schema";
import { useCart, useCartSummary } from "@/features/cart/store";
import type { Loja } from "@/features/domain/types";
import { apiJson } from "@/lib/api";
import { storeStatus } from "@/lib/hours";
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
  const base = useStoreBase(store.slug);
  const { items, total } = useCartSummary(store.slug);
  const clear = useCart((state) => state.clear);
  const [form, setForm] = useState(empty);
  const [type, setType] = useState<DeliveryType>(store.entrega_ativa ? "entrega" : "retirada");
  const [quote, setQuote] = useState<ShippingQuote | null>(null);
  const [quoting, setQuoting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const shipping = type === "entrega" && quote?.disponivel ? quote.valor_centavos : 0;
  const subtotal = total + shipping;
  const [method, setMethod] = useState<PayMethod>("pix");
  const charged = chargeForMethod(store, subtotal, method);
  const feeCents = charged - subtotal;
  const needsQuote = type === "entrega" && !quote?.disponivel;

  function setField(key: keyof typeof empty, value: string) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  async function refreshQuote(cep: string) {
    if (cep.replace(/\D/g, "").length !== 8) {
      setQuote(null);
      return;
    }
    setQuoting(true);
    setQuote(await quoteShipping(store.slug, cep, total));
    setQuoting(false);
  }

  function onCepChange(value: string) {
    const cep = formatCep(value);
    setField("cep", cep);
    if (cep.replace(/\D/g, "").length === 8) void refreshQuote(cep);
    else setQuote(null);
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
    const parsed = type === "retirada" ? pickupSchema.safeParse(form) : checkoutSchema.safeParse(form);
    if (!parsed.success) {
      setError(firstIssue(parsed.error));
      return;
    }
    if (type === "entrega" && quote && !quote.disponivel) {
      setError(quote.motivo);
      return;
    }
    const status = storeStatus(store);
    if (store.fechada || (!status.open && !store.pedidos_fora_horario)) {
      setError(status.label || "A loja está fechada no momento. Volte mais tarde.");
      return;
    }
    setPending(true);
    setError(null);
    if (store.mp_status !== "connected") {
      setError("Esta loja ainda não está recebendo pagamentos pelo site. Fale com a loja pelo WhatsApp para combinar o pagamento.");
      setPending(false);
      return;
    }
    try {
      const order = await placeOrder(store.slug, parsed.data, items, type);
      const checkout = await apiJson<{ url?: string | null }>("/api/mercadopago/checkout", {
        method: "POST",
        body: JSON.stringify({ pedido_id: order.pedido_id, token: order.token, email: parsed.data.email, metodo: method }),
      });
      clear();
      if (checkout.ok && checkout.data.url) {
        window.location.assign(checkout.data.url);
        return;
      }
      const query = new URLSearchParams({ t: order.token });
      if (!checkout.ok && checkout.data.error) query.set("erro", checkout.data.error);
      router.push(storeHref(base, `/pedido/${order.pedido_id}?${query.toString()}`));
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Não foi possível fechar o pedido. Tente de novo.");
      setPending(false);
    }
  }

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-xl px-5 pt-8 md:pt-16">
        <h1 className="font-serif text-4xl">Sacola vazia</h1>
        <Button asChild className="mt-6">
          <StoreLink slug={store.slug}>Voltar à vitrine</StoreLink>
        </Button>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="mx-auto max-w-xl px-5 pt-6 md:pt-10">
      <h1 className="font-serif text-4xl">{type === "retirada" ? "Retirada" : "Entrega"}</h1>
      <p className="mt-2 text-sm text-mute">Pix ou cartão em até 12x, pelo Mercado Pago, direto para a conta da loja.</p>

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
        {store.entrega_ativa && store.retirada_ativa ? (
          <div className="grid grid-cols-2 gap-2 rounded-full border border-paper/15 p-1" role="radiogroup" aria-label="Como receber">
            {(["entrega", "retirada"] as const).map((option) => (
              <button
                key={option}
                type="button"
                role="radio"
                aria-checked={type === option}
                onClick={() => {
                  setType(option);
                  setError(null);
                }}
                className={`flex h-11 items-center justify-center gap-2 rounded-full text-sm transition duration-300 ${
                  type === option ? "bg-paper text-ink" : "text-mute hover:text-paper"
                }`}
              >
                {option === "entrega" ? <Truck size={16} /> : <Store size={16} />}
                {option === "entrega" ? "Receber em casa" : "Retirar na loja"}
              </button>
            ))}
          </div>
        ) : null}

        {type === "retirada" ? (
          <div className="rounded-3xl border border-paper/15 p-4 text-sm">
            <p className="font-medium">Retirada na loja</p>
            <p className="mt-1 leading-6 text-mute">
              {store.retirada_endereco || "A loja combina o endereço de retirada com você pelo WhatsApp."}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            <Field label="CEP" htmlFor="cep">
              <Input
                id="cep"
                inputMode="numeric"
                autoComplete="postal-code"
                value={form.cep}
                onChange={(event) => onCepChange(event.target.value)}
                onBlur={onCepBlur}
              />
              {quoting ? <p className="text-xs text-mute">Calculando frete…</p> : null}
              {!quoting && quote ? (
                quote.disponivel ? (
                  <p className="text-xs text-mute">
                    {quote.nome}: <span className="text-paper">{quote.valor_centavos === 0 ? "grátis" : formatBRL(quote.valor_centavos)}</span>
                    {quote.prazo ? ` · ${quote.prazo}` : ""}
                  </p>
                ) : (
                  <p className="text-xs text-[#ff8d8d]">{quote.motivo}</p>
                )
              ) : null}
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
          </div>
        )}
        <Field label="Observações" htmlFor="observacoes">
          <Textarea
            id="observacoes"
            value={form.observacoes}
            onChange={(event) => setField("observacoes", event.target.value)}
            placeholder="Referência, horário, recado"
          />
        </Field>
      </div>

      <div className="mt-6">
        <PayMethodPicker value={method} onChange={setMethod} />
      </div>

      <div className="mt-6 space-y-2 rounded-3xl border border-paper/15 p-4 text-sm">
        <div className="flex items-center justify-between">
          <span className="text-mute">Produtos</span>
          <span>{formatBRL(total)}</span>
        </div>
        {type === "entrega" ? (
          <div className="flex items-center justify-between">
            <span className="text-mute">Frete</span>
            <span>{quote?.disponivel ? (shipping === 0 ? "Grátis" : formatBRL(shipping)) : "Informe o CEP"}</span>
          </div>
        ) : null}
        {feeCents > 0 ? (
          <div className="flex items-center justify-between">
            <span className="text-mute">Taxas de pagamento</span>
            <span>{formatBRL(feeCents)}</span>
          </div>
        ) : null}
        <div className="flex items-center justify-between border-t border-paper/10 pt-2">
          <span>{method === "pix" ? "Total no Pix" : method === "credito" ? "Total no crédito" : "Total no débito"}</span>
          <span className="font-serif text-2xl">{formatBRL(charged)}</span>
        </div>
        {store.mp_status !== "connected" ? (
          <p className="text-xs leading-5 text-mute">
            A loja ainda não está recebendo. O pagamento abre quando ela conectar o Mercado Pago.
          </p>
        ) : null}
      </div>

      {error ? <p className="mt-4 text-sm text-[#ff8d8d]">{error}</p> : null}

      <Button
        type="submit"
        className="mt-5 w-full"
        disabled={pending || quoting || store.fechada || store.mp_status !== "connected"}
      >
        {pending
          ? "Abrindo o Mercado Pago…"
          : needsQuote
            ? "Informe o CEP para continuar"
            : `Pagar ${formatBRL(charged)} no Mercado Pago`}
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
