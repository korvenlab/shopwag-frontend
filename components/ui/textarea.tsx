import type { TextareaHTMLAttributes } from "react";
import { cn } from "@/lib/cn";

export function Textarea({ className, ...props }: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      className={cn(
        "min-h-28 w-full rounded-2xl border border-white/15 bg-white/5 px-4 py-3 text-sm text-paper outline-none placeholder:text-mute focus:border-white/60",
        className,
      )}
      {...props}
    />
  );
}
