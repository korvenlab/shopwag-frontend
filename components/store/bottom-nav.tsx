"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { House, Search, ShoppingBag } from "lucide-react";
import { useCartDrawer } from "@/features/cart/drawer";
import { useCartSummary } from "@/features/cart/store";

export function BottomNav({ slug }: { slug: string }) {
  const pathname = usePathname();
  const { count } = useCartSummary(slug);
  const openCart = useCartDrawer((state) => state.setOpen);
  const links = [
    { href: `/s/${slug}`, label: "Início", icon: House, active: pathname === `/s/${slug}` },
    { href: `/s/${slug}/busca`, label: "Busca", icon: Search, active: pathname.startsWith(`/s/${slug}/busca`) },
  ];
  const cartActive = pathname.startsWith(`/s/${slug}/sacola`) || pathname.startsWith(`/s/${slug}/checkout`);
  const itemClass = "relative flex h-16 w-full flex-col items-center justify-center gap-1 text-[11px] transition-colors duration-300";

  return (
    <nav className="fixed inset-x-0 bottom-0 z-30 border-t border-paper/10 bg-ink/85 backdrop-blur-xl md:hidden">
      <ul className="grid grid-cols-3 pb-[env(safe-area-inset-bottom)]">
        {links.map((item) => {
          const Icon = item.icon;
          return (
            <li key={item.href}>
              <Link href={item.href} className={`${itemClass} ${item.active ? "text-paper" : "text-mute"}`}>
                <Icon size={20} strokeWidth={1.5} />
                {item.label}
                <Indicator active={item.active} />
              </Link>
            </li>
          );
        })}
        <li>
          <button type="button" onClick={() => openCart(true)} className={`${itemClass} ${cartActive ? "text-paper" : "text-mute"}`}>
            <span className="relative">
              <ShoppingBag size={20} strokeWidth={1.5} />
              {count > 0 ? (
                <span
                  key={count}
                  className="bump absolute -top-1.5 -right-2 grid h-4 min-w-4 place-items-center rounded-full bg-accent px-1 text-[10px] text-on-accent"
                >
                  {count}
                </span>
              ) : null}
            </span>
            Sacola
            <Indicator active={cartActive} />
          </button>
        </li>
      </ul>
    </nav>
  );
}

function Indicator({ active }: { active: boolean }) {
  return (
    <span
      aria-hidden
      className={`absolute top-0 h-px bg-accent shadow-[0_0_12px_color-mix(in_srgb,var(--color-accent)_90%,transparent)] transition-all duration-500 ease-out-expo ${
        active ? "w-10 opacity-100" : "w-0 opacity-0"
      }`}
    />
  );
}
