"use client";

import { useEffect, useState } from "react";
import { Check, Copy, ExternalLink, Loader2, X } from "lucide-react";
import type { TeamPhotoDto } from "@/src/infrastructure/api/ideas/client";
import { getAccessToken } from "@/src/infrastructure/auth/session";
import { requestLinkedInCaption } from "@/app/planned-ideas/linkedInApi";

export function LinkedInPostModal({
  open,
  onClose,
  ideaId,
  ideaTitle,
  teamPhotos,
}: {
  open: boolean;
  onClose: () => void;
  ideaId: string;
  ideaTitle: string;
  teamPhotos: TeamPhotoDto[];
}) {
  const [caption, setCaption] = useState("");
  const [generating, setGenerating] = useState(false);
  const [generateError, setGenerateError] = useState("");
  const [removedIds, setRemovedIds] = useState<Set<string>>(new Set());
  const [photoOrder, setPhotoOrder] = useState<string[]>([]);
  const [draggedId, setDraggedId] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!open) return;

    setCaption(`${ideaTitle}\n\n`);
    setRemovedIds(new Set());
    setPhotoOrder(teamPhotos.map((photo) => photo.id));
    setCopied(false);
    setGenerateError("");

    const token = getAccessToken();
    if (!token) return;

    let cancelled = false;
    setGenerating(true);
    requestLinkedInCaption(ideaId, token)
      .then(({ caption: generated }) => {
        if (!cancelled) setCaption(generated);
      })
      .catch((e) => {
        if (!cancelled) {
          setGenerateError(
            e instanceof Error ? e.message : "Could not generate a caption.",
          );
        }
      })
      .finally(() => {
        if (!cancelled) setGenerating(false);
      });

    return () => {
      cancelled = true;
    };
  }, [open, ideaId, ideaTitle, teamPhotos]);

  if (!open) return null;

  const photosById = new Map(teamPhotos.map((photo) => [photo.id, photo]));
  const orderedPhotos = photoOrder
    .map((id) => photosById.get(id))
    .filter((photo): photo is TeamPhotoDto => Boolean(photo));
  const includedPhotos = orderedPhotos.filter(
    (photo) => !removedIds.has(photo.id),
  );

  const toggleRemoved = (id: string) => {
    setRemovedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const reorder = (draggedPhotoId: string, targetId: string) => {
    if (draggedPhotoId === targetId) return;
    setPhotoOrder((prev) => {
      const next = prev.filter((id) => id !== draggedPhotoId);
      const targetIndex = next.indexOf(targetId);
      next.splice(targetIndex, 0, draggedPhotoId);
      return next;
    });
  };

  const copyCaption = async () => {
    await navigator.clipboard.writeText(caption);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
      <div className="w-full max-w-lg rounded-2xl border border-slate-700/40 bg-[#0a1221] p-5">
        <div className="flex items-center justify-between gap-3 border-b border-slate-700/40 pb-3">
          <h3 className="text-lg font-semibold text-white">
            Create LinkedIn post
          </h3>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="text-slate-400 transition hover:text-white"
          >
            <X size={18} aria-hidden />
          </button>
        </div>

        <div className="relative mt-4">
          <textarea
            value={caption}
            onChange={(e) => setCaption(e.target.value)}
            rows={7}
            disabled={generating}
            className="w-full resize-y rounded-xl border border-slate-700/40 bg-[#08101d] p-3 text-sm leading-6 text-slate-200 outline-none focus:border-cyan-400/40 disabled:opacity-50"
            placeholder="Write the post description..."
          />
          {generating ? (
            <div className="absolute inset-0 flex items-center justify-center gap-2 rounded-xl bg-[#08101d]/70 text-sm text-cyan-200">
              <Loader2 size={15} className="animate-spin" aria-hidden />
              Generating with AI...
            </div>
          ) : null}
        </div>

        {generateError ? (
          <p className="mt-2 text-sm text-red-300">{generateError}</p>
        ) : null}

        {teamPhotos.length > 0 ? (
          <>
            <p className="mt-4 text-xs uppercase tracking-[0.14em] text-slate-400">
              Photos to include ({includedPhotos.length} of {teamPhotos.length})
              — click to remove, drag to reorder
            </p>
            <div className="mt-2 grid grid-cols-4 gap-2">
              {orderedPhotos.map((photo) => {
                const removed = removedIds.has(photo.id);
                const order = includedPhotos.findIndex((p) => p.id === photo.id);
                return (
                  <button
                    key={photo.id}
                    type="button"
                    draggable
                    onClick={() => toggleRemoved(photo.id)}
                    onDragStart={() => setDraggedId(photo.id)}
                    onDragEnd={() => setDraggedId(null)}
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={(e) => {
                      e.preventDefault();
                      if (draggedId) reorder(draggedId, photo.id);
                    }}
                    className={`relative cursor-grab overflow-hidden rounded-lg border-2 transition active:cursor-grabbing ${
                      removed
                        ? "border-transparent opacity-35"
                        : "border-cyan-400"
                    } ${draggedId === photo.id ? "opacity-50" : ""}`}
                  >
                    <img
                      src={photo.imageUrl}
                      alt=""
                      className="h-16 w-full object-cover"
                    />
                    {!removed ? (
                      <span className="absolute left-1 top-1 flex h-4 w-4 items-center justify-center rounded-full bg-white text-[10px] font-bold text-slate-900">
                        {order + 1}
                      </span>
                    ) : null}
                    <span
                      className={`absolute right-1 top-1 rounded-full p-0.5 ${
                        removed
                          ? "bg-slate-600 text-slate-300"
                          : "bg-cyan-400 text-[#08101d]"
                      }`}
                    >
                      {removed ? <X size={10} aria-hidden /> : <Check size={10} aria-hidden />}
                    </span>
                  </button>
                );
              })}
            </div>
          </>
        ) : null}

        <p className="mt-4 text-xs leading-5 text-slate-500">
          Auto-publishing needs a LinkedIn API connection, which isn&apos;t set
          up yet. Copy the caption below, open LinkedIn, and attach the
          included photos manually.
        </p>

        <div className="mt-3 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={copyCaption}
            className="inline-flex items-center gap-1.5 rounded-full border border-slate-600/50 px-3 py-1.5 text-xs font-semibold text-slate-200 transition hover:border-cyan-400/40 hover:text-cyan-200"
          >
            {copied ? <Check size={13} aria-hidden /> : <Copy size={13} aria-hidden />}
            {copied ? "Copied" : "Copy caption"}
          </button>
          <a
            href="https://www.linkedin.com/feed/?shareActive=true"
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1.5 rounded-full bg-linear-to-r from-cyan-500 to-blue-600 px-3 py-1.5 text-xs font-semibold text-white transition"
          >
            <ExternalLink size={13} aria-hidden />
            Open LinkedIn
          </a>
        </div>
      </div>
    </div>
  );
}
