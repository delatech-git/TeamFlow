import { Camera, Sparkles } from "lucide-react";
import type { PlannedIdeaCard } from "@/app/planned-ideas/types";
import type { TeamPhotoDto } from "@/src/infrastructure/api/ideas/client";

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-slate-700/40 bg-[#0b1628] px-2.5 py-2">
      <p className="text-[11px] text-slate-400">{label}</p>
      <p className="mt-0.5 text-sm font-semibold text-slate-100">{value}</p>
    </div>
  );
}

function getSectionIcon(section: string): string {
  const normalized = section.toLowerCase();

  if (normalized.includes("overview")) return "🎯";
  if (normalized.includes("concept")) return "✨";
  if (normalized.includes("decision")) return "📌";
  if (normalized.includes("location") || normalized.includes("setup"))
    return "📍";
  if (normalized.includes("food") || normalized.includes("drink")) return "🍽️";
  if (normalized.includes("entertainment") || normalized.includes("activity"))
    return "🎵";
  if (normalized.includes("decoration") || normalized.includes("atmosphere"))
    return "🎨";
  if (normalized.includes("role") || normalized.includes("respons"))
    return "👥";
  if (normalized.includes("timeline")) return "🗓️";
  if (normalized.includes("checklist") || normalized.includes("action"))
    return "✅";

  return "💡";
}

export function IdeaDetailPanel({
  selectedIdeaView,
  plannedGuideSections,
  teamPhotos,
  uploadingPhoto,
  photoError,
  onTeamPhotoUpload,
}: {
  selectedIdeaView: PlannedIdeaCard | null;
  plannedGuideSections: string[];
  teamPhotos: TeamPhotoDto[];
  uploadingPhoto: boolean;
  photoError: string;
  onTeamPhotoUpload: (event: React.ChangeEvent<HTMLInputElement>) => void;
}) {
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
      <div className="rounded-2xl border border-slate-700/40 bg-[#0a1221] p-4">
        <p className="inline-flex items-center gap-1 rounded-full border border-cyan-400/30 bg-cyan-500/10 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.12em] text-cyan-200">
          <Sparkles size={12} aria-hidden />
          Planned idea
        </p>
        <h2 className="mt-3 text-2xl font-bold text-white">
          {selectedIdeaView.title}
        </h2>
        <p className="mt-1 text-sm text-slate-400">
          Event Concept • Created {selectedIdeaView.createdAtLabel} • Updated{" "}
          {selectedIdeaView.updatedLabel}
        </p>
        <p className="mt-4 text-sm leading-6 text-slate-300">
          This planned idea was generated from the selected board decisions
          and transformed into a structured event guide.
        </p>

        <div className="mt-4 grid gap-2 rounded-xl border border-slate-700/40 bg-[#08101d] p-3">
          <Metric label="Team" value={selectedIdeaView.owner} />
        </div>
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

        <div className="mt-4 space-y-4">
          {plannedGuideSections.length > 0 ? (
            plannedGuideSections.map((section, index) => (
              <article
                key={`${section.slice(0, 30)}-${index}`}
                className="rounded-xl border border-slate-700/40 bg-[#08101d] p-4"
              >
                <div className="flex gap-3">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-cyan-300/25 bg-cyan-400/10 text-lg">
                    {getSectionIcon(section)}
                  </div>

                  <div className="whitespace-pre-line text-sm leading-7 text-slate-200">
                    {section}
                  </div>
                </div>
              </article>
            ))
          ) : (
            <p className="text-sm text-slate-400">
              No AI-generated plan has been created yet.
            </p>
          )}
        </div>
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
            teamPhotos.map((photo) => (
              <figure
                key={photo.id}
                className="overflow-hidden rounded-xl border border-slate-700/40 bg-[#08101d]"
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
            ))
          )}
        </div>
      </div>
    </section>
  );
}
