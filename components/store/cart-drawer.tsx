"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { ShoppingBag, X } from "lucide-react";
import { CartLines } from "@/components/store/cart-view";
import { Button } from "@/components/ui/button";
import { useCartDrawer } from "@/features/cart/drawer";
import { useCartSummary } from "@/features/cart/store";
import { formatBRL } from "@/lib/money";

export function CartDrawer({ slug }: { slug: string }) {
  const open = useCartDrawer((state) => state.open);
  const setOpen = useCartDrawer((state) => state.setOpen);
  const { items, total, count } = useCartSummary(slug);
  const pathname = usePathname();

  useEffect(() => {
    setOpen(false);
  }, [pathname, setOpen]);

  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <Dialog.Portal>
        <Dialog.Overlay className="overlay-anim fixed inset-0 z-40 bg-black/60 backdrop-blur-sm" />
        <Dialog.Content
          aria-describedby={undefined}
          className="sheet-anim fixed inset-x-0 bottom-0 z-50 flex max-h-[88dvh] flex-col rounded-t-[2rem] border-t border-paper/15 bg-ink text-paper shadow-[0_0_60px_color-mix(in_srgb,var(--color-paper)_6%,transparent)] md:inset-y-0 md:right-0 md:left-auto md:max-h-none md:w-[420px] md:rounded-none md:border-t-0 md:border-l"
        >
          <div className="mx-auto mt-3 h-1 w-10 rounded-full bg-paper/20 md:hidden" />
          <div className="flex items-center justify-between px-5 pt-4 pb-3 md:pt-6">
            <Dialog.Title className="font-serif text-3xl">
              Sacola{count > 0 ? <span className="ml-2 text-base text-mute">{count}</span> : null}
            </Dialog.Title>
            <Dialog.Close
              aria-label="Fechar"
              className="grid h-10 w-10 place-items-center rounded-full border border-paper/15 transition hover:rotate-90 hover:border-paper/60 duration-300"
            >
              <X size={18} />
            </Dialog.Close>
          </div>
          <div className="neon-rule mx-5" />

          {items.length === 0 ? (
            <div className="flex flex-1 flex-col items-center justify-center gap-4 px-8 py-16 text-center">
              <ShoppingBag size={36} strokeWidth={1} className="text-mute" />
              <p className="text-sm text-mute">Sua sacola está vazia.</p>
              <Dialog.Close asChild>
                <Button variant="ghost">Continuar comprando</Button>
              </Dialog.Close>
            </div>
          ) : (
            <>
              <div className="flex-1 overflow-y-auto px-5">
                <CartLines slug={slug} />
              </div>
              <div className="border-t border-paper/10 px-5 pt-4 pb-[calc(1rem+env(safe-area-inset-bottom))]">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-mute">Subtotal</span>
                  <span className="font-serif text-2xl">{formatBRL(total)}</span>
                </div>
                <Button asChild className="mt-4 w-full">
                  <Link href={`/s/${slug}/checkout`}>Fechar pedido</Link>
                </Button>
                <Dialog.Close className="mt-2 h-11 w-full text-sm text-mute transition hover:text-paper">
                  Continuar comprando
                </Dialog.Close>
              </div>
            </>
          )}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
