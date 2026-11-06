import { Suspense } from "react";
import type { Metadata } from "next";
import { BottomNav } from "@/components/store/bottom-nav";
import { CartDrawer } from "@/components/store/cart-drawer";
import { StoreFooter } from "@/components/store/store-footer";
import { StoreHeader } from "@/components/store/store-header";
import { StoreNotice } from "@/components/store/store-notice";
import { getStoreBySlug } from "@/features/catalog/queries";
import { siteUrl, storeUrl } from "@/lib/site";
import { asFundoTextura } from "@/lib/storefront";
import { normalizeTheme, themeCss } from "@/lib/theme";

export async function generateMetadata({ params }: LayoutProps<"/s/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const store = await getStoreBySlug(slug).catch(() => null);
  if (!store) return { title: "Loja não encontrada" };
  const title = store.seo_titulo?.trim() || store.nome;
  const description =
    store.seo_descricao?.trim() || store.descricao?.trim().slice(0, 160) || `Confira a vitrine de ${store.nome}.`;
  const image = store.banners?.[0]?.url || store.capa_url || store.logo_url;
  return {
    metadataBase: new URL(siteUrl()),
    title: { default: title, template: `%s · ${store.nome}` },
    description,
    alternates: { canonical: storeUrl(store) },
    robots: store.seo_indexar ? { index: true, follow: true } : { index: false, follow: false },
    icons: store.favicon_url ? { icon: store.favicon_url, apple: store.favicon_url } : undefined,
    openGraph: {
      type: "website",
      locale: "pt_BR",
      siteName: store.nome,
      title,
      description,
      url: storeUrl(store),
      images: image ? [{ url: image }] : undefined,
    },
    twitter: { card: image ? "summary_large_image" : "summary", title, description, images: image ? [image] : undefined },
  };
}

export default function StoreLayout({ children, params }: LayoutProps<"/s/[slug]">) {
  return (
    <Suspense fallback={<div className="relative flex min-h-dvh flex-col bg-ink text-paper">{children}</div>}>
      <StoreShell params={params}>{children}</StoreShell>
    </Suspense>
  );
}

async function StoreShell({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const store = await getStoreBySlug(slug).catch(() => null);
  const texture = asFundoTextura(store?.fundo_textura);
  return (
    <div className="relative flex min-h-dvh flex-col bg-ink text-paper" data-texture={texture}>
      {store ? <style>{themeCss(normalizeTheme(store))}</style> : null}
      <div className="neon-rule" />
      {store ? <StoreNotice store={store} /> : null}
      <StoreHeader store={store ?? { nome: "Shopwag", slug, logo_url: null }} />
      <CartDrawer slug={slug} />
      <BottomNav slug={slug} />
      <main className="flex-1">{children}</main>
      {store ? <StoreFooter store={store} /> : null}
      <div className="h-[calc(4.5rem+env(safe-area-inset-bottom))] md:hidden" />
    </div>
  );
}
