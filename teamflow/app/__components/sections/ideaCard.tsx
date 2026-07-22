"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { ArrowRight, Camera, CalendarDays, Loader2, Rocket, Trash2, Users } from "lucide-react";

import fallbackImage from "@/assets/cardImage.png";
import { updateIdeaCoverImage } from "@/src/infrastructure/api/ideas/client";
import type { IdeaResponseDto } from "@/src/infrastructure/api/ideas/types";
import { ideaDetailHref } from "@/src/entities/models/discover";

const STATUS_DOT_COLORS: Record<string, string> = {
  PLANNED: "bg-orange-400",
  DRAFT: "bg-slate-400",
  NEW: "bg-sky-400",
  COMPLETED: "bg-emerald-400",
  CANCELLED: "bg-rose-400",
};

export function IdeaCard({
  idea,
  priority,
  canEditImage,
  onCoverImageUpdated,
  showDelete,
  onDelete,
  deleteBusy,
  onPublish,
  publishBusy,
}: {
  idea: IdeaResponseDto;
  priority?: boolean;
  canEditImage?: boolean;
  onCoverImageUpdated?: (ideaId: string, coverImageUrl: string | null) => void;
  showDelete?: boolean;
  onDelete?: () => void | Promise<void>;
  deleteBusy?: boolean;
  onPublish?: () => void | Promise<void>;
  publishBusy?: boolean;
}) {
  const ideaImage = idea.coverImageUrl || fallbackImage;
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const inputId = `idea-cover-${idea.id}`;
  const author = idea.createdBy?.fullName || idea.createdBy?.username || "Unknown";

  async function handleCoverImageChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;

    setIsUploading(true);
    setUploadError("");
    try {
      const updated = await updateIdeaCoverImage(idea.id, file);
      onCoverImageUpdated?.(idea.id, updated.coverImageUrl ?? null);
    } catch (err) {
      setUploadError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setIsUploading(false);
    }
  }

  return (
    <article className="group relative flex min-h-117.5 flex-col overflow-hidden rounded-[22px] border border-white/10 bg-[#111827]/80 transition duration-300 hover:-translate-y-1 hover:border-white/20 hover:shadow-[0_24px_60px_rgba(0,0,0,0.32)]">
      <Link
        href={ideaDetailHref(idea)}
        aria-label={`Open ${idea.title}`}
        className="absolute inset-0 z-20"
      />

      <div className="relative aspect-4/3 overflow-hidden bg-white/5">
        {typeof ideaImage === "string" && isRemoteImageUrl(ideaImage) ? (
          <img
            src={ideaImage}
            alt={idea.title}
            className="h-full w-full object-cover transition duration-700 group-hover:scale-105"
          />
        ) : (
          <Image
            src={ideaImage}
            alt={idea.title}
            fill
            priority={priority}
            sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 33vw"
            className="object-cover transition duration-700 group-hover:scale-105"
          />
        )}

        <div className="absolute inset-0 bg-linear-to-t from-[#111827] via-transparent to-black/10" />

        <span className="absolute right-3 top-3 flex items-center gap-1.5 rounded-full border border-white/25 bg-black/45 px-2.5 py-1 text-[10px] font-bold tracking-wide text-white backdrop-blur-md">
          <span className={`h-1.5 w-1.5 rounded-full ${STATUS_DOT_COLORS[idea.status] ?? "bg-white/60"}`} />
          {formatStatus(idea.status)}
        </span>

        {(canEditImage || showDelete) && (
          <div className="absolute left-3 top-3 z-30 flex gap-2">
            {canEditImage && (
              <label
                htmlFor={inputId}
                title="Update cover image"
                className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-full border border-white/25 bg-black/45 text-white backdrop-blur-md transition hover:border-orange-400/60 hover:text-orange-300"
              >
                {isUploading ? (
                  <Loader2 size={14} className="animate-spin" aria-hidden />
                ) : (
                  <Camera size={14} aria-hidden />
                )}
                <input
                  id={inputId}
                  type="file"
                  accept="image/png,image/jpeg,image/webp,image/avif,image/gif"
                  className="sr-only"
                  disabled={isUploading}
                  onClick={(e) => e.stopPropagation()}
                  onChange={handleCoverImageChange}
                />
              </label>
            )}

            {showDelete && (
              <button
                type="button"
                aria-label="Delete idea"
                disabled={deleteBusy}
                className="flex h-8 w-8 items-center justify-center rounded-full border border-white/25 bg-black/45 text-white backdrop-blur-md transition hover:border-red-400/60 hover:bg-red-950/80 hover:text-red-100 disabled:opacity-50"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  void onDelete?.();
                }}
              >
                <Trash2 size={14} aria-hidden />
              </button>
            )}
          </div>
        )}

        {uploadError && (
          <span className="absolute bottom-3 left-3 right-3 z-30 rounded-lg bg-red-950/80 px-2 py-1 text-[10px] font-semibold text-red-200">
            {uploadError}
          </span>
        )}
      </div>

      <div className="relative z-10 -mt-10 flex flex-1 flex-col px-4 pb-4 pt-3 sm:px-5 sm:pb-5">
        <h3 className="line-clamp-2 text-lg font-bold tracking-tight text-white">
          {idea.title}
        </h3>

        <p className="mt-2 line-clamp-2 min-h-10 text-sm leading-5 text-white/55">
          {idea.shortDescription || "Discover more about this idea."}
        </p>

        <div className="mt-auto flex items-center justify-between gap-3 border-t border-white/10 pt-4">
          <div className="flex min-w-0 items-center gap-2 text-xs text-white/50">
            <span className="flex shrink-0 items-center gap-1">
              <CalendarDays size={14} aria-hidden className="text-orange-300" />
              {formatDate(idea.createdAt)}
            </span>
            <span aria-hidden>•</span>
            <span className="flex min-w-0 items-center gap-1 truncate">
              <Users size={14} aria-hidden className="shrink-0 text-orange-300" />
              <span className="truncate">{author}</span>
            </span>
          </div>

          <div className="flex shrink-0 items-center gap-2">
            {idea.status === "DRAFT" && onPublish && (
              <button
                type="button"
                disabled={publishBusy}
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  void onPublish();
                }}
                className="relative z-30 flex items-center gap-1.5 rounded-full border border-orange-400/40 bg-orange-500/10 px-3 py-1.5 text-xs font-semibold text-orange-300 transition hover:border-orange-400 hover:bg-orange-500/20 disabled:opacity-50"
              >
                {publishBusy ? (
                  <Loader2 size={13} className="animate-spin" aria-hidden />
                ) : (
                  <Rocket size={13} aria-hidden />
                )}
                Publish
              </button>
            )}

            <span className="flex h-9 w-9 items-center justify-center rounded-full border border-white/15 bg-white/5 text-white transition duration-300 group-hover:border-orange-400/60 group-hover:bg-orange-400/10 group-hover:text-orange-300">
              <ArrowRight
                size={15}
                aria-hidden
                className="transition-transform duration-300 group-hover:translate-x-0.5"
              />
            </span>
          </div>
        </div>
      </div>
    </article>
  );
}

function isRemoteImageUrl(src: string): boolean {
  return /^https?:\/\//i.test(src);
}

function formatDate(timestamp: string): string {
  const date = new Date(timestamp);

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  return date.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function formatStatus(status: string): string {
  return status.replaceAll("_", " ");
}
