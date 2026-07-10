import type { IdeaCommentDto } from "@/src/infrastructure/api/ideas/client";

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

export function DiscussionPanel({
  commentDraft,
  onCommentDraftChange,
  onPostComment,
  postingComment,
  selectedIdeaId,
  loadingDetails,
  comments,
}: {
  commentDraft: string;
  onCommentDraftChange: (value: string) => void;
  onPostComment: () => void;
  postingComment: boolean;
  selectedIdeaId: string | null;
  loadingDetails: boolean;
  comments: IdeaCommentDto[];
}) {
  return (
    <aside className="rounded-2xl border border-cyan-400/10 bg-[#0b1424] p-3 shadow-[0_20px_60px_rgba(0,0,0,0.4)]">
      <div className="border-b border-slate-700/40 pb-3">
        <p className="text-xs uppercase tracking-[0.16em] text-cyan-300/80">
          Discussion
        </p>
        <textarea
          value={commentDraft}
          onChange={(event) => onCommentDraftChange(event.target.value)}
          placeholder="Write a comment..."
          className="mt-2 min-h-21 w-full resize-none rounded-xl border border-slate-700/50 bg-[#081120] px-3 py-2 text-sm text-slate-200 outline-none placeholder:text-slate-500"
        />
        <button
          type="button"
          onClick={onPostComment}
          disabled={
            postingComment || !selectedIdeaId || commentDraft.trim().length === 0
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
    </aside>
  );
}
