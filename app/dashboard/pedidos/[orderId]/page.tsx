import { Suspense } from "react";
import { notFound } from "next/navigation";
import { OrderManager } from "@/components/dashboard/order-manager";
import { getOwnStore, listOrders } from "@/features/merchant/queries";
import { SCHEMA_MISSING, catchSchema } from "@/lib/schema-error";

export default function OrderPage({ params }: PageProps<"/dashboard/pedidos/[orderId]">) {
  return (
    <Suspense fallback={<p className="px-5 py-8 text-sm text-mute">Carregando pedido…</p>}>
      <Order params={params} />
    </Suspense>
  );
}

async function Order({ params }: { params: Promise<{ orderId: string }> }) {
  const { orderId } = await params;
  const store = await catchSchema(() => getOwnStore());
  if (store === SCHEMA_MISSING) return null;
  if (!store) notFound();
  const orders = await listOrders(store.id);
  const order = orders.find((item) => item.id === orderId);
  if (!order) notFound();
  return <OrderManager order={order} />;
}
