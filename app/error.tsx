"use client";

import Link from "next/link";

export default function ErrorPage({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <div className="mx-auto max-w-xl px-5 py-16">
      <p className="text-[11px] uppercase tracking-[0.22em] text-mute">Ops</p>
      <h1 className="mt-3 font-serif text-4xl leading-none">Algo não carregou direito.</h1>
      <p className="mt-4 text-sm leading-6 text-mute">Tente de novo. Se continuar, volte em alguns minutos.</p>
      <div className="mt-6 flex gap-4 text-sm">
        <button type="button" onClick={reset} className="underline underline-offset-4">
          Tentar de novo
        </button>
        <Link href="/" className="text-mute underline underline-offset-4">
          Voltar ao início
        </Link>
      </div>
    </div>
  );
}
