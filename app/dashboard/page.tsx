import { Suspense } from "react";
import { OrderList } from "@/components/dashboard/order-list";
import { StoreForm } from "@/components/dashboard/store-form";
import { getOwnStore, listOrders } from "@/features/merchant/queries";
import { SCHEMA_MISSING, catchSchema } from "@/lib/schema-error";

export default function DashboardPage() {
  return (
    <Suspense fallback={<p className="px-5 py-8 text-sm text-mute">Carregando pedidos…</p>}>
      <Orders />
    </Suspense>
  );
}

async function Orders() {
  const store = await catchSchema(() => getOwnStore());
  if (store === SCHEMA_MISSING || !store) {
    if (store === SCHEMA_MISSING) return null;
    return <StoreForm store={null} />;
  }
  const orders = await listOrders(store.id);
  return <OrderList orders={orders} />;
}
