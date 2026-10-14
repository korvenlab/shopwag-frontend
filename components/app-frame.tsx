export function AppFrame({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative min-h-dvh bg-ink text-paper">
      <div
        aria-hidden
        className="neon-pulse pointer-events-none fixed inset-y-0 left-[calc(50%-240px)] hidden w-px bg-white md:block"
      />
      <div className="relative mx-auto flex min-h-dvh w-full max-w-[430px] flex-col border-white/15 bg-ink md:border-x">
        <div className="neon-rule" />
        {children}
      </div>
    </div>
  );
}
