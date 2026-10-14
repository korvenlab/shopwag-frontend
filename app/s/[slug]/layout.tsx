import { Suspense } from "react";
import { BottomNav } from "@/components/store/bottom-nav";
import { CartDrawer } from "@/components/store/cart-drawer";
import { StoreHeader } from "@/components/store/store-header";
import { getStoreBySlug } from "@/features/catalog/queries";
import { themeCss } from "@/lib/theme";

export default function StoreLayout({ children, params }: LayoutProps<"/s/[slug]">) {
  return (
    <div className="relative flex min-h-dvh flex-col bg-ink text-paper">
      <div className="neon-rule" />
      <Suspense fallback={<div className="h-16 md:h-20" />}>
        <StoreChrome params={params} />
      </Suspense>
      <main className="flex-1 pb-[calc(5rem+env(safe-area-inset-bottom))] md:pb-16">{children}</main>
      <footer className="hidden border-t border-paper/10 md:block">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-8 py-8 text-xs text-mute">
          <span>Pagamento por Pix via Mercado Pago</span>
          <span>
            Feito com <span className="text-paper">Shopwag</span>
          </span>
        </div>
      </footer>
    </div>
  );
}

async function StoreChrome({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const store = await getStoreBySlug(slug).catch(() => null);
  return (
    <>
      {store ? <style>{themeCss(store)}</style> : null}
      <StoreHeader store={store ?? { nome: "Shopwag", slug, logo_url: null }} />
      <CartDrawer slug={slug} />
      <BottomNav slug={slug} />
    </>
  );
}
