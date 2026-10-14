"use client";

import Link from "next/link";
import { storeHref, useStoreBase } from "@/lib/store-path";

type Props = Omit<React.ComponentProps<typeof Link>, "href"> & { slug: string; path?: string };

/** Link interno da vitrine que funciona tanto em /s/{slug} quanto em {slug}.wagoobot.com. */
export function StoreLink({ slug, path = "", ...props }: Props) {
  const base = useStoreBase(slug);
  return <Link href={storeHref(base, path)} {...props} />;
}
