import { cn } from "@/lib/cn";

export function Badge({
  children,
  tone = "solid",
  className,
}: {
  children: React.ReactNode;
  tone?: "solid" | "line" | "warn";
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex h-6 items-center rounded-full px-2.5 text-[11px] font-medium tracking-wide",
        tone === "solid" && "bg-paper text-ink",
        tone === "line" && "border border-white/25 text-paper",
        tone === "warn" && "bg-[#ff4d4d] text-white",
        className,
      )}
    >
      {children}
    </span>
  );
}
