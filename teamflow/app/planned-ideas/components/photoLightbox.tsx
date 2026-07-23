"use client";

import { useEffect } from "react";
import { createPortal } from "react-dom";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import type { TeamPhotoDto } from "@/src/infrastructure/api/ideas/client";

export function PhotoLightbox({
  photos,
  index,
  onClose,
  onNavigate,
}: {
  photos: TeamPhotoDto[];
  index: number | null;
  onClose: () => void;
  onNavigate: (index: number) => void;
}) {
  const open = index !== null && photos.length > 0;

  useEffect(() => {
    if (!open) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
      if (event.key === "ArrowLeft") {
        onNavigate((index! - 1 + photos.length) % photos.length);
      }
      if (event.key === "ArrowRight") {
        onNavigate((index! + 1) % photos.length);
      }
    };

    document.body.style.overflow = "hidden";
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.body.style.overflow = "";
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [open, index, photos.length, onClose, onNavigate]);

  if (!open || typeof document === "undefined") return null;

  const photo = photos[index!];
  const uploaderName =
    photo.uploadedBy.fullName || photo.uploadedBy.username;

  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      onClick={onClose}
      className="fixed inset-0 z-100 flex items-center justify-center bg-black/85 p-4 backdrop-blur-sm"
    >
      <button
        type="button"
        onClick={onClose}
        aria-label="Close"
        className="absolute right-4 top-4 rounded-full border border-white/20 bg-white/10 p-2 text-white transition hover:bg-white/20"
      >
        <X size={20} aria-hidden />
      </button>

      {photos.length > 1 ? (
        <button
          type="button"
          onClick={(event) => {
            event.stopPropagation();
            onNavigate((index! - 1 + photos.length) % photos.length);
          }}
          aria-label="Previous photo"
          className="absolute left-3 top-1/2 -translate-y-1/2 rounded-full border border-white/20 bg-white/10 p-2 text-white transition hover:bg-white/20 sm:left-6"
        >
          <ChevronLeft size={24} aria-hidden />
        </button>
      ) : null}

      <div
        onClick={(event) => event.stopPropagation()}
        className="flex max-h-[90vh] max-w-[90vw] flex-col items-center gap-3"
      >
        <img
          src={photo.imageUrl}
          alt={`Team photo uploaded by ${uploaderName}`}
          className="max-h-[80vh] max-w-[90vw] rounded-xl object-contain shadow-[0_20px_60px_rgba(0,0,0,0.6)]"
        />
        <p className="text-sm font-medium text-white/80">
          {uploaderName} · {index! + 1} / {photos.length}
        </p>
      </div>

      {photos.length > 1 ? (
        <button
          type="button"
          onClick={(event) => {
            event.stopPropagation();
            onNavigate((index! + 1) % photos.length);
          }}
          aria-label="Next photo"
          className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full border border-white/20 bg-white/10 p-2 text-white transition hover:bg-white/20 sm:right-6"
        >
          <ChevronRight size={24} aria-hidden />
        </button>
      ) : null}
    </div>,
    document.body,
  );
}
