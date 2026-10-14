import { Suspense } from "react";
import { notFound } from "next/navigation";
import { CheckoutForm } from "@/components/store/checkout-form";
import { SchemaMissing } from "@/components/schema-missing";
import { getStoreBySlug } from "@/features/catalog/queries";
import { SCHEMA_MISSING, catchSchema } from "@/lib/schema-error";

export default function CheckoutPage({ params }: PageProps<"/s/[slug]/checkout">) {
  return (
    <Suspense fallback={<p className="px-5 py-8 text-sm text-mute">Abrindo checkout…</p>}>
      <Checkout params={params} />
    </Suspense>
  );
}

async function Checkout({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const store = await catchSchema(() => getStoreBySlug(slug));
  if (store === SCHEMA_MISSING) return <SchemaMissing />;
  if (!store) notFound();
  return <CheckoutForm store={store} />;
}
