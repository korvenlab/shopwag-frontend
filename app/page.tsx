import Link from "next/link";
import { AppFrame } from "@/components/app-frame";

export default function Home() {
  return (
    <AppFrame wide>
      <main className="flex flex-1 flex-col px-5 pt-10 pb-8 lg:mx-auto lg:grid lg:w-full lg:max-w-6xl lg:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)] lg:items-center lg:gap-20 lg:px-12 lg:py-16">
        <div>
          <p className="text-[11px] uppercase tracking-[0.28em] text-mute">Shopwag</p>
          <h1 className="mt-4 font-serif text-6xl leading-[0.9] lg:text-8xl">A vitrine que parece um aplicativo.</h1>
          <p className="mt-6 text-sm leading-6 text-mute lg:max-w-lg lg:text-base lg:leading-7">
            Seu cliente escolhe a peça, informa o endereço e paga com Pix. Você vê o pagamento, o WhatsApp e a entrega
            no painel.
          </p>
        </div>
        <div className="flex flex-1 flex-col lg:flex-none">
          <ol className="mt-8 space-y-4 text-sm lg:mt-0">
            <li className="border-t border-white/15 pt-4">1 · Monte o catálogo com fotos, cores e tamanhos.</li>
            <li className="border-t border-white/15 pt-4">2 · Envie o link da vitrine no WhatsApp.</li>
            <li className="border-t border-white/15 pt-4">3 · Confirme o Pix e acompanhe a entrega.</li>
          </ol>
          <div className="mt-auto space-y-3 pt-10 lg:mt-0">
            <Link
              href="/cadastro"
              className="grid h-12 place-items-center rounded-full bg-paper text-sm font-medium text-ink"
            >
              Criar loja
            </Link>
            <Link href="/login" className="grid h-12 place-items-center rounded-full border border-white/20 text-sm">
              Entrar
            </Link>
          </div>
        </div>
      </main>
    </AppFrame>
  );
}
