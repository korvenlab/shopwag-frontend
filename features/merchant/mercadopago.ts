import { apiJson } from "@/lib/api";
import { PLATFORM_FEE_PERCENT } from "@/lib/mercadopago/platform-fee";
import { createClient } from "@/lib/supabase/server";

export type ReceivePlan = "na_hora" | "14_dias" | "30_dias";

export type MpFees = {
  platform_percent: number;
  pass_fees: boolean;
  plan: ReceivePlan;
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

type SupabaseServer = Awaited<ReturnType<typeof createClient>>;

async function storedFees(supabase: SupabaseServer, ownerId: string): Promise<MpFees | undefined> {
  const { data } = await supabase
    .from("lojas")
    .select("repassar_taxas, mp_prazo_recebimento, taxa_pix_percent, taxa_pix_observada_em")
    .eq("owner_id", ownerId)
    .maybeSingle();
  if (!data) return undefined;
  return {
    platform_percent: PLATFORM_FEE_PERCENT,
    pass_fees: Boolean(data.repassar_taxas),
    plan: (data.mp_prazo_recebimento as ReceivePlan | null) ?? "na_hora",
    pix_percent: Number(data.taxa_pix_percent ?? 0.99),
    pix_observed_at: (data.taxa_pix_observada_em as string | null) ?? null,
  };
}

export async function getMpConnection(): Promise<MpConnection> {
  const supabase = await createClient();
  const { data } = await supabase.auth.getSession();
  const session = data.session;
  if (!session) return offline;
  const result = await apiJson<MpConnection>("/api/mercadopago/connect", { accessToken: session.access_token });
  if (result.ok && result.data.fees) return result.data;
  const fees = await storedFees(supabase, session.user.id);
  return result.ok ? { ...result.data, fees } : { ...offline, fees, error: result.data.error };
}
