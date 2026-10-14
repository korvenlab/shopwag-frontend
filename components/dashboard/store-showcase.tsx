"use client";

import { useState } from "react";
import { ArrowDown, ArrowUp, Trash2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import type { Banner, Loja } from "@/features/domain/types";
import { uploadImage } from "@/lib/upload";
import { Field, Group, SaveBar, Section, UploadButton, emptyToNull, useStoreSave } from "./settings-ui";

const MAX_BANNERS = 7;

export function StoreShowcase({ store }: { store: Loja }) {
  const [banners, setBanners] = useState<Banner[]>(store.banners ?? []);
  const [aviso, setAviso] = useState(store.aviso_topo ?? "");
  const [favicon, setFavicon] = useState(store.favicon_url);
  const [uploading, setUploading] = useState<"banner" | "favicon" | null>(null);
  const { pending, message, setMessage, save } = useStoreSave(store.id, "Vitrine salva. Já aparece para os clientes.");

  async function addBanners(files: File[]) {
    setMessage(null);
    const room = MAX_BANNERS - banners.length;
    if (room <= 0) {
      setMessage({ ok: false, text: `Você pode ter até ${MAX_BANNERS} banners.` });
      return;
    }
    setUploading("banner");
    const added: Banner[] = [];
    for (const file of files.slice(0, room)) {
      const result = await uploadImage(store.id, "banners", file);
      if (result.url === null) {
        setMessage({ ok: false, text: result.error });
        break;
      }
      added.push({ url: result.url, link: null });
    }
    setUploading(null);
    setBanners((current) => [...current, ...added]);
  }

  async function changeFavicon(file: File) {
    setMessage(null);
    setUploading("favicon");
    const result = await uploadImage(store.id, "marca", file, ["image/png"]);
    setUploading(null);
    if (result.url === null) {
      setMessage({ ok: false, text: file.type === "image/png" ? result.error : "Envie o ícone em PNG." });
    } else setFavicon(result.url);
  }

  function move(index: number, delta: number) {
    setBanners((current) => {
      const next = [...current];
      const target = index + delta;
      if (target < 0 || target >= next.length) return current;
      [next[index], next[target]] = [next[target], next[index]];
      return next;
    });
  }

  return (
    <Section
      id="vitrine"
      eyebrow="Vitrine"
      title="Banners e avisos"
      description="Os banners passam sozinhos no topo da loja, um a cada 6 segundos."
    >
      <Group title={`Banners (${banners.length}/${MAX_BANNERS})`}>
        {banners.length ? (
          <ul className="space-y-3">
            {banners.map((banner, index) => (
              <li key={`${banner.url}-${index}`} className="rounded-2xl border border-paper/10 p-2">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={banner.url} alt="" className="aspect-[3/1] w-full rounded-xl object-cover" />
                <div className="mt-2 flex items-center gap-2">
                  <Input
                    value={banner.link ?? ""}
                    placeholder="Link ao tocar (opcional)"
                    aria-label={`Link do banner ${index + 1}`}
                    onChange={(event) =>
                      setBanners((current) =>
                        current.map((item, position) => (position === index ? { ...item, link: event.target.value } : item)),
                      )
                    }
                  />
                  <IconButton label="Subir" onClick={() => move(index, -1)} disabled={index === 0}>
                    <ArrowUp size={15} />
                  </IconButton>
                  <IconButton label="Descer" onClick={() => move(index, 1)} disabled={index === banners.length - 1}>
                    <ArrowDown size={15} />
                  </IconButton>
                  <IconButton
                    label="Remover"
                    onClick={() => setBanners((current) => current.filter((_, position) => position !== index))}
                  >
                    <Trash2 size={15} />
                  </IconButton>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-mute">Sem banners, a vitrine mostra a capa da loja.</p>
        )}
        <div className="mt-3">
          <UploadButton
            label="Adicionar banners"
            multiple
            busy={uploading === "banner"}
            onFiles={(files) => void addBanners(files)}
          />
        </div>
        <p className="mt-2 text-xs text-mute">Formato largo, como 1800×600. PNG, JPG ou WEBP até 3 MB.</p>
      </Group>

      <Group title="Aviso no topo">
        <Field label="Mensagem" htmlFor="aviso" hint="Aparece numa faixa acima do menu. Deixe vazio para esconder.">
          <Input
            id="aviso"
            value={aviso}
            maxLength={160}
            placeholder="Frete grátis acima de R$ 199"
            onChange={(event) => setAviso(event.target.value)}
          />
        </Field>
      </Group>

      <Group title="Ícone da aba (favicon)">
        <div className="flex items-center gap-4">
          {favicon ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={favicon} alt="" className="h-12 w-12 rounded-xl border border-paper/10 object-cover" />
          ) : (
            <span className="grid h-12 w-12 place-items-center rounded-xl border border-dashed border-paper/20 text-[10px] text-mute">
              Sem
            </span>
          )}
          <UploadButton
            label={favicon ? "Trocar ícone" : "Enviar ícone"}
            accept="image/png"
            busy={uploading === "favicon"}
            onFiles={([file]) => void changeFavicon(file)}
          />
          {favicon ? (
            <button type="button" onClick={() => setFavicon(null)} className="text-xs text-mute hover:text-paper">
              Remover
            </button>
          ) : null}
        </div>
        <p className="mt-2 text-xs text-mute">PNG quadrado, como 512×512.</p>
      </Group>

      <SaveBar
        message={message}
        pending={pending}
        disabled={uploading !== null}
        label="Salvar vitrine"
        onSave={() =>
          void save({
            banners: banners.map((banner) => ({ url: banner.url, link: emptyToNull(banner.link ?? "") })),
            aviso_topo: emptyToNull(aviso),
            favicon_url: favicon,
          })
        }
      />
    </Section>
  );
}

function IconButton({
  label,
  disabled,
  onClick,
  children,
}: {
  label: string;
  disabled?: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      disabled={disabled}
      onClick={onClick}
      className="grid h-10 w-10 shrink-0 place-items-center rounded-full border border-paper/15 text-mute transition hover:border-paper/50 hover:text-paper disabled:opacity-30"
    >
      {children}
    </button>
  );
}
