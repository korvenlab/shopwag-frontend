"use client";

import { useState } from "react";
import { Bell, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { friendlyError } from "@/lib/friendly-error";
import { formatPhone } from "@/lib/phone";
import { createClient } from "@/lib/supabase/client";

export function NotifyMe({ productId }: { productId: string }) {
  const [open, setOpen] = useState(false);
  const [nome, setNome] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [pending, setPending] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setPending(true);
    setError(null);
    const { error: rpcError } = await createClient().rpc("avise_me", {
      p_produto_id: productId,
      p_nome: nome,
      p_whatsapp: whatsapp,
    });
    setPending(false);
    if (rpcError) {
      setError(friendlyError(rpcError, "Não foi possível salvar. Tente de novo."));
      return;
    }
    setDone(true);
  }

  if (done) {
    return (
      <p className="enter mt-6 flex items-center gap-2 rounded-2xl border border-paper/15 p-4 text-sm">
        <Check size={16} className="text-accent" />
        Pronto! A loja vai te chamar no WhatsApp quando chegar.
      </p>
    );
  }

  if (!open) {
    return (
      <Button type="button" variant="ghost" className="mt-6 w-full" onClick={() => setOpen(true)}>
        <Bell size={16} />
        Avise-me quando chegar
      </Button>
    );
  }

  return (
    <form onSubmit={submit} className="enter mt-6 space-y-3 rounded-3xl border border-paper/15 p-4">
      <p className="text-sm">Deixe seu contato e a loja te avisa quando a peça voltar.</p>
      <Input placeholder="Seu nome" value={nome} onChange={(event) => setNome(event.target.value)} required />
      <Input
        placeholder="WhatsApp com DDD"
        inputMode="tel"
        value={whatsapp}
        onChange={(event) => setWhatsapp(formatPhone(event.target.value))}
        required
      />
      {error ? <p className="text-sm text-[#ff8d8d]">{error}</p> : null}
      <Button type="submit" className="w-full" disabled={pending}>
        {pending ? "Salvando…" : "Quero ser avisado"}
      </Button>
    </form>
  );
}
