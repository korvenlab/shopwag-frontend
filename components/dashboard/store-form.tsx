"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { Loja } from "@/features/domain/types";
import { friendlyError } from "@/lib/friendly-error";
import { createClient } from "@/lib/supabase/client";
import { slugify } from "@/lib/slug";

export function StoreForm({ store }: { store: Loja | null }) {
  const router = useRouter();
  const [nome, setNome] = useState(store?.nome ?? "");
  const [slug, setSlug] = useState(store?.slug ?? "");
  const [slugTouched, setSlugTouched] = useState(Boolean(store));
  const [descricao, setDescricao] = useState(store?.descricao ?? "");
  const [whatsapp, setWhatsapp] = useState(store?.whatsapp ?? "");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    setPending(true);
    setError(null);
    const supabase = createClient();
    const { data } = await supabase.auth.getUser();
    if (!data.user) {
      setError("Sua sessão terminou. Entre de novo para continuar.");
      setPending(false);
      return;
    }

    const payload = {
      nome: nome.trim(),
      slug: slugify(slug || nome),
      descricao: descricao.trim(),
      whatsapp: whatsapp.replace(/\D/g, "") || null,
    };

    const query = store
      ? supabase.from("lojas").update(payload).eq("id", store.id)
      : supabase.from("lojas").insert({ ...payload, owner_id: data.user.id });

    const { error: saveError } = await query;
    if (saveError) {
      setError(friendlyError(saveError, "Não foi possível salvar a loja. Tente de novo."));
      setPending(false);
      return;
    }

    router.push("/dashboard");
    router.refresh();
  }

  return (
    <form onSubmit={onSubmit} className="px-5 pt-6">
      <h1 className="font-serif text-4xl">{store ? "Loja" : "Abrir loja"}</h1>
      <div className="mt-6 space-y-4">
        <div className="space-y-2">
          <Label htmlFor="nome">Nome</Label>
          <Input
            id="nome"
            value={nome}
            onChange={(event) => {
              setNome(event.target.value);
              if (!slugTouched) setSlug(slugify(event.target.value));
            }}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="slug">Endereço da vitrine</Label>
          <Input
            id="slug"
            value={slug}
            onChange={(event) => {
              setSlugTouched(true);
              setSlug(slugify(event.target.value));
            }}
            required
          />
          <p className="text-xs text-mute">/s/{slug || "sua-loja"}</p>
        </div>
        <div className="space-y-2">
          <Label htmlFor="descricao">Descrição</Label>
          <Textarea id="descricao" value={descricao} onChange={(event) => setDescricao(event.target.value)} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="whatsapp">WhatsApp da loja</Label>
          <Input id="whatsapp" value={whatsapp} onChange={(event) => setWhatsapp(event.target.value)} />
        </div>
      </div>
      {error ? <p className="mt-4 text-sm text-[#ff8d8d]">{error}</p> : null}
      <Button type="submit" className="mt-6 w-full" disabled={pending}>
        {pending ? "Salvando…" : "Salvar loja"}
      </Button>
    </form>
  );
}
