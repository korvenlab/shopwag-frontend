"use client";

import * as Dialog from "@radix-ui/react-dialog";
import type { ReactNode } from "react";

export function ConfirmDialog({
  title,
  description,
  confirmLabel,
  onConfirm,
  children,
}: {
  title: string;
  description: string;
  confirmLabel: string;
  onConfirm: () => void;
  children: ReactNode;
}) {
  return (
    <Dialog.Root>
      <Dialog.Trigger asChild>{children}</Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-40 bg-black/70" />
        <Dialog.Content className="fixed top-1/2 left-1/2 z-50 w-[min(92vw,360px)] -translate-x-1/2 -translate-y-1/2 rounded-3xl border border-paper/15 bg-ink p-5 text-paper shadow-[0_0_40px_color-mix(in_srgb,var(--color-paper)_8%,transparent)]">
          <Dialog.Title className="font-serif text-2xl">{title}</Dialog.Title>
          <Dialog.Description className="mt-2 text-sm leading-6 text-mute">
            {description}
          </Dialog.Description>
          <div className="mt-5 flex gap-2">
            <Dialog.Close className="h-11 flex-1 rounded-full border border-paper/20 text-sm">
              Voltar
            </Dialog.Close>
            <Dialog.Close
              className="h-11 flex-1 rounded-full bg-paper text-sm font-medium text-ink"
              onClick={onConfirm}
            >
              {confirmLabel}
            </Dialog.Close>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
