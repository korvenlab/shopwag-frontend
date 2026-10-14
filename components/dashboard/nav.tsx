"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { ExternalLink, LayoutTemplate, LogOut, Package, Receipt, Store } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import type { Loja } from "@/features/domain/types";
import { storeUrl } from "@/lib/site";

const links = [
  { href: "/dashboard", label: "Pedidos", icon: Receipt },
  { href: "/dashboard/produtos", label: "Produtos", icon: Package },
  { href: "/dashboard/vitrine", label: "Vitrine", icon: LayoutTemplate },
  { href: "/dashboard/loja", label: "Loja", icon: Store },
];

export function DashboardNav({ store }: { store: Loja | null }) {
  const pathname = usePathname();
  const router = useRouter();

  async function signOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  function isActive(href: string) {
    return href === "/dashboard" ? pathname === "/dashboard" || pathname.startsWith("/dashboard/pedidos") : pathname.startsWith(href);
  }

  const storeLink = store ? (
    <a
      href={storeUrl(store)}
      target="_blank"
      rel="noreferrer"
      className="mt-2 inline-flex items-center gap-1.5 text-xs text-mute underline underline-offset-4 transition hover:text-paper"
    >
      Ver vitrine <ExternalLink size={12} />
    </a>
  ) : null;

  return (
    <>
      <header className="dash-dark px-5 pt-5 pb-4 lg:hidden">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[11px] uppercase tracking-[0.22em] text-mute">Painel</p>
            <p className="mt-1 font-serif text-2xl">{store?.nome ?? "Sua loja"}</p>
          </div>
          <button type="button" onClick={signOut} className="text-xs text-mute underline underline-offset-4">
            Sair
          </button>
        </div>
        {storeLink}
        <nav className="mt-4 grid grid-cols-4 gap-2">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`grid h-11 place-items-center rounded-full text-sm ${isActive(link.href) ? "bg-paper text-ink" : "border border-paper/15"}`}
            >
              {link.label}
            </Link>
          ))}
        </nav>
      </header>

      <aside className="dash-dark relative hidden lg:block">
        <div aria-hidden className="neon-pulse absolute inset-y-0 right-0 w-px bg-white" />
        <div className="sticky top-0 flex h-dvh flex-col px-6 py-8">
          <p className="text-[11px] uppercase tracking-[0.22em] text-mute">Shopwag · Painel</p>
          <p className="mt-3 font-serif text-3xl leading-tight break-words">{store?.nome ?? "Sua loja"}</p>
          {storeLink}
          <nav className="mt-10 space-y-1.5">
            {links.map((link) => {
              const Icon = link.icon;
              const active = isActive(link.href);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`flex h-11 items-center gap-3 rounded-full px-4 text-sm transition ${
                    active ? "bg-paper text-ink" : "text-paper/80 hover:bg-paper/5 hover:text-paper"
                  }`}
                >
                  <Icon size={16} strokeWidth={1.75} />
                  {link.label}
                </Link>
              );
            })}
          </nav>
          <button
            type="button"
            onClick={signOut}
            className="mt-auto flex h-11 items-center gap-3 rounded-full px-4 text-sm text-mute transition hover:bg-paper/5 hover:text-paper"
          >
            <LogOut size={16} strokeWidth={1.75} />
            Sair
          </button>
        </div>
      </aside>
    </>
  );
}
