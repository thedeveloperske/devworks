"use client";

import { X } from "lucide-react";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";

type ModalVariant = "panel" | "popup";
type ModalSize = "md" | "lg" | "xl";

type ModalProps = {
  open: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children: React.ReactNode;
  variant?: ModalVariant;
  size?: ModalSize;
};

const popupSizeClass: Record<ModalSize, string> = {
  md: "max-w-md",
  lg: "max-w-2xl",
  xl: "max-w-4xl",
};

export function Modal({
  open,
  onClose,
  title,
  description,
  children,
  variant = "panel",
  size = "lg",
}: ModalProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!open) return;

    const previousOverflow = document.body.style.overflow;
    const onKey = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      if (variant === "popup") {
        event.stopImmediatePropagation();
      }
      onClose();
    };

    document.body.style.overflow = "hidden";
    document.addEventListener(
      "keydown",
      onKey,
      variant === "popup" ? { capture: true } : undefined
    );
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener(
        "keydown",
        onKey,
        variant === "popup" ? { capture: true } : undefined
      );
    };
  }, [open, onClose, variant]);

  if (!open) return null;

  const header = (
    <div className="flex shrink-0 items-start justify-between gap-4 border-b border-slate-200 px-4 py-2 sm:px-5">
      <div>
        <h2 id="modal-title" className="text-[12px] font-bold uppercase text-slate-900">
          {title}
        </h2>
        {description ? (
          <p className="mt-0.5 text-[12px] text-slate-500">{description}</p>
        ) : null}
      </div>
      <button
        type="button"
        onClick={onClose}
        aria-label="Close"
        className="flex h-8 w-8 shrink-0 items-center justify-center text-slate-500 hover:text-maroon"
      >
        <X className="h-5 w-5" />
      </button>
    </div>
  );

  if (variant === "popup") {
    const popup = (
      <div className="fixed inset-0 z-60 flex items-center justify-center p-4">
        <button
          type="button"
          aria-label="Close dialog"
          className="absolute inset-0 bg-slate-900/40"
          onClick={onClose}
        />
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="modal-title"
          className={`relative flex max-h-[min(85vh,820px)] w-full flex-col overflow-hidden border border-slate-200 bg-white text-[12px] shadow-xl ${popupSizeClass[size]}`}
        >
          {header}
          <div className="flex min-h-0 flex-1 flex-col overflow-hidden px-4 py-2 sm:px-5">
            {children}
          </div>
        </div>
      </div>
    );

    if (!mounted) return null;
    return createPortal(popup, document.body);
  }

  return (
    <div className="absolute inset-0 z-40 flex flex-col">
      <button
        type="button"
        aria-label="Close dialog"
        className="absolute inset-0 bg-slate-900/25"
        onClick={onClose}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
        className="relative flex min-h-0 flex-1 flex-col overflow-hidden border border-slate-200 bg-white text-[12px] shadow-lg"
      >
        {header}
        <div className="flex min-h-0 flex-1 flex-col overflow-hidden px-4 py-2 sm:px-5">
          {children}
        </div>
      </div>
    </div>
  );
}
