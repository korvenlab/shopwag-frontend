import { Suspense } from "react";
import { MercadoPagoConnect } from "@/components/dashboard/mp-connect";
import { StoreAppearance } from "@/components/dashboard/store-appearance";
import { StoreForm } from "@/components/dashboard/store-form";
import { getMpConnection } from "@/features/merchant/mercadopago";
import { getOwnStore } from "@/features/merchant/queries";
import { SCHEMA_MISSING, catchSchema } from "@/lib/schema-error";

export default function StoreSettingsPage({ searchParams }: PageProps<"/dashboard/loja">) {
  return (
    <Suspense fallback={<p className="px-5 py-8 text-sm text-mute">Carregando loja…</p>}>
      <Settings searchParams={searchParams} />
    </Suspense>
  );
}

async function Settings({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const query = await searchParams;
  const flag = typeof query.mercadopago === "string" ? query.mercadopago : null;
  const message = typeof query.message === "string" ? query.message : null;
  const notice =
    flag === "connected"
      ? { ok: true, text: "Mercado Pago conectado. Os pagamentos caem direto na sua conta." }
      : flag === "denied"
        ? { ok: false, text: "Conexão cancelada no Mercado Pago." }
        : flag === "error"
          ? { ok: false, text: message || "Não foi possível conectar." }
          : null;
  const store = await catchSchema(() => getOwnStore());
  if (store === SCHEMA_MISSING) return null;
  return (
    <>
      <StoreForm store={store} />
      {store ? <StoreAppearance store={store} /> : null}
      {store ? <MercadoPagoConnect notice={notice} initial={await getMpConnection()} /> : null}
    </>
  );
}
