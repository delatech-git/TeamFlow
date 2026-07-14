"use client";

import { useState } from "react";
import { CornerDownRight, SmilePlus, Trash2 } from "lucide-react";
import type { IdeaCommentDto } from "@/src/infrastructure/api/ideas/client";

const QUICK_REACTIONS = ["👍", "❤️", "😂", "😮", "😢", "🙏"];

function CommentReactions({
  comment,
  currentUserId,
  onToggleReaction,
}: {
  comment: IdeaCommentDto;
  currentUserId: string | null;
  onToggleReaction: (commentId: string, emoji: string) => void;
}) {
  const [pickerOpen, setPickerOpen] = useState(false);

  const grouped = comment.reactions.reduce<
    Record<string, IdeaCommentDto["reactions"]>
  >((acc, reaction) => {
    (acc[reaction.emoji] ??= []).push(reaction);
    return acc;
  }, {});

  const pick = (emoji: string) => {
    onToggleReaction(comment.id, emoji);
    setPickerOpen(false);
  };

  return (
    <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
      {Object.entries(grouped).map(([emoji, reactions]) => {
        const mine = reactions.some((r) => r.user.id === currentUserId);
        return (
          <button
            key={emoji}
            type="button"
            onClick={() => pick(emoji)}
            title={reactions
              .map((r) => r.user.fullName || r.user.username)
              .join(", ")}
            className={[
              "flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs transition",
              mine
                ? "border-cyan-400/60 bg-cyan-500/20 text-cyan-100"
                : "border-slate-700/50 bg-[#081120] text-slate-300 hover:border-slate-600",
            ].join(" ")}
          >
            <span>{emoji}</span>
            <span>{reactions.length}</span>
          </button>
        );
      })}

      <div className="relative">
        <button
          type="button"
          onClick={() => setPickerOpen((prev) => !prev)}
          aria-label="Add reaction"
          className="flex items-center justify-center rounded-full border border-slate-700/50 bg-[#081120] p-1 text-slate-400 transition hover:border-slate-600 hover:text-slate-200"
        >
          <SmilePlus size={13} aria-hidden />
        </button>

        {pickerOpen ? (
          <div className="absolute bottom-full left-0 z-10 mb-1 flex gap-1 rounded-full border border-slate-700/50 bg-[#0e1728] p-1 shadow-lg">
            {QUICK_REACTIONS.map((emoji) => (
              <button
                key={emoji}
                type="button"
                onClick={() => pick(emoji)}
                className="rounded-full p-1 text-sm transition hover:bg-slate-700/50"
              >
                {emoji}
              </button>
            ))}
          </div>
        ) : null}
      </div>
    </div>
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

function authorName(author: IdeaCommentDto["author"]): string {
  return author.fullName || author.username;
}

function CommentAvatar({
  name,
  size = "md",
}: {
  name: string;
  size?: "md" | "sm";
}) {
  return (
    <span
      className={[
        "flex shrink-0 items-center justify-center rounded-full border border-cyan-300/30 bg-cyan-500/15 font-semibold text-cyan-200",
        size === "md" ? "h-8 w-8 text-xs" : "h-6 w-6 text-[11px]",
      ].join(" ")}
      aria-hidden
    >
      {name.slice(0, 1).toUpperCase()}
    </span>
  );
}

function DeleteCommentButton({
  onDelete,
  isDeleting,
}: {
  onDelete: () => void;
  isDeleting: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onDelete}
      disabled={isDeleting}
      aria-label="Delete comment"
      className="shrink-0 text-slate-500 transition hover:text-red-300 disabled:cursor-not-allowed disabled:opacity-50"
    >
      <Trash2 size={13} aria-hidden />
    </button>
  );
}

function CommentReplyForm({
  onSubmit,
  onCancel,
  posting,
}: {
  onSubmit: (content: string) => void;
  onCancel: () => void;
  posting: boolean;
}) {
  const [draft, setDraft] = useState("");

  return (
    <div className="mt-2 rounded-lg border border-slate-700/40 bg-[#081120] p-2">
      <textarea
        autoFocus
        value={draft}
        onChange={(event) => setDraft(event.target.value)}
        placeholder="Write a reply..."
        className="min-h-14 w-full resize-none bg-transparent text-sm text-slate-200 outline-none placeholder:text-slate-500"
      />
      <div className="flex justify-end gap-2 border-t border-slate-700/40 pt-1.5">
        <button
          type="button"
          onClick={onCancel}
          className="rounded-lg px-2.5 py-1 text-xs text-slate-400 hover:text-slate-200"
        >
          Cancel
        </button>
        <button
          type="button"
          disabled={posting || draft.trim().length === 0}
          onClick={() => onSubmit(draft)}
          className="rounded-lg border border-cyan-400/35 bg-cyan-500/15 px-2.5 py-1 text-xs font-semibold text-cyan-100 disabled:cursor-not-allowed disabled:opacity-45"
        >
          {posting ? "Posting..." : "Reply"}
        </button>
      </div>
    </div>
  );
}

function CommentItem({
  comment,
  replies,
  isReplyOpen,
  onToggleReply,
  onSubmitReply,
  postingReply,
  canDeleteComment,
  deletingCommentId,
  onDeleteComment,
  currentUserId,
  onToggleReaction,
}: {
  comment: IdeaCommentDto;
  replies: IdeaCommentDto[];
  isReplyOpen: boolean;
  onToggleReply: () => void;
  onSubmitReply: (content: string) => void;
  postingReply: boolean;
  canDeleteComment: (comment: IdeaCommentDto) => boolean;
  deletingCommentId: string | null;
  onDeleteComment: (commentId: string) => void;
  currentUserId: string | null;
  onToggleReaction: (commentId: string, emoji: string) => void;
}) {
  const name = authorName(comment.author);

  return (
    <article className="rounded-xl border border-slate-700/30 bg-[#0e1728] p-3">
      <div className="flex gap-2.5">
        <CommentAvatar name={name} />
        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between gap-2">
            <p className="truncate text-sm font-semibold text-slate-100">
              {name}
            </p>
            <div className="flex shrink-0 items-center gap-2">
              <span className="text-[11px] text-slate-500">
                {formatRelativeTime(comment.createdAt)}
              </span>
              {canDeleteComment(comment) ? (
                <DeleteCommentButton
                  onDelete={() => onDeleteComment(comment.id)}
                  isDeleting={deletingCommentId === comment.id}
                />
              ) : null}
            </div>
          </div>
          <p className="mt-0.5 text-sm leading-6 text-slate-300">
            {comment.content}
          </p>
          <CommentReactions
            comment={comment}
            currentUserId={currentUserId}
            onToggleReaction={onToggleReaction}
          />
          <button
            type="button"
            onClick={onToggleReply}
            className={[
              "mt-1 inline-flex items-center gap-1 text-xs font-semibold transition",
              isReplyOpen
                ? "text-cyan-200"
                : "text-cyan-300/70 hover:text-cyan-200",
            ].join(" ")}
          >
            <CornerDownRight size={13} aria-hidden />
            Reply
          </button>

          {isReplyOpen ? (
            <CommentReplyForm
              onSubmit={onSubmitReply}
              onCancel={onToggleReply}
              posting={postingReply}
            />
          ) : null}

          {replies.length > 0 ? (
            <div className="mt-3 space-y-3 border-l border-cyan-400/15 pl-3">
              {replies.map((reply) => {
                const replyName = authorName(reply.author);
                return (
                  <div key={reply.id} className="flex gap-2">
                    <CommentAvatar name={replyName} size="sm" />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-2">
                        <p className="truncate text-xs font-semibold text-slate-100">
                          {replyName}
                        </p>
                        <div className="flex shrink-0 items-center gap-2">
                          <span className="text-[10px] text-slate-500">
                            {formatRelativeTime(reply.createdAt)}
                          </span>
                          {canDeleteComment(reply) ? (
                            <DeleteCommentButton
                              onDelete={() => onDeleteComment(reply.id)}
                              isDeleting={deletingCommentId === reply.id}
                            />
                          ) : null}
                        </div>
                      </div>
                      <p className="mt-0.5 text-sm leading-6 text-slate-300">
                        {reply.content}
                      </p>
                      <CommentReactions
                        comment={reply}
                        currentUserId={currentUserId}
                        onToggleReaction={onToggleReaction}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          ) : null}
        </div>
      </div>
    </article>
  );
}

export function DiscussionPanel({
  commentDraft,
  onCommentDraftChange,
  onPostComment,
  postingComment,
  postingReplyId,
  onPostReply,
  selectedIdeaId,
  loadingDetails,
  comments,
  currentUserId,
  isAdmin,
  deletingCommentId,
  onDeleteComment,
  onToggleReaction,
}: {
  commentDraft: string;
  onCommentDraftChange: (value: string) => void;
  onPostComment: () => void;
  postingComment: boolean;
  postingReplyId: string | null;
  onPostReply: (parentId: string, content: string) => Promise<unknown>;
  selectedIdeaId: string | null;
  loadingDetails: boolean;
  comments: IdeaCommentDto[];
  currentUserId: string | null;
  isAdmin: boolean;
  deletingCommentId: string | null;
  onDeleteComment: (commentId: string) => void;
  onToggleReaction: (commentId: string, emoji: string) => void;
}) {
  const [openReplyId, setOpenReplyId] = useState<string | null>(null);
  const topLevelComments = comments.filter((comment) => !comment.parentId);
  const canDeleteComment = (comment: IdeaCommentDto) =>
    isAdmin || (currentUserId !== null && comment.author.id === currentUserId);

  return (
    <aside className="rounded-2xl border border-cyan-400/10 bg-[#0b1424] p-3 shadow-[0_20px_60px_rgba(0,0,0,0.4)]">
      <div className="flex items-center justify-between border-b border-slate-700/40 pb-3">
        <p className="text-xs uppercase tracking-[0.16em] text-cyan-300/80">
          Discussion
        </p>
        {comments.length > 0 ? (
          <span className="rounded-full border border-cyan-300/30 px-2 py-0.5 text-xs text-cyan-200">
            {comments.length}
          </span>
        ) : null}
      </div>
      <div className="border-b border-slate-700/40 pb-3 pt-3">
        <textarea
          value={commentDraft}
          onChange={(event) => onCommentDraftChange(event.target.value)}
          placeholder="Write a comment..."
          className="min-h-21 w-full resize-none rounded-xl border border-slate-700/50 bg-[#081120] px-3 py-2 text-sm text-slate-200 outline-none placeholder:text-slate-500"
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
        {topLevelComments.map((comment) => (
          <CommentItem
            key={comment.id}
            comment={comment}
            replies={comments.filter((reply) => reply.parentId === comment.id)}
            isReplyOpen={openReplyId === comment.id}
            onToggleReply={() =>
              setOpenReplyId((prev) => (prev === comment.id ? null : comment.id))
            }
            onSubmitReply={async (content) => {
              const created = await onPostReply(comment.id, content);
              if (created) setOpenReplyId(null);
            }}
            postingReply={postingReplyId === comment.id}
            canDeleteComment={canDeleteComment}
            deletingCommentId={deletingCommentId}
            onDeleteComment={onDeleteComment}
            currentUserId={currentUserId}
            onToggleReaction={onToggleReaction}
          />
        ))}
      </div>
    </aside>
  );
}
