import { Suspense } from "react";
import { redirect } from "next/navigation";
import { AppFrame } from "@/components/app-frame";
import { DashboardNav } from "@/components/dashboard/nav";
import { SchemaMissing } from "@/components/schema-missing";
import { getMerchant, getOwnStore } from "@/features/merchant/queries";
import { SCHEMA_MISSING, catchSchema } from "@/lib/schema-error";

export default function DashboardLayout({ children }: LayoutProps<"/dashboard">) {
  return (
    <AppFrame>
      <Suspense fallback={<p className="px-5 py-8 text-sm text-mute">Abrindo painel…</p>}>
        <Gate>{children}</Gate>
      </Suspense>
    </AppFrame>
  );
}

async function Gate({ children }: { children: React.ReactNode }) {
  const merchant = await getMerchant();
  if (!merchant) redirect("/login");
  const store = await catchSchema(() => getOwnStore());
  if (store === SCHEMA_MISSING) return <SchemaMissing />;
  return (
    <>
      <DashboardNav store={store} />
      <div className="pb-8">{children}</div>
    </>
  );
}
