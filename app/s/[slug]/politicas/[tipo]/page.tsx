import { Suspense } from "react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { POLICIES } from "@/components/store/store-footer";
import { StoreLink } from "@/components/store/store-link";
import { getStoreBySlug } from "@/features/catalog/queries";

function findPolicy(tipo: string) {
  return POLICIES.find((item) => item.slug === tipo) ?? null;
}

export async function generateMetadata({ params }: PageProps<"/s/[slug]/politicas/[tipo]">): Promise<Metadata> {
  const { tipo } = await params;
  const policy = findPolicy(tipo);
  return policy ? { title: policy.label } : {};
}

export default function PolicyPage({ params }: PageProps<"/s/[slug]/politicas/[tipo]">) {
  return (
    <Suspense fallback={<div className="mx-auto max-w-3xl px-5 py-10 text-sm text-mute">Carregando…</div>}>
      <Policy params={params} />
    </Suspense>
  );
}

async function Policy({ params }: { params: Promise<{ slug: string; tipo: string }> }) {
  const { slug, tipo } = await params;
  const policy = findPolicy(tipo);
  const store = policy ? await getStoreBySlug(slug).catch(() => null) : null;
  const text = policy && store ? store[policy.field]?.trim() : null;
  if (!policy || !store || !text) notFound();

  return (
    <article className="page-enter mx-auto max-w-3xl px-5 py-10 md:px-8 md:py-16">
      <StoreLink slug={slug} className="inline-flex items-center gap-2 text-sm text-mute transition hover:text-paper">
        <ArrowLeft size={16} /> Voltar para a loja
      </StoreLink>
      <h1 className="mt-6 font-serif text-4xl md:text-5xl">{policy.label}</h1>
      <div className="mt-8 space-y-4 text-[15px] leading-7 text-paper/85">
        {text.split(/\n{2,}/).map((paragraph, index) => (
          <p key={index} className="whitespace-pre-line">
            {paragraph}
          </p>
        ))}
      </div>
    </article>
  );
}
