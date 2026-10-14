"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { MessageCircle, Trash2 } from "lucide-react";
import type { Interessado } from "@/features/domain/types";
import { formatPhone, whatsappHref } from "@/lib/phone";
import { createClient } from "@/lib/supabase/client";

export function InterestedList({
  people,
  storeName,
  productBaseUrl,
}: {
  people: Interessado[];
  storeName: string;
  productBaseUrl: string;
}) {
  const router = useRouter();
  const [busy, setBusy] = useState<string | null>(null);

  async function markNotified(id: string) {
    await createClient().from("interessados").update({ avisado_em: new Date().toISOString() }).eq("id", id);
    router.refresh();
  }

  async function remove(id: string) {
    setBusy(id);
    await createClient().from("interessados").delete().eq("id", id);
    setBusy(null);
    router.refresh();
  }

  if (people.length === 0) {
    return <p className="mt-8 text-sm text-mute">Ninguém pediu aviso ainda.</p>;
  }

  return (
    <ul className="mt-5 space-y-3">
      {people.map((person) => {
        const product = person.produtos;
        const text = `Oi, ${person.nome.split(" ")[0]}! Aqui é da ${storeName}. ${
          product ? `O ${product.nome} voltou ao estoque: ${productBaseUrl}${product.slug}` : "O produto que você queria voltou ao estoque."
        }`;
        return (
          <li key={person.id} className="rounded-3xl border border-paper/15 p-4">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="truncate text-sm">{product?.nome ?? "Produto removido"}</p>
                <p className="mt-1 text-sm text-mute">
                  {person.nome} · {formatPhone(person.whatsapp)}
                </p>
                <p className="mt-1 text-xs text-mute">
                  {person.avisado_em
                    ? `Avisado em ${new Date(person.avisado_em).toLocaleDateString("pt-BR")}`
                    : `Pediu em ${new Date(person.criado_em).toLocaleDateString("pt-BR")}`}
                </p>
              </div>
              <button
                type="button"
                aria-label="Remover"
                disabled={busy === person.id}
                onClick={() => void remove(person.id)}
                className="grid h-9 w-9 shrink-0 place-items-center rounded-full text-danger/70 transition hover:text-danger"
              >
                <Trash2 size={15} />
              </button>
            </div>
            <a
              href={whatsappHref(person.whatsapp, text)}
              target="_blank"
              rel="noreferrer"
              onClick={() => void markNotified(person.id)}
              className={`mt-3 flex h-11 items-center justify-center gap-2 rounded-full text-sm transition ${
                person.avisado_em ? "border border-paper/15 text-mute hover:text-paper" : "bg-accent text-on-accent"
              }`}
            >
              <MessageCircle size={16} />
              {person.avisado_em ? "Avisar de novo" : "Avisar pelo WhatsApp"}
            </a>
          </li>
        );
      })}
    </ul>
  );
}
