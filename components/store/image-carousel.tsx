"use client";

import { useState } from "react";
import type { ProdutoImagem } from "@/features/domain/types";

export function ImageCarousel({ images, name }: { images: ProdutoImagem[]; name: string }) {
  const [index, setIndex] = useState(0);
  const frames = images.length > 0 ? images : [];

  if (frames.length === 0) {
    return <div className="aspect-[4/5] rounded-3xl bg-panel" />;
  }

  return (
    <div>
      <div
        className="flex snap-x snap-mandatory gap-3 overflow-x-auto rounded-3xl [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        onScroll={(event) => {
          const width = event.currentTarget.clientWidth;
          if (!width) return;
          setIndex(Math.round(event.currentTarget.scrollLeft / width));
        }}
      >
        {frames.map((image) => (
          <div key={image.id} className="w-full shrink-0 snap-center">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={image.url}
              alt={image.alt || name}
              className="aspect-[4/5] w-full rounded-3xl object-cover"
            />
          </div>
        ))}
      </div>
      {frames.length > 1 ? (
        <div className="mt-3 flex justify-center gap-1.5">
          {frames.map((image, dot) => (
            <span
              key={image.id}
              className={`h-1.5 rounded-full transition-all ${dot === index ? "w-5 bg-paper" : "w-1.5 bg-white/30"}`}
            />
          ))}
        </div>
      ) : null}
    </div>
  );
}
