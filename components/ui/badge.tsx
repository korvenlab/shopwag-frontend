import { cn } from "@/lib/cn";

export function Badge({
  children,
  tone = "solid",
  className,
}: {
  children: React.ReactNode;
  tone?: "solid" | "line" | "warn" | "ok" | "pending" | "danger";
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex h-6 items-center rounded-full px-2.5 text-[11px] font-medium tracking-wide",
        tone === "solid" && "bg-accent text-on-accent",
        tone === "line" && "border border-paper/25 text-paper",
        tone === "warn" && "bg-[#ff4d4d] text-white",
        tone === "ok" && "bg-ok text-white",
        tone === "pending" && "bg-warn text-white",
        tone === "danger" && "bg-danger text-white",
        className,
      )}
    >
      {children}
    </span>
  );
}
