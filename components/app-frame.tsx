export function AppFrame({ children, wide = false }: { children: React.ReactNode; wide?: boolean }) {
  return (
    <div className="relative min-h-dvh bg-ink text-paper">
      <div
        aria-hidden
        className={`neon-pulse pointer-events-none fixed inset-y-0 left-[calc(50%-240px)] hidden w-px bg-white md:block ${wide ? "lg:hidden" : ""}`}
      />
      <div
        className={`relative mx-auto flex min-h-dvh w-full max-w-[430px] flex-col border-white/15 bg-ink md:border-x ${
          wide ? "lg:max-w-none lg:border-x-0" : ""
        }`}
      >
        <div className="neon-rule" />
        {children}
      </div>
    </div>
  );
}
