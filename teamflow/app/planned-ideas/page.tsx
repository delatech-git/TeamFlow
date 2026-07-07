"use client";

import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import {
  CalendarDays,
  MessageSquare,
  Search,
  Share2,
  Sparkles,
  Users,
} from "lucide-react";
import {
  createIdeaComment,
  getIdeaById,
  getIdeaComments,
  getIdeas,
  type IdeaCommentDto,
  type IdeaResponseDto,
} from "@/src/infrastructure/api/ideas/client";
import { ideaResponseToDiscoverIdea } from "@/src/entities/models/discover";
import { getAccessToken } from "@/src/infrastructure/auth/session";

type PlannedIdeaCard = {
  id: string;
  title: string;
  summary: string;
  createdAtLabel: string;
  updatedLabel: string;
  owner: string;
  status: string;
  coverImageUrl: string | null;
};

function toPlannedIdeaCard(dto: IdeaResponseDto): PlannedIdeaCard {
  const createdAt = new Date(dto.createdAt);

  return {
    id: dto.id,
    title: dto.title,
    summary: dto.plannedGuide?.summary ?? dto.shortDescription,
    createdAtLabel: createdAt.toLocaleDateString(),
    updatedLabel: new Date(dto.updatedAt ?? dto.createdAt).toLocaleDateString(),
    owner: dto.createdBy.fullName || dto.createdBy.username,
    status: dto.status,
    coverImageUrl: dto.coverImageUrl ?? null,
  };
}

export default function PlannedIdeasPage() {
  const searchParams = useSearchParams();
  const selectedIdeaFromQuery = searchParams.get("ideaId");
  const [ideas, setIdeas] = useState<PlannedIdeaCard[]>([]);
  const [selectedIdeaId, setSelectedIdeaId] = useState<string | null>(
    selectedIdeaFromQuery,
  );
  const [loading, setLoading] = useState(true);
  const [loadingDetails, setLoadingDetails] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedIdeaDetails, setSelectedIdeaDetails] =
    useState<IdeaResponseDto | null>(null);
  const [comments, setComments] = useState<IdeaCommentDto[]>([]);
  const [commentDraft, setCommentDraft] = useState("");
  const [postingComment, setPostingComment] = useState(false);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      try {
        const planned = await getIdeas("PLANNED");
        console.log("[PlannedIdeas] getIdeas('PLANNED') response:", planned);

        if (cancelled) return;

        const mapped = planned.map(toPlannedIdeaCard);
        setIdeas(mapped);
        setSelectedIdeaId(
          (prev) => prev ?? selectedIdeaFromQuery ?? mapped[0]?.id ?? null,
        );
      } catch {
        if (!cancelled) {
          setError("Could not load planned ideas.");
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [selectedIdeaFromQuery]);

  useEffect(() => {
    if (!selectedIdeaId) {
      setSelectedIdeaDetails(null);
      setComments([]);
      return;
    }
    let cancelled = false;
    setLoadingDetails(true);
    void (async () => {
      try {
        const [idea, ideaComments] = await Promise.all([
          getIdeaById(selectedIdeaId),
          getIdeaComments(selectedIdeaId),
        ]);
        console.log("[PlannedIdeas] getIdeaById response:", idea);
        console.log(
          "[PlannedIdeas] selected idea shortDescription:",
          idea.shortDescription,
        );
        console.log(
          "[PlannedIdeas] selected idea shortDescription length:",
          idea.shortDescription?.length ?? 0,
        );
        console.log("[PlannedIdeas] comments response:", ideaComments);
        if (cancelled) return;
        setSelectedIdeaDetails(idea);
        setComments(ideaComments);
      } catch {
        if (!cancelled) {
          setSelectedIdeaDetails(null);
          setComments([]);
        }
      } finally {
        if (!cancelled) {
          setLoadingDetails(false);
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [selectedIdeaId]);

  const selectedIdea =
    ideas.find((idea) => idea.id === selectedIdeaId) ??
    ideas.find((idea) => idea.id === selectedIdeaFromQuery) ??
    ideas[0] ??
    null;

  const selectedIdeaView = selectedIdeaDetails
    ? toPlannedIdeaCard(selectedIdeaDetails)
    : selectedIdea;
  const parsedBoardState = selectedIdeaDetails
    ? ideaResponseToDiscoverIdea(selectedIdeaDetails).boardState
    : null;

  const plannedGuideSections = useMemo(() => {
    if (!selectedIdeaView?.summary) return [];

    return selectedIdeaView.summary
      .split(
        /\n(?=\d+\.\s|#{1,3}\s|[A-Z][A-Za-z\s/]+:|[^\n]+🎯|[^\n]+✨|[^\n]+📍|[^\n]+🍽️|[^\n]+🎵|[^\n]+🎨|[^\n]+✅)/,
      )
      .map((section) => section.trim())
      .filter(Boolean);
  }, [selectedIdeaView?.summary]);

  const handlePostComment = async () => {
    if (!selectedIdeaId) return;
    const content = commentDraft.trim();
    if (!content) return;
    if (!getAccessToken()) {
      window.alert("Please log in to post a comment.");
      return;
    }
    setPostingComment(true);
    try {
      const created = await createIdeaComment(selectedIdeaId, { content });
      setComments((prev) => [...prev, created]);
      setCommentDraft("");
    } catch (err) {
      window.alert(
        err instanceof Error ? err.message : "Could not post comment.",
      );
    } finally {
      setPostingComment(false);
    }
  };

  return (
    <section className="min-h-screen bg-[#050b16] px-4 pb-8 pt-25 text-slate-100 sm:px-6 lg:px-8">
      <div className="mx-auto mb-4 flex max-w-425 items-center justify-between gap-3 rounded-2xl border border-cyan-400/10 bg-[#0b1424] px-4 py-3">
        <div>
          <p className="text-xs uppercase tracking-[0.18em] text-cyan-300/80">
            TeamTide
          </p>
          <h1 className="mt-1 text-lg font-semibold text-white">
            Planned Ideas
          </h1>
        </div>
        <div className="hidden items-center gap-2 rounded-xl border border-slate-700/50 bg-[#081120] px-3 py-2 text-sm text-slate-400 md:flex">
          <Search size={14} aria-hidden />
          Search ideas, events, people...
        </div>
      </div>
      <div className="mx-auto grid max-w-425 gap-4 lg:grid-cols-[320px_minmax(0,1fr)_340px]">
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
          <div className="mt-3 flex items-center gap-2 rounded-xl border border-slate-700/50 bg-[#081120] px-3 py-2 text-sm text-slate-400">
            <Search size={14} aria-hidden />
            Search planned ideas...
          </div>
          <div className="mt-3 space-y-2">
            {loading ? (
              <p className="px-2 py-3 text-sm text-slate-400">
                Loading planned ideas...
              </p>
            ) : null}
            {error ? (
              <p className="px-2 py-3 text-sm text-red-300">{error}</p>
            ) : null}
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
                  onClick={() => setSelectedIdeaId(idea.id)}
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

        <section className="rounded-2xl border border-cyan-400/10 bg-[#0b1424] p-4 shadow-[0_20px_60px_rgba(0,0,0,0.4)] sm:p-5">
          {selectedIdeaView ? (
            <>
              <div className="rounded-2xl border border-slate-700/40 bg-[#0a1221] p-4">
                <p className="inline-flex items-center gap-1 rounded-full border border-cyan-400/30 bg-cyan-500/10 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.12em] text-cyan-200">
                  <Sparkles size={12} aria-hidden />
                  Planned idea
                </p>
                <h2 className="mt-3 text-2xl font-bold text-white">
                  {selectedIdeaView.title}
                </h2>
                <p className="mt-1 text-sm text-slate-400">
                  Event Concept • Created {selectedIdeaView.createdAtLabel} •
                  Updated {selectedIdeaView.updatedLabel}
                </p>
                <p className="mt-4 text-sm leading-6 text-slate-300">
                  This planned idea was generated from the selected board
                  decisions and transformed into a structured event guide.
                </p>

                <div className="mt-4 grid gap-2 rounded-xl border border-slate-700/40 bg-[#08101d] p-3 sm:grid-cols-4">
                  <Metric label="Overall Progress" value="75%" />
                  <Metric label="Priority" value="High" />
                  <Metric label="Event Date" value="Jun 15, 2026" />
                  <Metric label="Team" value={selectedIdeaView.owner} />
                </div>

                <div className="mt-4 flex flex-wrap gap-2">
                  <button className="rounded-lg border border-slate-600/60 bg-[#111c2f] px-3 py-1.5 text-sm text-slate-200">
                    Edit plan
                  </button>
                  <button className="inline-flex items-center gap-1 rounded-lg border border-slate-600/60 bg-[#111c2f] px-3 py-1.5 text-sm text-slate-200">
                    <Share2 size={14} aria-hidden />
                    Share
                  </button>
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
            </>
          ) : (
            <div className="rounded-2xl border border-slate-700/40 bg-[#0a1221] p-6 text-sm text-slate-400">
              Pick a planned idea from the left panel.
            </div>
          )}
        </section>

        <aside className="rounded-2xl border border-cyan-400/10 bg-[#0b1424] p-3 shadow-[0_20px_60px_rgba(0,0,0,0.4)]">
          <div className="border-b border-slate-700/40 pb-3">
            <p className="text-xs uppercase tracking-[0.16em] text-cyan-300/80">
              Discussion
            </p>
            <textarea
              value={commentDraft}
              onChange={(event) => setCommentDraft(event.target.value)}
              placeholder="Write a comment..."
              className="mt-2 min-h-21 w-full resize-none rounded-xl border border-slate-700/50 bg-[#081120] px-3 py-2 text-sm text-slate-200 outline-none placeholder:text-slate-500"
            />
            <button
              type="button"
              onClick={handlePostComment}
              disabled={
                postingComment ||
                !selectedIdeaId ||
                commentDraft.trim().length === 0
              }
              className="mt-2 w-full rounded-lg border border-cyan-400/35 bg-cyan-500/15 px-3 py-2 text-sm font-semibold text-cyan-100 disabled:cursor-not-allowed disabled:opacity-45"
            >
              {postingComment ? "Posting..." : "Post comment"}
            </button>
          </div>
          <div className="mt-3 space-y-3">
            {loadingDetails ? (
              <p className="text-sm text-slate-400">Loading discussion...</p>
            ) : null}
            {!loadingDetails && comments.length === 0 ? (
              <p className="text-sm text-slate-400">
                No comments yet for this idea.
              </p>
            ) : null}
            {comments.map((comment) => (
              <article
                key={comment.id}
                className="rounded-xl border border-slate-700/30 bg-[#0e1728] p-3"
              >
                <div className="flex items-center justify-between gap-2">
                  <p className="text-sm font-semibold text-slate-100">
                    {comment.author.fullName || comment.author.username}
                  </p>
                  <span className="text-[11px] text-slate-500">
                    {formatRelativeTime(comment.createdAt)}
                  </span>
                </div>
                <p className="mt-1 text-sm text-slate-300">{comment.content}</p>
              </article>
            ))}
          </div>
          <div className="mt-4 rounded-xl border border-slate-700/30 bg-[#0e1728] p-3">
            <p className="text-xs uppercase tracking-[0.14em] text-slate-400">
              Context
            </p>
            <div className="mt-2 space-y-2 text-sm text-slate-300">
              <p className="inline-flex items-center gap-2">
                <Users size={14} aria-hidden /> Team collaboration active
              </p>
              <p className="inline-flex items-center gap-2">
                <MessageSquare size={14} aria-hidden /> Discussion synced from
                board
              </p>
              <p className="inline-flex items-center gap-2">
                <CalendarDays size={14} aria-hidden /> Timeline ready for
                planning
              </p>
            </div>
          </div>
        </aside>
      </div>
    </section>
  );
}

function formatRelativeTime(timestamp: string): string {
  const delta = Date.now() - new Date(timestamp).getTime();
  if (!Number.isFinite(delta) || delta < 0) return "just now";
  const minutes = Math.floor(delta / 60000);
  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

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
