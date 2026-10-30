"use client";

import { useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type { Banner } from "@/features/domain/types";

const INTERVAL_MS = 6000;

export function BannerCarousel({ banners }: { banners: Banner[] }) {
  const track = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);
  const many = banners.length > 1;

  function go(index: number) {
    const node = track.current;
    if (!node) return;
    const next = (index + banners.length) % banners.length;
    node.scrollTo({ left: next * node.clientWidth, behavior: "smooth" });
  }

  useEffect(() => {
    if (!many || paused || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const timer = window.setInterval(() => {
      const node = track.current;
      if (!node) return;
      const current = Math.round(node.scrollLeft / node.clientWidth);
      const next = (current + 1) % banners.length;
      node.scrollTo({ left: next * node.clientWidth, behavior: "smooth" });
    }, INTERVAL_MS);
    return () => window.clearInterval(timer);
  }, [banners.length, many, paused]);

  return (
    <div
      className="enter group relative overflow-hidden"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onTouchStart={() => setPaused(true)}
    >
      <div
        ref={track}
        className="no-scrollbar flex snap-x snap-mandatory overflow-x-auto"
        onScroll={(event) => {
          const node = event.currentTarget;
          setActive(Math.round(node.scrollLeft / node.clientWidth));
        }}
      >
        {banners.map((banner, index) => {
          const image = (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={banner.url}
              alt=""
              loading={index === 0 ? "eager" : "lazy"}
              className={`aspect-[4/3] w-full object-cover transition-transform duration-[6s] ease-linear md:aspect-[21/8] ${
                index === active ? "scale-[1.04]" : "scale-100"
              }`}
            />
          );
          return (
            <div key={`${banner.url}-${index}`} className="w-full shrink-0 snap-center overflow-hidden">
              {banner.link && /^(https?:\/\/|\/)/i.test(banner.link) ? (
                <a href={banner.link} className="block">
                  {image}
                </a>
              ) : (
                image
              )}
            </div>
          );
        })}
      </div>
      {many ? (
        <>
          <div className="absolute inset-x-0 bottom-4 flex justify-center gap-1.5">
            {banners.map((banner, index) => (
              <button
                key={`dot-${banner.url}-${index}`}
                type="button"
                aria-label={`Banner ${index + 1}`}
                onClick={() => go(index)}
                className={`h-1.5 rounded-full transition-all duration-500 ease-out-expo ${
                  index === active ? "w-6 bg-accent" : "w-1.5 bg-paper/50"
                }`}
              />
            ))}
          </div>
          <button
            type="button"
            aria-label="Banner anterior"
            onClick={() => go(active - 1)}
            className="absolute top-1/2 left-3 hidden h-10 w-10 -translate-y-1/2 place-items-center rounded-full bg-ink/60 opacity-0 backdrop-blur transition duration-300 group-hover:opacity-100 md:grid"
          >
            <ChevronLeft size={18} />
          </button>
          <button
            type="button"
            aria-label="Próximo banner"
            onClick={() => go(active + 1)}
            className="absolute top-1/2 right-3 hidden h-10 w-10 -translate-y-1/2 place-items-center rounded-full bg-ink/60 opacity-0 backdrop-blur transition duration-300 group-hover:opacity-100 md:grid"
          >
            <ChevronRight size={18} />
          </button>
        </>
      ) : null}
    </div>
  );
}
