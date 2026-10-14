import { Suspense } from "react";
import { redirect } from "next/navigation";
import { AppFrame } from "@/components/app-frame";
import { DashboardNav } from "@/components/dashboard/nav";
import { SchemaMissing } from "@/components/schema-missing";
import { getMerchant, getOwnStore } from "@/features/merchant/queries";
import { SCHEMA_MISSING, catchSchema } from "@/lib/schema-error";
import { contrastRatio, normalizeTheme, themeCss, type StoreTheme } from "@/lib/theme";

const NEW_STORE_THEME = { cor_fundo: "#f4efe6", cor_texto: "#1f1b16", cor_destaque: "#1f1b16" };
const CHECKBOX = "input[type=checkbox]{accent-color:#1e8e4e;}";

function dashboardCss(input: Partial<StoreTheme>) {
  const { cor_fundo } = normalizeTheme(input);
  const light = contrastRatio(cor_fundo, "#000000") > contrastRatio(cor_fundo, "#ffffff");
  const panel = light ? `:root{--theme-panel:color-mix(in srgb, ${cor_fundo} 30%, #ffffff);}` : "";
  return themeCss(input) + panel + CHECKBOX;
}

export default function DashboardLayout({ children }: LayoutProps<"/dashboard">) {
  return (
    <AppFrame wide>
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
    <div className="flex-1 lg:grid lg:grid-cols-[264px_minmax(0,1fr)]">
      <style>{dashboardCss(store ?? NEW_STORE_THEME)}</style>
      <DashboardNav store={store} />
      <div className="pb-8 lg:px-8 lg:pt-4 lg:pb-16">
        <div className="lg:mx-auto lg:max-w-[880px]">{children}</div>
      </div>
    </div>
  );
}
