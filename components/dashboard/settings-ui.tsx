"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { ImagePlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import type { Loja } from "@/features/domain/types";
import { friendlyError } from "@/lib/friendly-error";
import { createClient } from "@/lib/supabase/client";

export type Message = { ok: boolean; text: string } | null;

export function useStoreSave(storeId: string, success: string) {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [message, setMessage] = useState<Message>(null);

  async function save(patch: Partial<Loja>) {
    setPending(true);
    setMessage(null);
    const { error } = await createClient().from("lojas").update(patch).eq("id", storeId);
    setPending(false);
    if (error) {
      setMessage({ ok: false, text: friendlyError(error, "Não foi possível salvar. Tente de novo.") });
      return false;
    }
    setMessage({ ok: true, text: success });
    router.refresh();
    return true;
  }

  return { pending, message, setMessage, save };
}

export function Section({
  id,
  eyebrow,
  title,
  description,
  children,
}: {
  id?: string;
  eyebrow: string;
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <section id={id} className="mx-5 mt-8 scroll-mt-6 rounded-3xl border border-paper/15 p-4">
      <p className="text-[11px] uppercase tracking-[0.16em] text-mute">{eyebrow}</p>
      <h2 className="mt-2 font-serif text-3xl">{title}</h2>
      {description ? <p className="mt-2 text-sm leading-6 text-mute">{description}</p> : null}
      {children}
    </section>
  );
}

export function Group({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mt-6 border-t border-paper/10 pt-5">
      <h3 className="mb-3 text-[11px] uppercase tracking-[0.16em] text-mute">{title}</h3>
      {children}
    </div>
  );
}

export function Field({
  label,
  htmlFor,
  hint,
  children,
}: {
  label: string;
  htmlFor: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-2">
      <Label htmlFor={htmlFor}>{label}</Label>
      {children}
      {hint ? <p className="text-xs leading-5 text-mute">{hint}</p> : null}
    </div>
  );
}

export function Toggle({
  label,
  hint,
  checked,
  onChange,
}: {
  label: string;
  hint?: string;
  checked: boolean;
  onChange: (value: boolean) => void;
}) {
  return (
    <label className="flex cursor-pointer items-center justify-between gap-3 rounded-2xl border border-paper/10 px-4 py-3">
      <span className="text-sm">
        {label}
        {hint ? <span className="mt-0.5 block text-xs leading-5 text-mute">{hint}</span> : null}
      </span>
      <input
        type="checkbox"
        checked={checked}
        onChange={(event) => onChange(event.target.checked)}
        className="h-5 w-5 shrink-0 accent-[var(--color-accent)]"
      />
    </label>
  );
}

export function SaveBar({
  message,
  pending,
  disabled,
  label,
  onSave,
}: {
  message: Message;
  pending: boolean;
  disabled?: boolean;
  label: string;
  onSave: () => void;
}) {
  return (
    <>
      {message ? (
        <p className={`mt-5 text-sm ${message.ok ? "text-paper" : "text-[#ff8d8d]"}`}>{message.text}</p>
      ) : null}
      <Button type="button" className="mt-5 w-full" disabled={pending || disabled} onClick={onSave}>
        {pending ? "Salvando…" : label}
      </Button>
    </>
  );
}

export function UploadButton({
  label,
  busy,
  accept = "image/png,image/jpeg,image/webp",
  multiple = false,
  onFiles,
}: {
  label: string;
  busy: boolean;
  accept?: string;
  multiple?: boolean;
  onFiles: (files: File[]) => void;
}) {
  const input = useRef<HTMLInputElement>(null);
  return (
    <>
      <Button
        type="button"
        variant="ghost"
        size="sm"
        disabled={busy}
        onClick={() => input.current?.click()}
        className="self-start"
      >
        <ImagePlus size={14} />
        {busy ? "Enviando…" : label}
      </Button>
      <input
        ref={input}
        type="file"
        accept={accept}
        multiple={multiple}
        className="hidden"
        onChange={(event) => {
          const files = Array.from(event.target.files ?? []);
          event.target.value = "";
          if (files.length) onFiles(files);
        }}
      />
    </>
  );
}

export function emptyToNull(value: string) {
  const trimmed = value.trim();
  return trimmed ? trimmed : null;
}
