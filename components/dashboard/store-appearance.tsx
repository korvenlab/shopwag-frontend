"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Check, ImagePlus, ShoppingBag, Trash2 } from "lucide-react";
import { StoreLogo, monogram } from "@/components/store/store-logo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { Loja } from "@/features/domain/types";
import { friendlyError } from "@/lib/friendly-error";
import { createClient } from "@/lib/supabase/client";
import {
  FONTS,
  PRESETS,
  contrastRatio,
  normalizeTheme,
  safeHex,
  themeStyle,
  type FontKey,
  type LogoShape,
  type StoreTheme,
} from "@/lib/theme";

const BUCKET = "produto-imagens";
const MAX_BYTES = 3 * 1024 * 1024;
const SHAPES: Array<{ key: LogoShape; label: string }> = [
  { key: "circulo", label: "Círculo" },
  { key: "arredondado", label: "Arredondado" },
  { key: "quadrado", label: "Quadrado" },
];

export function StoreAppearance({ store }: { store: Loja }) {
  const router = useRouter();
  const [theme, setTheme] = useState<StoreTheme>(normalizeTheme(store));
  const [logoUrl, setLogoUrl] = useState(store.logo_url);
  const [capaUrl, setCapaUrl] = useState(store.capa_url);
  const [logoFormato, setLogoFormato] = useState<LogoShape>(store.logo_formato ?? "arredondado");
  const [logoTexto, setLogoTexto] = useState(store.logo_texto ?? "");
  const [mostrarNome, setMostrarNome] = useState(store.mostrar_nome ?? true);
  const [uploading, setUploading] = useState<"logo" | "capa" | null>(null);
  const [pending, setPending] = useState(false);
  const [message, setMessage] = useState<{ ok: boolean; text: string } | null>(null);

  const preview = {
    nome: store.nome,
    logo_url: logoUrl,
    logo_formato: logoFormato,
    logo_texto: logoTexto.trim() || null,
  };
  const readable = contrastRatio(theme.cor_texto, theme.cor_fundo) >= 4.5;
  const activePreset = PRESETS.find(
    (preset) =>
      preset.cor_fundo === theme.cor_fundo &&
      preset.cor_texto === theme.cor_texto &&
      preset.cor_destaque === theme.cor_destaque,
  );

  function setColor(key: "cor_fundo" | "cor_texto" | "cor_destaque", value: string) {
    setTheme((current) => ({ ...current, [key]: value }));
  }

  async function upload(kind: "logo" | "capa", file: File) {
    setMessage(null);
    if (!["image/png", "image/jpeg", "image/webp"].includes(file.type)) {
      setMessage({ ok: false, text: "Envie uma imagem PNG, JPG ou WEBP." });
      return;
    }
    if (file.size > MAX_BYTES) {
      setMessage({ ok: false, text: "A imagem precisa ter até 3 MB." });
      return;
    }
    setUploading(kind);
    const ext = (file.name.split(".").pop() || "png").toLowerCase().replace(/[^a-z0-9]/g, "") || "png";
    const path = `${store.id}/marca/${kind}-${crypto.randomUUID()}.${ext}`;
    const supabase = createClient();
    const { error } = await supabase.storage
      .from(BUCKET)
      .upload(path, file, { cacheControl: "31536000", contentType: file.type, upsert: false });
    setUploading(null);
    if (error) {
      setMessage({ ok: false, text: friendlyError(error, "Não foi possível enviar a imagem. Tente de novo.") });
      return;
    }
    const url = supabase.storage.from(BUCKET).getPublicUrl(path).data.publicUrl;
    if (kind === "logo") setLogoUrl(url);
    else setCapaUrl(url);
  }

  async function save() {
    setPending(true);
    setMessage(null);
    const { error } = await createClient()
      .from("lojas")
      .update({
        cor_fundo: theme.cor_fundo,
        cor_texto: theme.cor_texto,
        cor_destaque: theme.cor_destaque,
        fonte_titulo: theme.fonte_titulo,
        logo_url: logoUrl,
        capa_url: capaUrl,
        logo_formato: logoFormato,
        logo_texto: logoTexto.trim().slice(0, 3) || null,
        mostrar_nome: mostrarNome,
      })
      .eq("id", store.id);
    setPending(false);
    if (error) {
      setMessage({ ok: false, text: friendlyError(error, "Não foi possível salvar a aparência. Tente de novo.") });
      return;
    }
    setMessage({ ok: true, text: "Aparência salva. A vitrine já está com o novo visual." });
    router.refresh();
  }

  return (
    <section className="mx-5 mt-8 rounded-3xl border border-paper/15 p-4">
      <p className="text-[11px] uppercase tracking-[0.16em] text-mute">Personalização</p>
      <h2 className="mt-2 font-serif text-3xl">Aparência da vitrine</h2>

      <Preview theme={theme} store={preview} capaUrl={capaUrl} mostrarNome={mostrarNome} />

      <Group title="Paletas prontas">
        <div className="grid grid-cols-4 gap-2">
          {PRESETS.map((preset) => {
            const active = activePreset?.name === preset.name;
            return (
              <button
                key={preset.name}
                type="button"
                onClick={() =>
                  setTheme((current) => ({
                    ...current,
                    cor_fundo: preset.cor_fundo,
                    cor_texto: preset.cor_texto,
                    cor_destaque: preset.cor_destaque,
                  }))
                }
                className={`group rounded-2xl border p-1.5 text-left transition duration-300 ${
                  active ? "border-paper" : "border-paper/10 hover:border-paper/40"
                }`}
              >
                <span
                  className="relative flex h-12 items-end gap-1 overflow-hidden rounded-xl p-1.5"
                  style={{ background: preset.cor_fundo }}
                >
                  <span className="h-3 w-3 rounded-full" style={{ background: preset.cor_texto }} />
                  <span className="h-3 w-6 rounded-full" style={{ background: preset.cor_destaque }} />
                  {active ? (
                    <Check
                      size={14}
                      className="absolute top-1.5 right-1.5"
                      style={{ color: preset.cor_texto }}
                      strokeWidth={3}
                    />
                  ) : null}
                </span>
                <span className="mt-1 block truncate px-0.5 text-[11px] text-mute group-hover:text-paper">
                  {preset.name}
                </span>
              </button>
            );
          })}
        </div>
      </Group>

      <Group title="Cores">
        <div className="space-y-2">
          <ColorField label="Fundo" value={theme.cor_fundo} onChange={(value) => setColor("cor_fundo", value)} />
          <ColorField label="Texto" value={theme.cor_texto} onChange={(value) => setColor("cor_texto", value)} />
          <ColorField
            label="Destaque (botões e etiquetas)"
            value={theme.cor_destaque}
            onChange={(value) => setColor("cor_destaque", value)}
          />
        </div>
        {!readable ? (
          <p className="mt-2 text-xs leading-5 text-[#ffb36b]">
            O texto está com pouco contraste sobre o fundo. Clientes podem ter dificuldade para ler.
          </p>
        ) : null}
      </Group>

      <Group title="Fonte dos títulos">
        <div className="grid grid-cols-2 gap-2">
          {(Object.keys(FONTS) as FontKey[]).map((key) => {
            const font = FONTS[key];
            const active = theme.fonte_titulo === key;
            return (
              <button
                key={key}
                type="button"
                onClick={() => setTheme((current) => ({ ...current, fonte_titulo: key }))}
                className={`rounded-2xl border px-3 py-3 text-left transition duration-300 ${
                  active ? "border-paper bg-paper/5" : "border-paper/10 hover:border-paper/40"
                }`}
              >
                <span
                  className="block truncate text-2xl leading-none"
                  style={{ fontFamily: font.family, fontWeight: font.weight, letterSpacing: font.tracking }}
                >
                  {store.nome}
                </span>
                <span className="mt-1.5 block text-[11px] text-mute">{font.label}</span>
              </button>
            );
          })}
        </div>
      </Group>

      <Group title="Logo">
        <div className="flex items-center gap-4">
          <span className="contents" style={themeStyle(theme)}>
            <StoreLogo store={preview} size={72} />
          </span>
          <div className="flex flex-1 flex-col gap-2">
            <UploadButton
              label={logoUrl ? "Trocar imagem" : "Enviar logo"}
              busy={uploading === "logo"}
              onFile={(file) => void upload("logo", file)}
            />
            {logoUrl ? (
              <button
                type="button"
                onClick={() => setLogoUrl(null)}
                className="inline-flex h-9 items-center gap-1.5 self-start text-xs text-mute transition hover:text-paper"
              >
                <Trash2 size={13} />
                Usar monograma
              </button>
            ) : null}
          </div>
        </div>
        {!logoUrl ? (
          <div className="mt-4 space-y-2">
            <Label htmlFor="logo-texto">Letras do monograma</Label>
            <Input
              id="logo-texto"
              value={logoTexto}
              maxLength={3}
              placeholder={monogram({ nome: store.nome, logo_texto: null })}
              onChange={(event) => setLogoTexto(event.target.value)}
            />
            <p className="text-xs text-mute">Até 3 caracteres, na cor de destaque e na fonte dos títulos.</p>
          </div>
        ) : (
          <p className="mt-3 text-xs leading-5 text-mute">
            Use uma imagem quadrada (PNG com fundo transparente fica melhor), até 3 MB.
          </p>
        )}
        <div className="mt-4 grid grid-cols-3 gap-2">
          {SHAPES.map((shape) => (
            <button
              key={shape.key}
              type="button"
              onClick={() => setLogoFormato(shape.key)}
              className={`flex flex-col items-center gap-2 rounded-2xl border py-3 text-[11px] transition duration-300 ${
                logoFormato === shape.key
                  ? "border-paper text-paper"
                  : "border-paper/10 text-mute hover:border-paper/40"
              }`}
            >
              <span className="contents" style={themeStyle(theme)}>
                <StoreLogo store={{ ...preview, logo_formato: shape.key }} size={32} />
              </span>
              {shape.label}
            </button>
          ))}
        </div>
        <label className="mt-4 flex cursor-pointer items-center justify-between gap-3 rounded-2xl border border-paper/10 px-4 py-3">
          <span className="text-sm">
            Mostrar o nome ao lado da logo
            <span className="mt-0.5 block text-xs text-mute">Desligue se a sua logo já tem o nome escrito.</span>
          </span>
          <input
            type="checkbox"
            checked={mostrarNome}
            onChange={(event) => setMostrarNome(event.target.checked)}
            className="h-5 w-5 shrink-0 accent-[var(--color-accent)]"
          />
        </label>
      </Group>

      <Group title="Capa da vitrine">
        {capaUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={capaUrl} alt="" className="aspect-[16/7] w-full rounded-2xl object-cover" />
        ) : (
          <div className="grid aspect-[16/7] w-full place-items-center rounded-2xl border border-dashed border-paper/20 text-xs text-mute">
            Sem capa
          </div>
        )}
        <div className="mt-3 flex items-center gap-3">
          <UploadButton
            label={capaUrl ? "Trocar capa" : "Enviar capa"}
            busy={uploading === "capa"}
            onFile={(file) => void upload("capa", file)}
          />
          {capaUrl ? (
            <button
              type="button"
              onClick={() => setCapaUrl(null)}
              className="inline-flex h-9 items-center gap-1.5 text-xs text-mute transition hover:text-paper"
            >
              <Trash2 size={13} />
              Remover
            </button>
          ) : null}
        </div>
        <p className="mt-2 text-xs text-mute">Formato largo, como 1600×600. Aparece no topo da vitrine.</p>
      </Group>

      {message ? (
        <p className={`mt-5 text-sm ${message.ok ? "text-paper" : "text-[#ff8d8d]"}`}>{message.text}</p>
      ) : null}
      <Button
        type="button"
        className="mt-5 w-full"
        disabled={pending || uploading !== null}
        onClick={() => void save()}
      >
        {pending ? "Salvando…" : "Salvar aparência"}
      </Button>
    </section>
  );
}

function Group({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mt-6 border-t border-paper/10 pt-5">
      <h3 className="mb-3 text-[11px] uppercase tracking-[0.16em] text-mute">{title}</h3>
      {children}
    </div>
  );
}

function ColorField({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) {
  const [draft, setDraft] = useState(value);
  const [synced, setSynced] = useState(value);
  if (synced !== value) {
    setSynced(value);
    setDraft(value);
  }

  return (
    <div className="flex items-center gap-3 rounded-2xl border border-paper/10 px-3 py-2">
      <label
        className="relative h-9 w-9 shrink-0 cursor-pointer overflow-hidden rounded-full ring-1 ring-paper/20"
        style={{ background: value }}
      >
        <input
          type="color"
          value={value}
          onChange={(event) => onChange(event.target.value)}
          className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
          aria-label={label}
        />
      </label>
      <span className="min-w-0 flex-1 truncate text-sm">{label}</span>
      <input
        value={draft}
        maxLength={7}
        spellCheck={false}
        aria-label={`${label} em hexadecimal`}
        onChange={(event) => {
          const next = event.target.value.startsWith("#") ? event.target.value : `#${event.target.value}`;
          setDraft(next);
          const valid = safeHex(next, "");
          if (valid) onChange(valid);
        }}
        className="h-9 w-24 rounded-xl border border-paper/10 bg-transparent px-2 text-center font-mono text-xs uppercase outline-none focus:border-paper/50"
      />
    </div>
  );
}

function UploadButton({ label, busy, onFile }: { label: string; busy: boolean; onFile: (file: File) => void }) {
  const input = useRef<HTMLInputElement>(null);
  return (
    <>
      <Button
        type="button"
        variant="ghost"
        size="sm"
        disabled={busy}
        onClick={() => input.current?.click()}
        className="self-start"
      >
        <ImagePlus size={14} />
        {busy ? "Enviando…" : label}
      </Button>
      <input
        ref={input}
        type="file"
        accept="image/png,image/jpeg,image/webp"
        className="hidden"
        onChange={(event) => {
          const file = event.target.files?.[0];
          event.target.value = "";
          if (file) onFile(file);
        }}
      />
    </>
  );
}

function Preview({
  theme,
  store,
  capaUrl,
  mostrarNome,
}: {
  theme: StoreTheme;
  store: Parameters<typeof StoreLogo>[0]["store"];
  capaUrl: string | null;
  mostrarNome: boolean;
}) {
  return (
    <div
      style={themeStyle(theme)}
      className="mt-5 overflow-hidden rounded-3xl border border-paper/15 bg-ink text-paper transition-colors duration-500"
      aria-label="Prévia da vitrine"
    >
      <div className="neon-rule" />
      <div className="flex items-center gap-2.5 border-b border-paper/10 px-3 py-2.5">
        <StoreLogo store={store} size={30} />
        {mostrarNome ? <span className="truncate font-serif text-lg">{store.nome}</span> : null}
        <span className="ml-auto grid h-8 w-8 place-items-center rounded-full border border-paper/15">
          <ShoppingBag size={14} strokeWidth={1.5} />
        </span>
      </div>
      {capaUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={capaUrl} alt="" className="aspect-[16/6] w-full object-cover" />
      ) : null}
      <div className="px-3 pt-3 pb-4">
        <p className="font-serif text-3xl leading-none">{store.nome}</p>
        <div className="mt-3 flex gap-2">
          {["Tudo", "Novidades", "Ofertas"].map((label, index) => (
            <span
              key={label}
              className={`rounded-full px-3 py-1 text-[11px] ${index === 0 ? "bg-accent text-on-accent" : "border border-paper/15 text-mute"}`}
            >
              {label}
            </span>
          ))}
        </div>
        <div className="mt-3 grid grid-cols-2 gap-2">
          {[0, 1].map((item) => (
            <div key={item}>
              <div className="relative aspect-[4/5] rounded-2xl bg-panel">
                {item === 0 ? (
                  <span className="absolute top-2 left-2 rounded-full bg-accent px-2 py-0.5 text-[10px] text-on-accent">
                    −20%
                  </span>
                ) : null}
              </div>
              <p className="mt-1.5 text-[11px]">Produto {item + 1}</p>
              <p className="font-serif text-sm">R$ 129,90</p>
            </div>
          ))}
        </div>
        <span className="mt-3 flex h-9 items-center justify-center rounded-full bg-accent text-xs font-medium text-on-accent">
          Adicionar à sacola
        </span>
      </div>
    </div>
  );
}
