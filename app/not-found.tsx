import Link from "next/link";
import { AppFrame } from "@/components/app-frame";

export default function NotFound() {
  return (
    <AppFrame>
      <div className="px-5 py-16">
        <h1 className="font-serif text-5xl">Não encontrado</h1>
        <Link href="/" className="mt-6 inline-block text-sm underline underline-offset-4">
          Voltar ao início
        </Link>
      </div>
    </AppFrame>
  );
}
