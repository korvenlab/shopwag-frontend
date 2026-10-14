import { Suspense } from "react";
import { AppFrame } from "@/components/app-frame";
import { BottomNav } from "@/components/store/bottom-nav";

export default function StoreLayout({ children, params }: LayoutProps<"/s/[slug]">) {
  return (
    <AppFrame>
      <div className="flex-1 pb-[calc(5rem+env(safe-area-inset-bottom))]">{children}</div>
      <Suspense fallback={<div className="h-16" />}>
        <StoreNav params={params} />
      </Suspense>
    </AppFrame>
  );
}

async function StoreNav({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  return <BottomNav slug={slug} />;
}
