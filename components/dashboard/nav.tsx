"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import type { Loja } from "@/features/domain/types";

const links = [
  { href: "/dashboard", label: "Pedidos" },
  { href: "/dashboard/produtos", label: "Produtos" },
  { href: "/dashboard/vitrine", label: "Vitrine" },
  { href: "/dashboard/loja", label: "Loja" },
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

  return (
    <header className="px-5 pt-5">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-[11px] uppercase tracking-[0.22em] text-mute">Painel</p>
          <p className="mt-1 font-serif text-2xl">{store?.nome ?? "Sua loja"}</p>
        </div>
        <button type="button" onClick={signOut} className="text-xs text-mute underline underline-offset-4">
          Sair
        </button>
      </div>
      {store ? (
        <Link href={`/s/${store.slug}`} className="mt-2 inline-block text-xs text-mute underline underline-offset-4">
          Ver vitrine
        </Link>
      ) : null}
      <nav className="mt-4 grid grid-cols-4 gap-2">
        {links.map((link) => {
          const active = link.href === "/dashboard" ? pathname === "/dashboard" || pathname.startsWith("/dashboard/pedidos") : pathname.startsWith(link.href);
          return (
            <Link
              key={link.href}
              href={link.href}
              className={`grid h-11 place-items-center rounded-full text-sm ${active ? "bg-paper text-ink" : "border border-white/15"}`}
            >
              {link.label}
            </Link>
          );
        })}
      </nav>
    </header>
  );
}
