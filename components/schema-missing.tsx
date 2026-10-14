import Link from "next/link";

export function SchemaMissing() {
  return (
    <div className="px-5 py-16">
      <p className="text-[11px] uppercase tracking-[0.22em] text-mute">Banco</p>
      <h1 className="mt-3 font-serif text-4xl leading-none">Falta aplicar o schema.</h1>
      <p className="mt-4 text-sm leading-6 text-mute">
        O projeto Supabase está no ar, mas as tabelas ainda não existem. No diretório
        backend, entre na conta e envie a migration.
      </p>
      <pre className="mt-5 overflow-x-auto rounded-2xl border border-white/15 p-4 text-xs leading-6 text-paper">
        {`npx supabase login
npx supabase link --project-ref kclhtupbsnflpviausmo
npx supabase db push`}
      </pre>
      <Link href="/" className="mt-6 inline-block text-sm underline underline-offset-4">
        Voltar ao início
      </Link>
    </div>
  );
}
