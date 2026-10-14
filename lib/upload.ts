import { friendlyError } from "@/lib/friendly-error";
import { createClient } from "@/lib/supabase/client";

export const IMAGE_BUCKET = "produto-imagens";
export const IMAGE_TYPES = ["image/png", "image/jpeg", "image/webp"];
const MAX_BYTES = 3 * 1024 * 1024;

/** O primeiro nível do caminho precisa ser o id da loja (regra do Storage). */
export async function uploadImage(
  storeId: string,
  folder: string,
  file: File,
  types: string[] = IMAGE_TYPES,
): Promise<{ url: string; error: null } | { url: null; error: string }> {
  if (!types.includes(file.type)) return { url: null, error: "Envie uma imagem PNG, JPG ou WEBP." };
  if (file.size > MAX_BYTES) return { url: null, error: "A imagem precisa ter até 3 MB." };
  const ext = (file.name.split(".").pop() || "png").toLowerCase().replace(/[^a-z0-9]/g, "") || "png";
  const path = `${storeId}/${folder}/${crypto.randomUUID()}.${ext}`;
  const supabase = createClient();
  const { error } = await supabase.storage
    .from(IMAGE_BUCKET)
    .upload(path, file, { cacheControl: "31536000", contentType: file.type, upsert: false });
  if (error) return { url: null, error: friendlyError(error, "Não foi possível enviar a imagem. Tente de novo.") };
  return { url: supabase.storage.from(IMAGE_BUCKET).getPublicUrl(path).data.publicUrl, error: null };
}
