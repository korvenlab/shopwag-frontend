import Link from "next/link";

export function SchemaMissing() {
  return (
    <div className="px-5 py-16">
      <p className="text-[11px] uppercase tracking-[0.22em] text-mute">Shopwag</p>
      <h1 className="mt-3 font-serif text-4xl leading-none">Voltamos em instantes.</h1>
      <p className="mt-4 text-sm leading-6 text-mute">
        Estamos fazendo uma atualização rápida. Atualize a página em alguns minutos.
      </p>
      <Link href="/" className="mt-6 inline-block text-sm underline underline-offset-4">
        Voltar ao início
      </Link>
    </div>
  );
}
