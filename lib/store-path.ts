"use client";

import { useSyncExternalStore } from "react";
import { subdomainSlug } from "@/lib/site";

const subscribe = () => () => {};

/**
 * Prefixo dos links da vitrine: "" em {slug}.wagoobot.com e "/s/{slug}" no domínio principal.
 * No servidor sempre "/s/{slug}" (o proxy aceita os dois formatos no subdomínio).
 */
export function useStoreBase(slug: string) {
  return useSyncExternalStore(
    subscribe,
    () => (subdomainSlug(window.location.hostname) === slug ? "" : `/s/${slug}`),
    () => `/s/${slug}`,
  );
}

export function storeHref(base: string, path = "") {
  return `${base}${path}` || "/";
}
