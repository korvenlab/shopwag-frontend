"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { House, Search, ShoppingBag } from "lucide-react";
import { useCartSummary } from "@/features/cart/store";

export function BottomNav({ slug }: { slug: string }) {
  const pathname = usePathname();
  const { count } = useCartSummary(slug);
  const items = [
    { href: `/s/${slug}`, label: "Início", icon: House, match: (path: string) => path === `/s/${slug}` },
    { href: `/s/${slug}/busca`, label: "Busca", icon: Search, match: (path: string) => path.startsWith(`/s/${slug}/busca`) },
    { href: `/s/${slug}/sacola`, label: "Sacola", icon: ShoppingBag, match: (path: string) => path.startsWith(`/s/${slug}/sacola`) || path.startsWith(`/s/${slug}/checkout`) },
  ];

  return (
    <nav className="fixed bottom-0 left-1/2 z-30 w-full max-w-[430px] -translate-x-1/2 border-t border-white/15 bg-ink/95 backdrop-blur">
      <ul className="grid grid-cols-3 pb-[env(safe-area-inset-bottom)]">
        {items.map((item) => {
          const active = item.match(pathname);
          const Icon = item.icon;
          return (
            <li key={item.href}>
              <Link
                href={item.href}
                className={`flex h-16 flex-col items-center justify-center gap-1 text-[11px] ${active ? "text-paper" : "text-mute"}`}
              >
                <span className="relative">
                  <Icon size={20} strokeWidth={1.5} />
                  {item.label === "Sacola" && count > 0 ? (
                    <span className="absolute -top-1.5 -right-2 grid h-4 min-w-4 place-items-center rounded-full bg-paper px-1 text-[10px] text-ink">
                      {count}
                    </span>
                  ) : null}
                </span>
                {item.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
