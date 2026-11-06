import { Suspense } from "react";
import { DashboardHome } from "@/components/dashboard/dashboard-home";
import { StoreForm } from "@/components/dashboard/store-form";
import { getOwnStore, listOrders, listShippingRanges } from "@/features/merchant/queries";
import { SCHEMA_MISSING, catchSchema } from "@/lib/schema-error";

export default function DashboardPage() {
  return (
    <Suspense fallback={<p className="px-5 py-8 text-sm text-mute">Carregando painel…</p>}>
      <Home />
    </Suspense>
  );
}

async function Home() {
  const store = await catchSchema(() => getOwnStore());
  if (store === SCHEMA_MISSING || !store) {
    if (store === SCHEMA_MISSING) return null;
    return <StoreForm store={null} />;
  }
  const [orders, ranges] = await Promise.all([listOrders(store.id), listShippingRanges(store.id)]);
  return <DashboardHome store={store} orders={orders} shippingRangeCount={ranges.length} />;
}
