"use client";

import { useRef, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type { ProdutoImagem } from "@/features/domain/types";

export function ImageCarousel({ images, name }: { images: ProdutoImagem[]; name: string }) {
  const [index, setIndex] = useState(0);
  const track = useRef<HTMLDivElement>(null);

  if (images.length === 0) {
    return <div className="aspect-[4/5] rounded-[2rem] bg-panel" />;
  }

  function go(next: number) {
    const node = track.current;
    if (!node) return;
    const target = Math.max(0, Math.min(images.length - 1, next));
    node.scrollTo({ left: target * node.clientWidth, behavior: "smooth" });
  }

  return (
    <div className="md:flex md:flex-row-reverse md:gap-4">
      <div className="group relative min-w-0 flex-1">
        <div
          ref={track}
          className="no-scrollbar flex snap-x snap-mandatory overflow-x-auto rounded-[2rem]"
          onScroll={(event) => {
            const width = event.currentTarget.clientWidth;
            if (!width) return;
            setIndex(Math.round(event.currentTarget.scrollLeft / width));
          }}
        >
          {images.map((image, position) => (
            <div key={image.id} className="w-full shrink-0 snap-center overflow-hidden">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={image.url}
                alt={image.alt || name}
                loading={position === 0 ? "eager" : "lazy"}
                className={`aspect-[4/5] w-full object-cover transition duration-[900ms] ease-out-expo ${
                  position === index ? "scale-100 opacity-100" : "scale-[1.04] opacity-60"
                }`}
              />
            </div>
          ))}
        </div>
        {images.length > 1 ? (
          <>
            <ArrowButton side="left" disabled={index === 0} onClick={() => go(index - 1)} />
            <ArrowButton side="right" disabled={index === images.length - 1} onClick={() => go(index + 1)} />
            <div className="pointer-events-none absolute inset-x-0 bottom-4 flex justify-center gap-1.5 md:hidden">
              {images.map((image, dot) => (
                <span
                  key={image.id}
                  className={`h-1.5 rounded-full transition-all duration-500 ease-out-expo ${dot === index ? "w-6 bg-paper" : "w-1.5 bg-white/40"}`}
                />
              ))}
            </div>
          </>
        ) : null}
      </div>

      {images.length > 1 ? (
        <div className="no-scrollbar mt-3 hidden gap-3 md:mt-0 md:flex md:w-20 md:flex-col">
          {images.map((image, thumb) => (
            <button
              key={image.id}
              type="button"
              aria-label={`Foto ${thumb + 1}`}
              onClick={() => go(thumb)}
              className={`overflow-hidden rounded-2xl ring-1 transition duration-300 ${
                thumb === index ? "opacity-100 ring-white" : "opacity-50 ring-white/10 hover:opacity-100"
              }`}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={image.url} alt="" className="aspect-[4/5] w-full object-cover" />
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}

function ArrowButton({ side, disabled, onClick }: { side: "left" | "right"; disabled: boolean; onClick: () => void }) {
  const Icon = side === "left" ? ChevronLeft : ChevronRight;
  return (
    <button
      type="button"
      aria-label={side === "left" ? "Foto anterior" : "Próxima foto"}
      disabled={disabled}
      onClick={onClick}
      className={`absolute top-1/2 hidden h-11 w-11 -translate-y-1/2 place-items-center rounded-full bg-ink/70 text-paper backdrop-blur transition duration-300 hover:bg-ink disabled:pointer-events-none md:grid md:opacity-0 md:group-hover:enabled:opacity-100 ${
        side === "left" ? "left-4" : "right-4"
      }`}
    >
      <Icon size={20} />
    </button>
  );
}
