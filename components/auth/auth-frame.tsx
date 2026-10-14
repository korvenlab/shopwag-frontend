const STEPS = [
  "Monte o catálogo com fotos, cores e tamanhos.",
  "Envie o link da vitrine no WhatsApp e no Instagram.",
  "Receba no Pix e acompanhe a entrega no painel.",
];

export function AuthFrame({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative min-h-dvh bg-ink text-paper lg:grid lg:grid-cols-2">
      <aside className="relative hidden flex-col justify-between overflow-hidden px-14 py-12 lg:flex">
        <div aria-hidden className="neon-pulse absolute inset-y-0 right-0 w-px bg-white" />
        <div aria-hidden className="neon-rule absolute inset-x-0 top-0" />
        <p className="text-[11px] uppercase tracking-[0.28em] text-mute">Shopwag</p>
        <div>
          <h2 className="max-w-xl font-serif text-7xl leading-[0.9]">A vitrine que parece um aplicativo.</h2>
          <p className="mt-6 max-w-md text-sm leading-6 text-mute">
            Seu cliente escolhe a peça, informa o endereço e paga com Pix. Você vê o pagamento, o WhatsApp e a entrega no
            painel.
          </p>
        </div>
        <ol className="max-w-md space-y-4 text-sm">
          {STEPS.map((step, index) => (
            <li key={step} className="border-t border-white/15 pt-4">
              {index + 1} · {step}
            </li>
          ))}
        </ol>
      </aside>
      <div className="lg:flex lg:items-center lg:justify-center">
        <div className="relative mx-auto flex min-h-dvh w-full max-w-[430px] flex-col border-white/15 md:border-x lg:min-h-0 lg:border-x-0">
          <div className="neon-rule lg:hidden" />
          {children}
        </div>
      </div>
    </div>
  );
}
