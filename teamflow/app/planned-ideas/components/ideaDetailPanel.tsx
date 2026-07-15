import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { Camera, ChevronDown, LayoutGrid, Sparkles } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import type { Components } from "react-markdown";
import type { PlannedIdeaCard } from "@/app/planned-ideas/types";
import type { TeamPhotoDto } from "@/src/infrastructure/api/ideas/client";
import {
  hashAccent,
  sectionAccent,
  type Accent,
} from "@/app/planned-ideas/colorAccents";

const GUIDE_COLLAPSED_HEIGHT = 500;

// Guide is stored as GFM markdown with "## <emoji> Title" section headings.
function splitGuideSections(markdown: string): string[] {
  return markdown
    .split(/\n(?=##\s)/)
    .map((section) => section.trim())
    .filter(Boolean);
}

function getGuideMarkdownComponents(accent: Accent): Components {
  return {
    h2: ({ children }) => (
      <p className={`text-sm font-semibold ${accent.text}`}>{children}</p>
    ),
    p: ({ children }) => (
      <p className="text-sm leading-6 text-slate-300">{children}</p>
    ),
    ul: ({ children }) => <ul className="mt-2 space-y-1.5">{children}</ul>,
    li: ({ children }) => (
      <li className="flex gap-2 text-sm leading-6 text-slate-300">
        <span className={`mt-2 h-1 w-1 shrink-0 rounded-full ${accent.dot}`} />
        <span>{children}</span>
      </li>
    ),
    table: ({ children }) => (
      <div className={`mt-2 overflow-x-auto rounded-lg border ${accent.border}`}>
        <table className="w-full text-left text-sm text-slate-300">
          {children}
        </table>
      </div>
    ),
    thead: ({ children }) => (
      <thead className={`${accent.bg} text-xs uppercase tracking-wide ${accent.text}`}>
        {children}
      </thead>
    ),
    th: ({ children }) => <th className="px-3 py-2 font-semibold">{children}</th>,
    td: ({ children }) => (
      <td className="border-t border-slate-700/40 px-3 py-2 align-top">
        {children}
      </td>
    ),
    strong: ({ children }) => (
      <strong className="font-semibold text-white">{children}</strong>
    ),
  };
}

export function IdeaDetailPanel({
  selectedIdeaView,
  teamPhotos,
  uploadingPhoto,
  photoError,
  onTeamPhotoUpload,
}: {
  selectedIdeaView: PlannedIdeaCard | null;
  teamPhotos: TeamPhotoDto[];
  uploadingPhoto: boolean;
  photoError: string;
  onTeamPhotoUpload: (event: React.ChangeEvent<HTMLInputElement>) => void;
}) {
  const plannedGuideSections = selectedIdeaView?.summary
    ? splitGuideSections(selectedIdeaView.summary)
    : [];

  const guideContentRef = useRef<HTMLDivElement>(null);
  const [guideExpanded, setGuideExpanded] = useState(false);
  const [guideOverflows, setGuideOverflows] = useState(false);

  useEffect(() => {
    const el = guideContentRef.current;
    if (!el) return;
    setGuideOverflows(el.scrollHeight > GUIDE_COLLAPSED_HEIGHT);
  }, [plannedGuideSections]);

  if (!selectedIdeaView) {
    return (
      <section className="rounded-2xl border border-cyan-400/10 bg-[#0b1424] p-4 shadow-[0_20px_60px_rgba(0,0,0,0.4)] sm:p-5">
        <div className="rounded-2xl border border-slate-700/40 bg-[#0a1221] p-6 text-sm text-slate-400">
          Pick a planned idea from the left panel.
        </div>
      </section>
    );
  }

  return (
    <section className="rounded-2xl border border-cyan-400/10 bg-[#0b1424] p-4 shadow-[0_20px_60px_rgba(0,0,0,0.4)] sm:p-5">
      <div
        className="relative overflow-hidden rounded-2xl border border-slate-700/40 bg-[#0a1221] bg-cover bg-center p-4"
        style={
          selectedIdeaView.coverImageUrl
            ? { backgroundImage: `url(${selectedIdeaView.coverImageUrl})` }
            : undefined
        }
      >
        {selectedIdeaView.coverImageUrl ? (
          <div className="absolute inset-0 bg-[#0a1221]/80" />
        ) : null}
        <div className="relative flex items-center justify-between gap-3">
          <p className="inline-flex items-center gap-1 rounded-full border border-cyan-400/30 bg-cyan-500/10 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.12em] text-cyan-200">
            <Sparkles size={12} aria-hidden />
            Planned idea
          </p>
          <Link
            href={`/dashboard/ideas/${selectedIdeaView.id}`}
            className="inline-flex items-center gap-1.5 rounded-full border border-slate-600/50 px-3 py-1.5 text-xs font-semibold text-slate-200 transition hover:border-cyan-400/40 hover:text-cyan-200"
          >
            <LayoutGrid size={13} aria-hidden />
            View idea board
          </Link>
        </div>
        <h2 className="relative mt-3 text-2xl font-bold text-white">
          {selectedIdeaView.title}
        </h2>
        <p className="relative mt-1 text-sm text-slate-400">
          Event Concept • Created {selectedIdeaView.createdAtLabel} • Updated{" "}
          {selectedIdeaView.updatedLabel}
        </p>
        <p className="relative mt-4 text-sm leading-6 text-slate-300">
          This planned idea was generated from the selected board decisions
          and transformed into a structured event guide.
        </p>
      </div>

      <div className="mt-4 rounded-2xl border border-slate-700/40 bg-[#0a1221] p-4">
        <div className="flex items-center justify-between gap-3 border-b border-slate-700/40 pb-3">
          <div>
            <p className="text-xs uppercase tracking-[0.16em] text-cyan-300/80">
              AI Generated Plan
            </p>
            <h3 className="mt-1 text-lg font-semibold text-white">
              Final Event Guide
            </h3>
          </div>
          <span className="rounded-full border border-emerald-300/30 bg-emerald-400/10 px-2.5 py-1 text-xs font-semibold text-emerald-200">
            Ready
          </span>
        </div>

        <div
          className="relative mt-4 overflow-hidden transition-[max-height] duration-300"
          style={{
            maxHeight:
              guideExpanded || !guideOverflows
                ? undefined
                : GUIDE_COLLAPSED_HEIGHT,
          }}
        >
          <div ref={guideContentRef} className="space-y-4">
            {plannedGuideSections.length > 0 ? (
              plannedGuideSections.map((section, index) => {
                const accent = sectionAccent(section);
                return (
                  <article
                    key={`${section.slice(0, 30)}-${index}`}
                    className={`rounded-xl border ${accent.border} ${accent.bg} p-4`}
                  >
                    <ReactMarkdown
                      remarkPlugins={[remarkGfm]}
                      components={getGuideMarkdownComponents(accent)}
                    >
                      {section}
                    </ReactMarkdown>
                  </article>
                );
              })
            ) : (
              <p className="text-sm text-slate-400">
                No AI-generated plan has been created yet.
              </p>
            )}
          </div>

          {!guideExpanded && guideOverflows ? (
            <div className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-linear-to-t from-[#0a1221] to-transparent" />
          ) : null}
        </div>

        {guideOverflows ? (
          <button
            type="button"
            onClick={() => setGuideExpanded((prev) => !prev)}
            className="mt-3 inline-flex w-full items-center justify-center gap-1.5 rounded-lg border border-slate-700/40 py-2 text-sm font-semibold text-cyan-300/80 transition hover:border-cyan-400/40 hover:text-cyan-200"
          >
            {guideExpanded ? "Show less" : "Show full guide"}
            <ChevronDown
              size={15}
              aria-hidden
              className={[
                "transition-transform",
                guideExpanded ? "rotate-180" : "",
              ].join(" ")}
            />
          </button>
        ) : null}
      </div>

      <div className="mt-4 rounded-2xl border border-slate-700/40 bg-[#0a1221] p-4">
        <div className="flex items-center justify-between gap-3 border-b border-slate-700/40 pb-3">
          <div>
            <p className="text-xs uppercase tracking-[0.16em] text-cyan-300/80">
              Team space
            </p>
            <h3 className="mt-1 text-lg font-semibold text-white">
              Team photos
            </h3>
          </div>
          <label className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg border border-cyan-400/35 bg-cyan-500/15 px-3 py-1.5 text-sm font-semibold text-cyan-100">
            <Camera size={14} aria-hidden />
            {uploadingPhoto ? "Uploading..." : "Upload photo"}
            <input
              type="file"
              accept="image/png,image/jpeg,image/webp"
              className="hidden"
              disabled={uploadingPhoto}
              onChange={onTeamPhotoUpload}
            />
          </label>
        </div>

        {photoError ? (
          <p className="mt-3 text-sm text-red-300">{photoError}</p>
        ) : null}

        <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
          {teamPhotos.length === 0 ? (
            <p className="col-span-full text-sm text-slate-400">
              No team photos yet. Be the first to share one.
            </p>
          ) : (
            teamPhotos.map((photo) => {
              const accent = hashAccent(photo.uploadedBy.id);
              return (
                <figure
                  key={photo.id}
                  className={`overflow-hidden rounded-xl border ${accent.border} bg-[#08101d]`}
                >
                  <img
                    src={photo.imageUrl}
                    alt={`Team photo uploaded by ${photo.uploadedBy.fullName || photo.uploadedBy.username}`}
                    className="h-32 w-full object-cover"
                  />
                  <figcaption className="px-2 py-1.5 text-[11px] text-slate-400">
                    {photo.uploadedBy.fullName || photo.uploadedBy.username}
                  </figcaption>
                </figure>
              );
            })
          )}
        </div>
      </div>
    </section>
  );
}
