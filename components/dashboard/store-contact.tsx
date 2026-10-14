"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import type { Loja } from "@/features/domain/types";
import { Field, Group, SaveBar, Section, emptyToNull, useStoreSave } from "./settings-ui";

const TEXT_FIELDS = [
  "email_contato",
  "site_url",
  "instagram",
  "facebook",
  "tiktok",
  "youtube",
  "endereco_loja",
  "documento",
  "politica_troca",
  "politica_privacidade",
  "termos_uso",
] as const;
type TextField = (typeof TEXT_FIELDS)[number];

export function StoreContact({ store }: { store: Loja }) {
  const [form, setForm] = useState<Record<TextField, string>>(
    () => Object.fromEntries(TEXT_FIELDS.map((key) => [key, store[key] ?? ""])) as Record<TextField, string>,
  );
  const { pending, message, setMessage, save } = useStoreSave(store.id, "Contato e políticas salvos.");

  function bind(key: TextField) {
    return {
      id: key,
      value: form[key],
      onChange: (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
        setForm((current) => ({ ...current, [key]: event.target.value })),
    };
  }

  function onSave() {
    const email = form.email_contato.trim();
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setMessage({ ok: false, text: "Confira o e-mail de contato." });
      return;
    }
    void save(Object.fromEntries(TEXT_FIELDS.map((key) => [key, emptyToNull(form[key])])) as Partial<Loja>);
  }

  return (
    <Section
      id="contato"
      eyebrow="Rodapé"
      title="Contato, redes e políticas"
      description="Tudo aqui aparece no rodapé da loja. Campos vazios ficam escondidos."
    >
      <Group title="Contato">
        <div className="space-y-4">
          <Field label="E-mail" htmlFor="email_contato">
            <Input type="email" placeholder="contato@sualoja.com" {...bind("email_contato")} />
          </Field>
          <Field label="Site" htmlFor="site_url">
            <Input placeholder="sualoja.com.br" {...bind("site_url")} />
          </Field>
          <Field label="Endereço" htmlFor="endereco_loja">
            <Input placeholder="Rua, número, bairro, cidade" {...bind("endereco_loja")} />
          </Field>
          <Field label="CNPJ ou CPF" htmlFor="documento" hint="Passa mais confiança para quem compra.">
            <Input {...bind("documento")} />
          </Field>
        </div>
      </Group>

      <Group title="Redes sociais">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Instagram" htmlFor="instagram">
            <Input placeholder="@sualoja" {...bind("instagram")} />
          </Field>
          <Field label="Facebook" htmlFor="facebook">
            <Input placeholder="sualoja" {...bind("facebook")} />
          </Field>
          <Field label="TikTok" htmlFor="tiktok">
            <Input placeholder="@sualoja" {...bind("tiktok")} />
          </Field>
          <Field label="YouTube" htmlFor="youtube">
            <Input placeholder="@sualoja" {...bind("youtube")} />
          </Field>
        </div>
      </Group>

      <Group title="Políticas">
        <div className="space-y-4">
          <Field label="Trocas e devoluções" htmlFor="politica_troca">
            <Textarea rows={5} maxLength={5000} {...bind("politica_troca")} />
          </Field>
          <Field label="Política de privacidade" htmlFor="politica_privacidade">
            <Textarea rows={5} maxLength={5000} {...bind("politica_privacidade")} />
          </Field>
          <Field label="Termos de uso" htmlFor="termos_uso">
            <Textarea rows={5} maxLength={5000} {...bind("termos_uso")} />
          </Field>
        </div>
      </Group>

      <SaveBar message={message} pending={pending} label="Salvar contato e políticas" onSave={onSave} />
    </Section>
  );
}
