import { Suspense } from "react";
import { CartView } from "@/components/store/cart-view";

export default function CartPage({ params }: PageProps<"/s/[slug]/sacola">) {
  return (
    <Suspense fallback={<p className="px-5 py-8 text-sm text-mute">Abrindo sacola…</p>}>
      <Cart params={params} />
    </Suspense>
  );
}

async function Cart({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  return <CartView slug={slug} />;
}
