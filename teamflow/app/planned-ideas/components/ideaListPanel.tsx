import { Lightbulb } from "lucide-react";
import type { PlannedIdeaCard } from "@/app/planned-ideas/types";

export function IdeaListPanel({
  ideas,
  selectedIdeaId,
  loading,
  error,
  onSelectIdea,
}: {
  ideas: PlannedIdeaCard[];
  selectedIdeaId: string | null;
  loading: boolean;
  error: string | null;
  onSelectIdea: (id: string) => void;
}) {
  return (
    <aside className="rounded-2xl border border-cyan-400/25 bg-[#0b1424] p-3 shadow-[0_20px_60px_rgba(0,0,0,0.4)]">
      <div className="flex items-center justify-between gap-3 border-b border-slate-700/40 pb-3">
        <div>
          <p className="flex items-center gap-1.5 text-xs uppercase tracking-[0.18em] text-cyan-300/80">
            <Lightbulb size={13} aria-hidden />
            Planned ideas
          </p>
          <h1 className="mt-1 text-lg font-semibold">Board decisions</h1>
        </div>
        <span className="rounded-full border border-cyan-300/40 bg-cyan-500/10 px-2 py-0.5 text-xs font-semibold text-cyan-200">
          {ideas.length}
        </span>
      </div>
      <div className="mt-3 space-y-2">
        {loading ? (
          <p className="px-2 py-3 text-sm text-slate-400">
            Loading planned ideas...
          </p>
        ) : null}
        {error ? <p className="px-2 py-3 text-sm text-red-300">{error}</p> : null}
        {!loading && !error && ideas.length === 0 ? (
          <p className="px-2 py-3 text-sm text-slate-400">
            No planned ideas yet. Generate AI decisions from an idea board
            first.
          </p>
        ) : null}
        {ideas.map((idea) => {
          const isActive = idea.id === selectedIdeaId;
          return (
            <button
              key={idea.id}
              type="button"
              onClick={() => onSelectIdea(idea.id)}
              className={[
                "relative w-full overflow-hidden rounded-xl border border-l-4 bg-cover bg-center px-3 py-2.5 text-left transition",
                isActive
                  ? "border-cyan-300/70 border-l-cyan-300 shadow-[0_0_18px_rgba(34,211,238,0.3)]"
                  : "border-slate-700/40 border-l-slate-700/40 hover:border-cyan-500/40",
              ].join(" ")}
              style={
                idea.coverImageUrl
                  ? { backgroundImage: `url(${idea.coverImageUrl})` }
                  : undefined
              }
            >
              <div
                className={[
                  "absolute inset-0",
                  idea.coverImageUrl
                    ? isActive
                      ? "bg-cyan-950/45"
                      : "bg-[#0e1728]/80"
                    : isActive
                      ? "bg-cyan-500/15"
                      : "bg-[#0e1728]",
                ].join(" ")}
              />
              <p className="relative line-clamp-1 text-sm font-semibold text-slate-100">
                {idea.title}
              </p>
              <div className="relative mt-1.5 flex items-center justify-between gap-2 text-xs text-slate-400">
                <span>{idea.updatedLabel}</span>
                <span className="rounded-full border border-emerald-300/50 bg-emerald-400/15 px-1.5 py-0.5 text-[10px] font-semibold text-emerald-200">
                  {idea.status}
                </span>
              </div>
            </button>
          );
        })}
      </div>
    </aside>
  );
}
