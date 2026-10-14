import { z } from "zod";

export const checkoutSchema = z.object({
  nome: z.string().trim().min(3, "Informe o nome completo").max(120),
  whatsapp: z
    .string()
    .trim()
    .refine((value) => value.replace(/\D/g, "").length >= 10, "WhatsApp inválido"),
  cep: z
    .string()
    .trim()
    .refine((value) => value.replace(/\D/g, "").length === 8, "CEP inválido"),
  rua: z.string().trim().min(2, "Informe a rua").max(140),
  numero: z.string().trim().min(1, "Informe o número").max(20),
  complemento: z.string().trim().max(80),
  bairro: z.string().trim().min(2, "Informe o bairro").max(80),
  cidade: z.string().trim().min(2, "Informe a cidade").max(80),
  estado: z
    .string()
    .trim()
    .length(2, "UF com 2 letras")
    .regex(/^[A-Za-z]{2}$/, "UF inválida"),
  email: z
    .string()
    .trim()
    .refine((value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value), "Informe um e-mail válido"),
  observacoes: z.string().trim().max(400),
});

export type CheckoutInput = z.infer<typeof checkoutSchema>;

export function firstIssue(error: z.ZodError) {
  return error.issues[0]?.message ?? "Revise os dados de entrega";
}
