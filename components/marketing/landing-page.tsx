import Link from "next/link";
import { PLATFORM_FEE_PERCENT } from "@/lib/mercadopago/platform-fee";

const NAV = [
  { href: "#para-que-serve", label: "Para que serve" },
  { href: "#como-funciona", label: "Como funciona" },
  { href: "#preco", label: "Preço" },
] as const;

const USES = [
  {
    eyebrow: "Vitrine",
    title: "Sua loja no celular do cliente",
    text: "Catálogo com fotos, cores, tamanhos e preços. O cliente navega como num app e monta a sacola sem baixar nada.",
  },
  {
    eyebrow: "WhatsApp",
    title: "Venda pelo link que você já manda",
    text: "Compartilhe a vitrine no status, no chat ou no Instagram. Quem clica escolhe, informa o endereço e paga.",
  },
  {
    eyebrow: "Pagamento",
    title: "Pix e cartão na sua conta",
    text: "O dinheiro entra direto no Mercado Pago da sua loja. Você acompanha o pedido, o WhatsApp e a entrega no painel.",
  },
] as const;

const STEPS = [
  {
    n: "01",
    title: "Monte o catálogo",
    text: "Suba fotos, cores e tamanhos — ou importe a planilha de uma vez.",
  },
  {
    n: "02",
    title: "Envie o link",
    text: "Sua vitrine fica em um endereço próprio. Mande no WhatsApp e comece a vender.",
  },
  {
    n: "03",
    title: "Receba o pedido",
    text: "Pix ou cartão confirmado, endereço na mão e status do pedido no painel.",
  },
] as const;

export function LandingPage() {
  return (
    <div className="relative min-h-dvh overflow-x-clip bg-ink text-paper">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_55%_at_50%_-10%,rgba(244,241,234,0.14),transparent_55%),radial-gradient(circle_at_85%_20%,rgba(244,241,234,0.06),transparent_40%)]"
      />
      <div aria-hidden className="neon-rule fixed inset-x-0 top-0 z-50" />

      <header className="relative z-40 mx-auto flex w-full max-w-6xl items-center justify-between gap-4 px-5 pt-5 md:px-8 md:pt-7">
        <Link href="/" className="font-serif text-2xl tracking-tight md:text-3xl">
          Shopwag
        </Link>
        <nav className="hidden items-center gap-1 rounded-full border border-paper/15 bg-paper/[0.04] px-2 py-1.5 backdrop-blur-md md:flex">
          {NAV.map((item) => (
            <a
              key={item.href}
              href={item.href}
              className="rounded-full px-3.5 py-1.5 text-sm text-mute transition hover:bg-paper/10 hover:text-paper"
            >
              {item.label}
            </a>
          ))}
          <Link
            href="/login"
            className="rounded-full px-3.5 py-1.5 text-sm text-mute transition hover:bg-paper/10 hover:text-paper"
          >
            Entrar
          </Link>
          <Link
            href="/cadastro"
            className="rounded-full bg-paper px-4 py-1.5 text-sm font-medium text-ink transition hover:bg-white"
          >
            Criar loja
          </Link>
        </nav>
        <div className="flex items-center gap-2 md:hidden">
          <Link href="/login" className="rounded-full px-3 py-2 text-sm text-mute">
            Entrar
          </Link>
          <Link
            href="/cadastro"
            className="rounded-full bg-paper px-3.5 py-2 text-sm font-medium text-ink"
          >
            Criar loja
          </Link>
        </div>
      </header>

      <main className="relative z-10">
        <section className="mx-auto grid w-full max-w-6xl gap-12 px-5 pt-12 pb-16 md:px-8 md:pt-16 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)] lg:items-center lg:gap-10 lg:pb-24">
          <div className="enter" style={{ "--i": 0 } as React.CSSProperties}>
            <p className="text-[11px] font-medium uppercase tracking-[0.28em] text-mute">Shopwag</p>
            <h1 className="mt-4 max-w-xl font-serif text-[3.35rem] leading-[0.92] tracking-tight md:text-7xl lg:text-[5.25rem]">
              A vitrine que vende no WhatsApp.
            </h1>
            <p className="mt-6 max-w-md text-base leading-7 text-mute md:text-lg md:leading-8">
              Monte o catálogo, mande o link e receba Pix ou cartão na sua conta. Gratuito para usar — você só paga a
              taxa de {PLATFORM_FEE_PERCENT}% nas vendas.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Link
                href="/cadastro"
                className="inline-flex h-12 items-center justify-center rounded-full bg-paper px-7 text-sm font-medium text-ink transition hover:bg-white"
              >
                Começar grátis
              </Link>
              <a
                href="#preco"
                className="inline-flex h-12 items-center justify-center rounded-full border border-paper/20 px-6 text-sm text-paper transition hover:border-paper/50 hover:bg-paper/5"
              >
                Ver o preço
              </a>
            </div>
            <p className="mt-5 text-sm text-mute">
              Sem mensalidade. Sem trial. A taxa do Mercado Pago pode ir para o cliente.
            </p>
          </div>

          <div className="enter relative mx-auto w-full max-w-md lg:max-w-none" style={{ "--i": 2 } as React.CSSProperties}>
            <HeroShowcase />
          </div>
        </section>

        <section aria-label="Preço em destaque" className="border-y border-paper/10 bg-paper/[0.03]">
          <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-5 py-8 md:flex-row md:items-center md:justify-between md:px-8 md:py-10">
            <p className="max-w-xl font-serif text-3xl leading-tight md:text-4xl">
              Gratuito para abrir. Cobramos só quando você vende.
            </p>
            <ul className="flex flex-wrap gap-x-8 gap-y-3 text-sm text-mute md:justify-end">
              <li>
                <span className="block text-paper">R$ 0</span>
                mensalidade
              </li>
              <li>
                <span className="block text-paper">{PLATFORM_FEE_PERCENT}%</span>
                taxa Shopwag nas vendas
              </li>
              <li>
                <span className="block text-paper">Repasse</span>
                taxa Mercado Pago opcional
              </li>
            </ul>
          </div>
        </section>

        <section id="para-que-serve" className="mx-auto w-full max-w-6xl scroll-mt-24 px-5 py-20 md:px-8 md:py-28">
          <div className="reveal mx-auto max-w-3xl text-center">
            <p className="text-[11px] uppercase tracking-[0.28em] text-mute">Para que serve</p>
            <h2 className="mt-4 font-serif text-4xl leading-[1.05] md:text-6xl">
              Não é só um link. É a loja completa no bolso do cliente.
            </h2>
            <p className="mx-auto mt-5 max-w-2xl text-base leading-7 text-mute md:text-lg">
              Feito para quem vende moda, acessórios e peças pelo WhatsApp — e quer parar de mandar foto uma a uma.
            </p>
          </div>
          <div className="mt-14 grid gap-10 md:grid-cols-3 md:gap-8">
            {USES.map((item, index) => (
              <article
                key={item.title}
                className="reveal border-t border-paper/15 pt-6"
                style={{ animationDelay: `${index * 80}ms` }}
              >
                <p className="text-[11px] uppercase tracking-[0.22em] text-mute">{item.eyebrow}</p>
                <h3 className="mt-3 font-serif text-2xl leading-tight md:text-3xl">{item.title}</h3>
                <p className="mt-3 text-sm leading-6 text-mute md:text-base md:leading-7">{item.text}</p>
              </article>
            ))}
          </div>
        </section>

        <section id="como-funciona" className="border-y border-paper/10 bg-paper/[0.03]">
          <div className="mx-auto w-full max-w-6xl scroll-mt-24 px-5 py-20 md:px-8 md:py-28">
            <div className="reveal max-w-2xl">
              <p className="text-[11px] uppercase tracking-[0.28em] text-mute">Como funciona</p>
              <h2 className="mt-4 font-serif text-4xl leading-[1.05] md:text-5xl">
                Do catálogo ao Pix em três passos.
              </h2>
            </div>
            <ol className="mt-12 grid gap-6 md:grid-cols-3">
              {STEPS.map((step, index) => (
                <li
                  key={step.n}
                  className="reveal rounded-[1.75rem] border border-paper/12 bg-ink/60 p-6 md:p-7"
                  style={{ animationDelay: `${index * 90}ms` }}
                >
                  <p className="font-serif text-4xl text-paper/35">{step.n}</p>
                  <h3 className="mt-4 text-lg font-medium">{step.title}</h3>
                  <p className="mt-2 text-sm leading-6 text-mute">{step.text}</p>
                </li>
              ))}
            </ol>
          </div>
        </section>

        <section id="preco" className="mx-auto w-full max-w-6xl scroll-mt-24 px-5 py-20 md:px-8 md:py-28">
          <div className="reveal grid gap-12 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.05fr)] lg:items-end lg:gap-16">
            <div>
              <p className="text-[11px] uppercase tracking-[0.28em] text-mute">Preço</p>
              <h2 className="mt-4 font-serif text-4xl leading-[1.05] md:text-6xl">
                Gratuito.
                <span className="block text-mute">Só {PLATFORM_FEE_PERCENT}% quando vende.</span>
              </h2>
              <p className="mt-5 max-w-md text-base leading-7 text-mute">
                Sem plano mensal. Você cria a loja, publica o catálogo e só paga a taxa de serviço da Shopwag nas vendas —
                e ela já vai no total do cliente.
              </p>
            </div>

            <div className="reveal space-y-4 rounded-[2rem] border border-paper/15 bg-gradient-to-br from-paper/[0.08] to-transparent p-6 md:p-8">
              <div className="flex items-start justify-between gap-4 border-b border-paper/10 pb-5">
                <div>
                  <p className="text-sm text-mute">Abrir e usar a loja</p>
                  <p className="mt-1 font-serif text-4xl">R$ 0</p>
                </div>
                <span className="rounded-full border border-ok/40 bg-ok/15 px-3 py-1 text-xs font-medium text-ok">
                  Sem mensalidade
                </span>
              </div>
              <div className="border-b border-paper/10 pb-5">
                <div className="flex items-baseline justify-between gap-4">
                  <p className="text-sm text-mute">Taxa Shopwag por venda</p>
                  <p className="font-serif text-3xl">{PLATFORM_FEE_PERCENT}%</p>
                </div>
                <p className="mt-2 text-sm leading-6 text-mute">
                  Sempre paga pelo cliente, à parte do valor dos seus produtos.
                </p>
              </div>
              <div>
                <div className="flex items-baseline justify-between gap-4">
                  <p className="text-sm text-mute">Taxa do Mercado Pago</p>
                  <p className="text-sm font-medium">Pode ir pro cliente</p>
                </div>
                <p className="mt-2 text-sm leading-6 text-mute">
                  Ative o repasse no painel e o cliente cobre Pix, crédito ou débito. Você recebe o valor cheio do
                  catálogo.
                </p>
              </div>
              <Link
                href="/cadastro"
                className="mt-4 grid h-12 place-items-center rounded-full bg-paper text-sm font-medium text-ink transition hover:bg-white"
              >
                Criar minha loja grátis
              </Link>
            </div>
          </div>
        </section>

        <section className="border-t border-paper/10">
          <div className="mx-auto flex w-full max-w-6xl flex-col items-start gap-8 px-5 py-20 md:flex-row md:items-end md:justify-between md:px-8 md:py-28">
            <div className="reveal max-w-2xl">
              <h2 className="font-serif text-4xl leading-[1.05] md:text-6xl">
                Abra a vitrine hoje. Venda no próximo WhatsApp.
              </h2>
              <p className="mt-5 text-base leading-7 text-mute md:text-lg">
                Cadastro rápido, catálogo no ar e pagamento na sua conta Mercado Pago.
              </p>
            </div>
            <div className="reveal flex flex-wrap gap-3">
              <Link
                href="/cadastro"
                className="inline-flex h-12 items-center justify-center rounded-full bg-paper px-7 text-sm font-medium text-ink transition hover:bg-white"
              >
                Começar grátis
              </Link>
              <Link
                href="/login"
                className="inline-flex h-12 items-center justify-center rounded-full border border-paper/20 px-6 text-sm transition hover:border-paper/50 hover:bg-paper/5"
              >
                Já tenho loja
              </Link>
            </div>
          </div>
        </section>
      </main>

      <footer className="relative z-10 border-t border-paper/10">
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-4 px-5 py-8 text-sm text-mute md:flex-row md:items-center md:justify-between md:px-8">
          <p className="font-serif text-xl text-paper">Shopwag</p>
          <p>© {new Date().getFullYear()} Korven Lab. Pagamentos com a segurança do Mercado Pago.</p>
        </div>
      </footer>
    </div>
  );
}

function HeroShowcase() {
  return (
    <div className="relative">
      <div
        aria-hidden
        className="absolute -inset-6 rounded-[2.5rem] bg-[radial-gradient(circle_at_50%_30%,rgba(244,241,234,0.12),transparent_65%)] blur-2xl"
      />
      <div className="relative grid gap-4 sm:grid-cols-[1.05fr_0.95fr] sm:items-end">
        <div className="overflow-hidden rounded-[2rem] border border-paper/15 bg-panel shadow-[0_30px_80px_-40px_rgba(0,0,0,0.9)]">
          <div className="flex items-center justify-between border-b border-paper/10 px-4 py-3">
            <p className="font-serif text-lg">Sua loja</p>
            <span className="rounded-full bg-paper/10 px-2.5 py-1 text-[10px] uppercase tracking-[0.16em] text-mute">
              Vitrine
            </span>
          </div>
          <div className="space-y-3 p-4">
            <div className="aspect-[16/9] overflow-hidden rounded-2xl bg-gradient-to-br from-paper/20 via-paper/5 to-transparent">
              <div className="flex h-full items-end p-4">
                <div>
                  <p className="text-[10px] uppercase tracking-[0.2em] text-mute">Destaques</p>
                  <p className="mt-1 font-serif text-2xl">Pronta entrega</p>
                </div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <MockProduct name="Camisa home" price="R$ 149,90" tone="from-sky-950" />
              <MockProduct name="Camisa away" price="R$ 149,90" tone="from-red-950" />
            </div>
            <div className="rounded-2xl border border-paper/10 bg-ink/50 px-3 py-2.5 text-xs text-mute">
              Cliente monta a sacola · escolhe tamanho · paga no Pix
            </div>
          </div>
        </div>

        <div className="space-y-4 sm:-mb-2">
          <div className="rounded-[1.75rem] border border-paper/15 bg-panel p-4 shadow-[0_24px_60px_-36px_rgba(0,0,0,0.85)]">
            <p className="text-[10px] uppercase tracking-[0.18em] text-mute">Pedido · agora</p>
            <p className="mt-2 text-sm">Camisa Home · M</p>
            <div className="mt-3 flex items-center justify-between">
              <p className="font-serif text-2xl">R$ 149,90</p>
              <span className="rounded-full bg-ok/20 px-2.5 py-1 text-[11px] font-medium text-ok">Pix pago</span>
            </div>
            <p className="mt-3 text-xs leading-5 text-mute">+ {PLATFORM_FEE_PERCENT}% taxa Shopwag no total do cliente</p>
          </div>
          <div className="rounded-[1.75rem] border border-paper/15 bg-paper text-ink p-4 shadow-[0_24px_60px_-36px_rgba(0,0,0,0.85)]">
            <p className="text-[10px] uppercase tracking-[0.18em] text-ink/50">Seu bolso</p>
            <p className="mt-2 font-serif text-3xl leading-none">Valor cheio</p>
            <p className="mt-3 text-sm leading-5 text-ink/65">
              Com o repasse ligado, a taxa do Mercado Pago também fica com o cliente.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function MockProduct({ name, price, tone }: { name: string; price: string; tone: string }) {
  return (
    <div className="overflow-hidden rounded-2xl border border-paper/10 bg-ink/40">
      <div className={`aspect-square bg-gradient-to-br ${tone} to-transparent`} />
      <div className="space-y-0.5 p-2.5">
        <p className="truncate text-[11px] uppercase tracking-wide">{name}</p>
        <p className="text-sm font-medium">{price}</p>
      </div>
    </div>
  );
}
