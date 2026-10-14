"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { friendlyError } from "@/lib/friendly-error";
import { createClient } from "@/lib/supabase/client";

export function AuthForm({ mode }: { mode: "login" | "signup" }) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const signup = mode === "signup";

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    setPending(true);
    setError(null);
    setNotice(null);
    const supabase = createClient();

    if (signup) {
      const { data, error: signError } = await supabase.auth.signUp({ email, password });
      if (signError) {
        setError(friendlyError(signError, "Não foi possível criar a conta. Tente de novo."));
        setPending(false);
        return;
      }
      if (!data.session) {
        setNotice("Conta criada. Confirme o e-mail para entrar no painel.");
        setPending(false);
        return;
      }
    } else {
      const { error: signError } = await supabase.auth.signInWithPassword({ email, password });
      if (signError) {
        setError(friendlyError(signError, "Não foi possível entrar. Tente de novo."));
        setPending(false);
        return;
      }
    }

    router.push("/dashboard");
    router.refresh();
  }

  return (
    <form onSubmit={onSubmit} className="px-5 pt-12">
      <p className="text-[11px] uppercase tracking-[0.22em] text-mute">Shopwag</p>
      <h1 className="mt-3 font-serif text-5xl leading-none">{signup ? "Criar loja" : "Entrar"}</h1>
      <p className="mt-4 text-sm leading-6 text-mute">
        Área do lojista. O cliente final compra sem criar conta.
      </p>
      <div className="mt-8 space-y-4">
        <div className="space-y-2">
          <Label htmlFor="email">E-mail</Label>
          <Input id="email" type="email" autoComplete="email" value={email} onChange={(event) => setEmail(event.target.value)} required />
        </div>
        <div className="space-y-2">
          <Label htmlFor="password">Senha</Label>
          <Input
            id="password"
            type="password"
            autoComplete={signup ? "new-password" : "current-password"}
            minLength={6}
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            required
          />
        </div>
      </div>
      {error ? <p className="mt-4 text-sm text-[#ff8d8d]">{error}</p> : null}
      {notice ? <p className="mt-4 text-sm text-paper">{notice}</p> : null}
      <Button type="submit" className="mt-6 w-full" disabled={pending}>
        {pending ? "Aguarde…" : signup ? "Criar conta" : "Entrar"}
      </Button>
      <p className="mt-6 text-center text-sm text-mute">
        {signup ? (
          <Link href="/login" className="underline underline-offset-4">
            Já tenho conta
          </Link>
        ) : (
          <Link href="/cadastro" className="underline underline-offset-4">
            Criar uma loja
          </Link>
        )}
      </p>
    </form>
  );
}
