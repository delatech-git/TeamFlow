"use client";

import { type ReactNode, useCallback, useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";

import { cn } from "./utils";
import { Button } from "./button";

export type ModalProps = {
  open: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  children?: ReactNode;
  footer?: ReactNode;
  className?: string;
};

export function Modal({
  open,
  onClose,
  title,
  description,
  children,
  footer,
  className,
}: ModalProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!open) return;

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };

    document.body.style.overflow = "hidden";
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.body.style.overflow = "";
      document.removeEventListener("keydown", handleEscape);
    };
  }, [open, onClose]);

  const handleOverlayClick = useCallback(
    (event: React.MouseEvent<HTMLDivElement>) => {
      if (event.target === event.currentTarget) onClose();
    },
    [onClose],
  );

  if (!mounted || !open) return null;

  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      onClick={handleOverlayClick}
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/75 p-4 backdrop-blur-md animate-in fade-in duration-200"
    >
      <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
        <div className="h-80 w-80 rounded-full bg-blue-500/20 blur-3xl" />
      </div>

      <div
        onClick={(event) => event.stopPropagation()}
        className={cn(
          "relative w-fit max-w-[min(90vw,560px)] overflow-hidden rounded-2xl",
          "border border-white/20 bg-white/10 text-white shadow-2xl backdrop-blur-xl",
          "animate-in fade-in zoom-in-95 slide-in-from-bottom-4 duration-200",
          className,
        )}
      >
        {(title || description) && (
          <div className="flex items-start justify-between gap-4 border-b border-white/10 px-6 py-5">
            <div>
              {title && (
                <h2 className="text-lg font-semibold tracking-tight">
                  {title}
                </h2>
              )}

              {description && (
                <p className="mt-1 text-sm leading-relaxed text-white/65">
                  {description}
                </p>
              )}
            </div>

            <Button
              variant="ghost"
              size="sm"
              rounded
              iconOnly
              onClick={onClose}
              aria-label="Close modal"
              className="shrink-0 text-white hover:bg-white/10 hover:text-white"
            >
              <X size={18} strokeWidth={2.3} />
            </Button>
          </div>
        )}

        {children && (
          <div className="max-h-[60vh] overflow-y-auto px-6 py-5">
            {children}
          </div>
        )}

        {footer && (
          <div className="flex justify-end gap-3 border-t border-white/10 px-6 py-4">
            {footer}
          </div>
        )}
      </div>
    </div>,
    document.body,
  );
}
