export type AddressLookup = {
  rua: string;
  bairro: string;
  cidade: string;
  estado: string;
};

export async function lookupCep(cep: string): Promise<AddressLookup | null> {
  const digits = cep.replace(/\D/g, "");
  if (digits.length !== 8) return null;

  const response = await fetch(`https://viacep.com.br/ws/${digits}/json/`);
  if (!response.ok) return null;

  const data = (await response.json()) as {
    erro?: boolean;
    logradouro?: string;
    bairro?: string;
    localidade?: string;
    uf?: string;
  };

  if (data.erro) return null;

  return {
    rua: data.logradouro ?? "",
    bairro: data.bairro ?? "",
    cidade: data.localidade ?? "",
    estado: data.uf ?? "",
  };
}
