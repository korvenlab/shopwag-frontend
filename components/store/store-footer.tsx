import { Clock, Globe, Mail, MapPin, MessageCircle, Package, Store } from "lucide-react";
import { StoreLink } from "@/components/store/store-link";
import type { Loja } from "@/features/domain/types";
import { hoursSummary } from "@/lib/hours";
import { formatBRL } from "@/lib/money";
import { formatPhone, whatsappHref } from "@/lib/phone";

const SOCIAL: Array<{ key: "instagram" | "facebook" | "tiktok" | "youtube"; label: string; base: string }> = [
  { key: "instagram", label: "Instagram", base: "https://instagram.com/" },
  { key: "facebook", label: "Facebook", base: "https://facebook.com/" },
  { key: "tiktok", label: "TikTok", base: "https://tiktok.com/@" },
  { key: "youtube", label: "YouTube", base: "https://youtube.com/@" },
];

export const POLICIES = [
  { slug: "trocas", label: "Trocas e devoluções", field: "politica_troca" },
  { slug: "privacidade", label: "Política de privacidade", field: "politica_privacidade" },
  { slug: "termos", label: "Termos de uso", field: "termos_uso" },
] as const;

export function socialHref(base: string, value: string) {
  const trimmed = value.trim();
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  return base + trimmed.replace(/^@/, "");
}

export function StoreFooter({ store }: { store: Loja }) {
  const socials = SOCIAL.filter((item) => store[item.key]?.trim());
  const policies = POLICIES.filter((item) => store[item.field]?.trim());
  const shipping =
    store.entrega_ativa && store.frete_gratis_acima_centavos != null
      ? `Frete grátis acima de ${formatBRL(store.frete_gratis_acima_centavos)}`
      : store.entrega_ativa
        ? "Entrega no seu endereço"
        : null;

  return (
    <footer className="mt-16 border-t border-paper/10">
      <div className="mx-auto grid max-w-6xl gap-10 px-5 py-12 md:grid-cols-4 md:px-8">
        <section>
          <h2 className="font-serif text-xl">Atendimento</h2>
          <ul className="mt-4 space-y-3 text-sm text-mute">
            {store.whatsapp ? (
              <FooterItem icon={<MessageCircle size={15} />}>
                <a href={whatsappHref(store.whatsapp)} target="_blank" rel="noreferrer" className="hover:text-paper">
                  {formatPhone(store.whatsapp)}
                </a>
              </FooterItem>
            ) : null}
            {store.email_contato ? (
              <FooterItem icon={<Mail size={15} />}>
                <a href={`mailto:${store.email_contato}`} className="break-all hover:text-paper">
                  {store.email_contato}
                </a>
              </FooterItem>
            ) : null}
            {store.site_url ? (
              <FooterItem icon={<Globe size={15} />}>
                <a href={socialHref("https://", store.site_url)} target="_blank" rel="noreferrer" className="break-all hover:text-paper">
                  {store.site_url.replace(/^https?:\/\//, "")}
                </a>
              </FooterItem>
            ) : null}
          </ul>
        </section>

        {store.horario_ativo ? (
          <section>
            <h2 className="flex items-center gap-2 font-serif text-xl">
              <Clock size={16} /> Horário
            </h2>
            <dl className="mt-4 space-y-1.5 text-sm">
              {hoursSummary(store.horarios).map((day) => (
                <div key={day.name} className="flex justify-between gap-4">
                  <dt className="text-mute">{day.name}</dt>
                  <dd>{day.text}</dd>
                </div>
              ))}
            </dl>
          </section>
        ) : null}

        <section>
          <h2 className="font-serif text-xl">Compra</h2>
          <ul className="mt-4 space-y-3 text-sm text-mute">
            <FooterItem icon={<span className="text-xs font-semibold">PIX</span>}>Pix, crédito em até 12x e débito</FooterItem>
            {shipping ? <FooterItem icon={<Package size={15} />}>{shipping}</FooterItem> : null}
            {store.retirada_ativa ? (
              <FooterItem icon={<Store size={15} />}>
                Retirada{store.retirada_endereco ? `: ${store.retirada_endereco}` : " na loja"}
              </FooterItem>
            ) : null}
          </ul>
          {policies.length ? (
            <ul className="mt-5 space-y-2 text-sm">
              {policies.map((item) => (
                <li key={item.slug}>
                  <StoreLink
                    slug={store.slug}
                    path={`/politicas/${item.slug}`}
                    className="text-mute underline-offset-4 hover:text-paper hover:underline"
                  >
                    {item.label}
                  </StoreLink>
                </li>
              ))}
            </ul>
          ) : null}
        </section>

        {socials.length ? (
          <section>
            <h2 className="font-serif text-xl">Siga a loja</h2>
            <ul className="mt-4 flex flex-wrap gap-2">
              {socials.map((item) => (
                <li key={item.key}>
                  <a
                    href={socialHref(item.base, store[item.key] ?? "")}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex h-10 items-center rounded-full border border-paper/15 px-4 text-sm transition duration-300 hover:border-paper/60 hover:bg-paper/5"
                  >
                    {item.label}
                  </a>
                </li>
              ))}
            </ul>
          </section>
        ) : null}
      </div>
      <div className="border-t border-paper/10">
        <div className="mx-auto flex max-w-6xl flex-col gap-2 px-5 py-6 text-xs text-mute md:flex-row md:items-center md:justify-between md:px-8">
          <span className="flex flex-wrap items-center gap-x-2 gap-y-1">
            <span>{store.nome}</span>
            {store.documento ? <span>· {store.documento}</span> : null}
            {store.endereco_loja ? (
              <span className="inline-flex items-center gap-1">
                · <MapPin size={12} /> {store.endereco_loja}
              </span>
            ) : null}
          </span>
          <span>
            Feito com <span className="text-paper">Shopwag</span>
          </span>
        </div>
      </div>
    </footer>
  );
}

function FooterItem({ icon, children }: { icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <li className="flex items-start gap-2.5">
      <span className="mt-0.5 grid w-5 shrink-0 place-items-center text-paper">{icon}</span>
      <span className="min-w-0">{children}</span>
    </li>
  );
}
