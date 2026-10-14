const KNOWN: [RegExp, string][] = [
  [/invalid login credentials/i, "E-mail ou senha incorretos."],
  [/email not confirmed/i, "Confirme seu e-mail pelo link que enviamos antes de entrar."],
  [/user already registered|already been registered/i, "Já existe uma conta com este e-mail. Entre com sua senha."],
  [/password should be at least|weak password/i, "Use uma senha com pelo menos 6 caracteres."],
  [/unable to validate email|invalid email|email address .* is invalid/i, "Confira o e-mail digitado."],
  [/rate limit|too many requests|security purposes/i, "Muitas tentativas seguidas. Aguarde um minuto e tente de novo."],
  [/jwt|session|not authenticated|refresh token/i, "Sua sessão terminou. Entre de novo para continuar."],
  [/lojas_slug/i, "Esse endereço de vitrine já está em uso. Escolha outro."],
  [/produtos_loja_id_slug|duplicate key.*produtos/i, "Você já tem uma peça com esse nome. Use um nome diferente."],
  [/payload too large|exceeded the maximum allowed size/i, "A imagem é grande demais. Envie uma de até 3 MB."],
  [/mime type|invalid.*content type/i, "Formato de imagem não aceito. Use PNG, JPG ou WEBP."],
  [/failed to fetch|network|load failed/i, "Sem conexão. Confira a internet e tente de novo."],
];

/**
 * Converte erros técnicos (Supabase, rede, Postgres) em uma frase para o lojista ou o cliente.
 * Erros P0001 vêm do `raise exception` das nossas funções SQL, já escritos para o usuário.
 */
export function friendlyError(error: unknown, fallback = "Não foi possível concluir. Tente de novo.") {
  const detail = error as { message?: string; code?: string } | null;
  const raw = typeof error === "string" ? error : detail?.message;
  if (!raw) return fallback;
  if (detail?.code === "P0001") return raw;
  const hit = KNOWN.find(([pattern]) => pattern.test(raw));
  if (hit) return hit[1];
  if (process.env.NODE_ENV !== "production") console.warn("[erro]", raw);
  return fallback;
}
