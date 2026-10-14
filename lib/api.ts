/** URL pública do shopwag-backend (Render). Não é segredo; as chaves ficam só no backend. */
export function apiUrl(path: string) {
  const base = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000").replace(/\/$/, "");
  return `${base}${path}`;
}

export async function apiJson<T>(path: string, init: RequestInit & { accessToken?: string } = {}) {
  const { accessToken, headers, ...rest } = init;
  try {
    const response = await fetch(apiUrl(path), {
      ...rest,
      headers: {
        ...(rest.body ? { "content-type": "application/json" } : {}),
        ...(accessToken ? { authorization: `Bearer ${accessToken}` } : {}),
        ...headers,
      },
      cache: "no-store",
    });
    const data = (await response.json().catch(() => ({}))) as T & { error?: string };
    return { ok: response.ok, status: response.status, data };
  } catch {
    return {
      ok: false,
      status: 0,
      data: { error: "Não conseguimos conectar agora. Confira a internet e tente de novo." } as T & {
        error?: string;
      },
    };
  }
}
