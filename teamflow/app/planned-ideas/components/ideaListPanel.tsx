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
    <aside className="rounded-2xl border border-cyan-400/10 bg-[#0b1424] p-3 shadow-[0_20px_60px_rgba(0,0,0,0.4)]">
      <div className="flex items-center justify-between gap-3 border-b border-slate-700/40 pb-3">
        <div>
          <p className="text-xs uppercase tracking-[0.18em] text-cyan-300/80">
            Planned ideas
          </p>
          <h1 className="mt-1 text-lg font-semibold">Board decisions</h1>
        </div>
        <span className="rounded-full border border-cyan-300/30 px-2 py-0.5 text-xs text-cyan-200">
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
                "w-full rounded-xl border px-3 py-2.5 text-left transition",
                isActive
                  ? "border-cyan-300/60 bg-cyan-500/10"
                  : "border-slate-700/40 bg-[#0e1728] hover:border-cyan-500/30 hover:bg-[#111d32]",
              ].join(" ")}
            >
              <p className="line-clamp-1 text-sm font-semibold text-slate-100">
                {idea.title}
              </p>
              <div className="mt-1.5 flex items-center justify-between gap-2 text-xs text-slate-400">
                <span>{idea.updatedLabel}</span>
                <span className="rounded-full border border-emerald-300/30 bg-emerald-400/10 px-1.5 py-0.5 text-[10px] font-semibold text-emerald-200">
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
