"use client";

import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { CalendarDays, MessageSquare, Search, Share2, Sparkles, Users } from "lucide-react";
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
    summary: dto.shortDescription,
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
  const [selectedIdeaId, setSelectedIdeaId] = useState<string | null>(selectedIdeaFromQuery);
  const [loading, setLoading] = useState(true);
  const [loadingDetails, setLoadingDetails] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedIdeaDetails, setSelectedIdeaDetails] = useState<IdeaResponseDto | null>(null);
  const [comments, setComments] = useState<IdeaCommentDto[]>([]);
  const [commentDraft, setCommentDraft] = useState("");
  const [postingComment, setPostingComment] = useState(false);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      try {
        const planned = await getIdeas("PLANNED");
        const fallback = planned.length === 0 ? await getIdeas() : planned;
        if (cancelled) return;
        const mapped = fallback.map(toPlannedIdeaCard);
        setIdeas(mapped);
        setSelectedIdeaId((prev) => prev ?? selectedIdeaFromQuery ?? mapped[0]?.id ?? null);
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

  const selectedIdeaView = selectedIdeaDetails ? toPlannedIdeaCard(selectedIdeaDetails) : selectedIdea;
  const parsedBoardState = selectedIdeaDetails ? ideaResponseToDiscoverIdea(selectedIdeaDetails).boardState : null;

  const keyHighlights = useMemo(() => {
    if (parsedBoardState?.summaryPreview?.trim()) {
      return parsedBoardState.summaryPreview
        .split(/[.!?]/)
        .map((part) => part.trim())
        .filter((part) => part.length > 0)
        .slice(0, 6);
    }
    if (!selectedIdeaView?.summary) return [];
    return selectedIdeaView.summary
      .split(/[.!?]/)
      .map((part) => part.trim())
      .filter((part) => part.length > 0)
      .slice(0, 6);
  }, [parsedBoardState?.summaryPreview, selectedIdeaView?.summary]);

  const pinnedNotes = useMemo(() => {
    if (!parsedBoardState) return [];
    return parsedBoardState.notes.filter((note) => parsedBoardState.pinnedNoteIds.includes(note.id));
  }, [parsedBoardState]);

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
      window.alert(err instanceof Error ? err.message : "Could not post comment.");
    } finally {
      setPostingComment(false);
    }
  };

  return (
    <section className="min-h-screen bg-[#050b16] px-4 pb-8 pt-25 text-slate-100 sm:px-6 lg:px-8">
      <div className="mx-auto mb-4 flex max-w-[1700px] items-center justify-between gap-3 rounded-2xl border border-cyan-400/10 bg-[#0b1424] px-4 py-3">
        <div>
          <p className="text-xs uppercase tracking-[0.18em] text-cyan-300/80">TeamTide</p>
          <h1 className="mt-1 text-lg font-semibold text-white">Planned Ideas</h1>
        </div>
        <div className="hidden items-center gap-2 rounded-xl border border-slate-700/50 bg-[#081120] px-3 py-2 text-sm text-slate-400 md:flex">
          <Search size={14} aria-hidden />
          Search ideas, events, people...
        </div>
      </div>
      <div className="mx-auto grid max-w-[1700px] gap-4 lg:grid-cols-[320px_minmax(0,1fr)_340px]">
        <aside className="rounded-2xl border border-cyan-400/10 bg-[#0b1424] p-3 shadow-[0_20px_60px_rgba(0,0,0,0.4)]">
          <div className="flex items-center justify-between gap-3 border-b border-slate-700/40 pb-3">
            <div>
              <p className="text-xs uppercase tracking-[0.18em] text-cyan-300/80">Planned ideas</p>
              <h1 className="mt-1 text-lg font-semibold">Board decisions</h1>
            </div>
            <span className="rounded-full border border-cyan-300/30 px-2 py-0.5 text-xs text-cyan-200">{ideas.length}</span>
          </div>
          <div className="mt-3 flex items-center gap-2 rounded-xl border border-slate-700/50 bg-[#081120] px-3 py-2 text-sm text-slate-400">
            <Search size={14} aria-hidden />
            Search planned ideas...
          </div>
          <div className="mt-3 space-y-2">
            {loading ? <p className="px-2 py-3 text-sm text-slate-400">Loading planned ideas...</p> : null}
            {error ? <p className="px-2 py-3 text-sm text-red-300">{error}</p> : null}
            {!loading && !error && ideas.length === 0 ? (
              <p className="px-2 py-3 text-sm text-slate-400">No planned ideas yet. Generate AI decisions from an idea board first.</p>
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
                  <p className="line-clamp-1 text-sm font-semibold text-slate-100">{idea.title}</p>
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
                <h2 className="mt-3 text-2xl font-bold text-white">{selectedIdeaView.title}</h2>
                <p className="mt-1 text-sm text-slate-400">
                  Event Concept • Created {selectedIdeaView.createdAtLabel} • Updated {selectedIdeaView.updatedLabel}
                </p>
                <p className="mt-4 text-sm text-slate-200/90">{selectedIdeaView.summary}</p>

                <div className="mt-4 grid gap-2 rounded-xl border border-slate-700/40 bg-[#08101d] p-3 sm:grid-cols-4">
                  <Metric label="Overall Progress" value="75%" />
                  <Metric label="Priority" value="High" />
                  <Metric label="Event Date" value="Jun 15, 2026" />
                  <Metric label="Team" value={selectedIdeaView.owner} />
                </div>

                <div className="mt-4 flex flex-wrap gap-2">
                  <button className="rounded-lg border border-slate-600/60 bg-[#111c2f] px-3 py-1.5 text-sm text-slate-200">Edit plan</button>
                  <button className="inline-flex items-center gap-1 rounded-lg border border-slate-600/60 bg-[#111c2f] px-3 py-1.5 text-sm text-slate-200">
                    <Share2 size={14} aria-hidden />
                    Share
                  </button>
                </div>
              </div>

              <div className="mt-4 rounded-2xl border border-slate-700/40 bg-[#0a1221] p-4">
                <p className="text-sm font-semibold text-slate-100">Key points from idea board</p>
                <div className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                  {(keyHighlights.length > 0 ? keyHighlights : ["No generated highlights yet."]).map((point, index) => (
                    <article key={`${point}-${index}`} className="rounded-xl border border-cyan-500/20 bg-cyan-500/5 p-3 text-sm text-slate-200">
                      {point}
                    </article>
                  ))}
                </div>
                {pinnedNotes.length > 0 ? (
                  <div className="mt-4">
                    <p className="text-xs uppercase tracking-[0.14em] text-slate-400">Pinned notes used for summary</p>
                    <div className="mt-2 grid gap-2 sm:                   ">
                      {pinnedNotes.slice(0, 6).map((note) => (
                        <article key={note.id} className="rounded-lg border border-slate-700/30 bg-[#0b1628] p-2.5 text-xs text-slate-300">
                          <p className="line-clamp-3">{note.text || "Empty sticky note"}</p>
                          <p className="mt-1 text-[10px] uppercase tracking-widest text-cyan-300/80">{note.author}</p>
                        </article>
                      ))}
                    </div>
                  </div>
                ) : null}
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
            <p className="text-xs uppercase tracking-[0.16em] text-cyan-300/80">Discussion</p>
            <textarea
              value={commentDraft}
              onChange={(event) => setCommentDraft(event.target.value)}
              placeholder="Write a comment..."
              className="mt-2 min-h-[84px] w-full resize-none rounded-xl border border-slate-700/50 bg-[#081120] px-3 py-2 text-sm text-slate-200 outline-none placeholder:text-slate-500"
            />
            <button
              type="button"
              onClick={handlePostComment}
              disabled={postingComment || !selectedIdeaId || commentDraft.trim().length === 0}
              className="mt-2 w-full rounded-lg border border-cyan-400/35 bg-cyan-500/15 px-3 py-2 text-sm font-semibold text-cyan-100 disabled:cursor-not-allowed disabled:opacity-45"
            >
              {postingComment ? "Posting..." : "Post comment"}
            </button>
          </div>
          <div className="mt-3 space-y-3">
            {loadingDetails ? <p className="text-sm text-slate-400">Loading discussion...</p> : null}
            {!loadingDetails && comments.length === 0 ? (
              <p className="text-sm text-slate-400">No comments yet for this idea.</p>
            ) : null}
            {comments.map((comment) => (
              <article key={comment.id} className="rounded-xl border border-slate-700/30 bg-[#0e1728] p-3">
                <div className="flex items-center justify-between gap-2">
                  <p className="text-sm font-semibold text-slate-100">{comment.author.fullName || comment.author.username}</p>
                  <span className="text-[11px] text-slate-500">{formatRelativeTime(comment.createdAt)}</span>
                </div>
                <p className="mt-1 text-sm text-slate-300">{comment.content}</p>
              </article>
            ))}
          </div>
          <div className="mt-4 rounded-xl border border-slate-700/30 bg-[#0e1728] p-3">
            <p className="text-xs uppercase tracking-[0.14em] text-slate-400">Context</p>
            <div className="mt-2 space-y-2 text-sm text-slate-300">
              <p className="inline-flex items-center gap-2"><Users size={14} aria-hidden /> Team collaboration active</p>
              <p className="inline-flex items-center gap-2"><MessageSquare size={14} aria-hidden /> Discussion synced from board</p>
              <p className="inline-flex items-center gap-2"><CalendarDays size={14} aria-hidden /> Timeline ready for planning</p>
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
