import type { InputHTMLAttributes } from "react";
import { cn } from "@/lib/cn";

export function Input({ className, ...props }: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={cn(
        "h-12 w-full rounded-2xl border border-paper/15 bg-paper/5 px-4 text-sm text-paper outline-none placeholder:text-mute focus:border-paper/60",
        className,
      )}
      {...props}
    />
  );
}
