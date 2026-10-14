import { apiJson } from "@/lib/api";
import { createClient } from "@/lib/supabase/client";

export type AddressView = { host: string | null; status: "off" | "manual" | "pending" | "active" };

async function accessToken() {
  const { data } = await createClient().auth.getSession();
  return data.session?.access_token;
}

export async function getStoreAddress() {
  return apiJson<AddressView>("/api/domains", { accessToken: await accessToken() });
}

/** Liga {slug}.wagoobot.com à loja. Seguro chamar sempre que a loja for salva. */
export async function syncStoreAddress() {
  return apiJson<AddressView>("/api/domains/sync", { method: "POST", accessToken: await accessToken() });
}
