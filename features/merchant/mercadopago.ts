import { apiJson } from "@/lib/api";
import { createClient } from "@/lib/supabase/server";

export type MpFees = {
  platform_percent: number;
  pass_fees: boolean;
  pix_percent: number;
  pix_observed_at: string | null;
};

export type MpConnection = {
  available: boolean;
  connected: boolean;
  status: string | null;
  user_id: string | null;
  live_mode: boolean | null;
  fees?: MpFees;
  error?: string;
};

const offline: MpConnection = { available: false, connected: false, status: null, user_id: null, live_mode: null };

export async function getMpConnection(): Promise<MpConnection> {
  const supabase = await createClient();
  const { data } = await supabase.auth.getSession();
  const accessToken = data.session?.access_token;
  if (!accessToken) return offline;
  const result = await apiJson<MpConnection>("/api/mercadopago/connect", { accessToken });
  if (!result.ok) return { ...offline, error: result.data.error };
  return result.data;
}
