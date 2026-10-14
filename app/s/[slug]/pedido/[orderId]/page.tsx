import { Suspense } from "react";
import { notFound } from "next/navigation";
import { ReceiptView } from "@/components/store/receipt-view";
import { SchemaMissing } from "@/components/schema-missing";
import { getReceipt } from "@/features/catalog/queries";
import { SCHEMA_MISSING, catchSchema } from "@/lib/schema-error";

export default function ReceiptPage({
  params,
  searchParams,
}: PageProps<"/s/[slug]/pedido/[orderId]">) {
  return (
    <Suspense fallback={<p className="px-5 py-8 text-sm text-mute">Abrindo pedido…</p>}>
      <Receipt params={params} searchParams={searchParams} />
    </Suspense>
  );
}

async function Receipt({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string; orderId: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { orderId } = await params;
  const query = await searchParams;
  const token = typeof query.t === "string" ? query.t : "";
  if (!token) notFound();

  const receipt = await catchSchema(() => getReceipt(orderId, token));
  if (receipt === SCHEMA_MISSING) return <SchemaMissing />;
  if (!receipt) notFound();
  const payError = typeof query.erro === "string" ? query.erro : null;
  return <ReceiptView receipt={receipt} token={token} payError={payError} />;
}
