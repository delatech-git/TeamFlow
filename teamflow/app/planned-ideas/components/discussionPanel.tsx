"use client";

import { useEffect, useState } from "react";
import { CornerDownRight, Pencil, SmilePlus, Trash2 } from "lucide-react";
import type { IdeaCommentDto } from "@/src/infrastructure/api/ideas/client";
import { hashAccent } from "@/app/planned-ideas/colorAccents";

const QUICK_REACTIONS = ["👍", "❤️", "😂", "😮", "😢", "🙏"];
const COMMENTS_PAGE_SIZE = 3;

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
        const pillAccent = hashAccent(emoji);
        return (
          <button
            key={emoji}
            type="button"
            onClick={() => pick(emoji)}
            title={reactions
              .map((r) => r.user.fullName || r.user.username)
              .join(", ")}
            className={[
              "flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-semibold text-white shadow-sm transition",
              pillAccent.solidBg,
              mine ? "ring-2 ring-white/70" : "",
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
  accentKey,
  avatarUrl,
  size = "md",
}: {
  name: string;
  accentKey: string;
  avatarUrl?: string | null;
  size?: "md" | "sm";
}) {
  const accent = hashAccent(accentKey);
  const sizeClass = size === "md" ? "h-8 w-8 text-xs" : "h-6 w-6 text-[11px]";

  if (avatarUrl) {
    return (
      <img
        src={avatarUrl}
        alt={name}
        className={`shrink-0 rounded-full object-cover shadow-md ${sizeClass}`}
      />
    );
  }

  return (
    <span
      className={[
        "flex shrink-0 items-center justify-center rounded-full font-semibold text-white shadow-md",
        accent.solidBg,
        sizeClass,
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

function EditCommentButton({ onEdit }: { onEdit: () => void }) {
  return (
    <button
      type="button"
      onClick={onEdit}
      aria-label="Edit comment"
      className="shrink-0 text-slate-500 transition hover:text-cyan-300"
    >
      <Pencil size={13} aria-hidden />
    </button>
  );
}

function CommentEditForm({
  initialContent,
  onSubmit,
  onCancel,
  saving,
}: {
  initialContent: string;
  onSubmit: (content: string) => void;
  onCancel: () => void;
  saving: boolean;
}) {
  const [draft, setDraft] = useState(initialContent);

  return (
    <div className="mt-1.5 rounded-lg border border-slate-700/40 bg-[#081120] p-2">
      <textarea
        autoFocus
        value={draft}
        onChange={(event) => setDraft(event.target.value)}
        className="min-h-14 w-full resize-none bg-transparent text-sm text-slate-200 outline-none"
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
          disabled={saving || draft.trim().length === 0}
          onClick={() => onSubmit(draft)}
          className="rounded-lg bg-linear-to-r from-blue-500 to-violet-600 px-2.5 py-1 text-xs font-semibold text-white shadow-[0_0_12px_rgba(139,92,246,0.3)] transition hover:shadow-[0_0_18px_rgba(139,92,246,0.45)] disabled:cursor-not-allowed disabled:opacity-45"
        >
          {saving ? "Saving..." : "Save"}
        </button>
      </div>
    </div>
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
          className="rounded-lg bg-linear-to-r from-blue-500 to-violet-600 px-2.5 py-1 text-xs font-semibold text-white shadow-[0_0_12px_rgba(139,92,246,0.3)] transition hover:shadow-[0_0_18px_rgba(139,92,246,0.45)] disabled:cursor-not-allowed disabled:opacity-45 disabled:hover:shadow-[0_0_12px_rgba(139,92,246,0.3)]"
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
  canEditComment,
  editingId,
  savingCommentId,
  onToggleEdit,
  onSubmitEdit,
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
  canEditComment: (comment: IdeaCommentDto) => boolean;
  editingId: string | null;
  savingCommentId: string | null;
  onToggleEdit: (commentId: string) => void;
  onSubmitEdit: (commentId: string, content: string) => void;
  currentUserId: string | null;
  onToggleReaction: (commentId: string, emoji: string) => void;
}) {
  const name = authorName(comment.author);
  const accent = hashAccent(comment.author.id);

  return (
    <article className={`rounded-xl border bg-[#0e1728] p-3 ${accent.border}`}>
      <div className="flex gap-2.5">
        <CommentAvatar
          name={name}
          accentKey={comment.author.id}
          avatarUrl={comment.author.avatarUrl}
        />
        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between gap-2">
            <p className="truncate text-sm font-semibold text-slate-100">
              {name}
            </p>
            <div className="flex shrink-0 items-center gap-2">
              <span className="text-[11px] text-slate-500">
                {formatRelativeTime(comment.createdAt)}
              </span>
              {canEditComment(comment) ? (
                <EditCommentButton onEdit={() => onToggleEdit(comment.id)} />
              ) : null}
              {canDeleteComment(comment) ? (
                <DeleteCommentButton
                  onDelete={() => onDeleteComment(comment.id)}
                  isDeleting={deletingCommentId === comment.id}
                />
              ) : null}
            </div>
          </div>
          {editingId === comment.id ? (
            <CommentEditForm
              initialContent={comment.content}
              onSubmit={(content) => onSubmitEdit(comment.id, content)}
              onCancel={() => onToggleEdit(comment.id)}
              saving={savingCommentId === comment.id}
            />
          ) : (
            <p className="mt-0.5 text-sm leading-6 text-slate-300">
              {comment.content}
            </p>
          )}
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
            <div className={`mt-3 space-y-3 border-l pl-3 ${accent.border}`}>
              {replies.map((reply) => {
                const replyName = authorName(reply.author);
                return (
                  <div key={reply.id} className="flex gap-2">
                    <CommentAvatar
                      name={replyName}
                      accentKey={reply.author.id}
                      avatarUrl={reply.author.avatarUrl}
                      size="sm"
                    />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-2">
                        <p className="truncate text-xs font-semibold text-slate-100">
                          {replyName}
                        </p>
                        <div className="flex shrink-0 items-center gap-2">
                          <span className="text-[10px] text-slate-500">
                            {formatRelativeTime(reply.createdAt)}
                          </span>
                          {canEditComment(reply) ? (
                            <EditCommentButton
                              onEdit={() => onToggleEdit(reply.id)}
                            />
                          ) : null}
                          {canDeleteComment(reply) ? (
                            <DeleteCommentButton
                              onDelete={() => onDeleteComment(reply.id)}
                              isDeleting={deletingCommentId === reply.id}
                            />
                          ) : null}
                        </div>
                      </div>
                      {editingId === reply.id ? (
                        <CommentEditForm
                          initialContent={reply.content}
                          onSubmit={(content) => onSubmitEdit(reply.id, content)}
                          onCancel={() => onToggleEdit(reply.id)}
                          saving={savingCommentId === reply.id}
                        />
                      ) : (
                        <p className="mt-0.5 text-sm leading-6 text-slate-300">
                          {reply.content}
                        </p>
                      )}
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
  editingCommentId,
  onDeleteComment,
  onEditComment,
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
  editingCommentId: string | null;
  onDeleteComment: (commentId: string) => void;
  onEditComment: (commentId: string, content: string) => Promise<boolean>;
  onToggleReaction: (commentId: string, emoji: string) => void;
}) {
  const [openReplyId, setOpenReplyId] = useState<string | null>(null);
  const [openEditId, setOpenEditId] = useState<string | null>(null);
  const [visibleCount, setVisibleCount] = useState(COMMENTS_PAGE_SIZE);
  const topLevelComments = comments.filter((comment) => !comment.parentId);
  const canDeleteComment = (comment: IdeaCommentDto) =>
    isAdmin || (currentUserId !== null && comment.author.id === currentUserId);
  const canEditComment = (comment: IdeaCommentDto) =>
    currentUserId !== null && comment.author.id === currentUserId;

  useEffect(() => {
    setVisibleCount(COMMENTS_PAGE_SIZE);
  }, [selectedIdeaId]);

  const visibleComments = topLevelComments.slice(0, visibleCount);
  const hasMore = visibleCount < topLevelComments.length;
  const isFullyExpanded =
    topLevelComments.length > COMMENTS_PAGE_SIZE && !hasMore;

  return (
    <aside className="rounded-2xl border border-cyan-400/25 bg-[#0b1424] p-3 shadow-[0_20px_60px_rgba(0,0,0,0.4)]">
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
          className="mt-2 w-full rounded-lg bg-linear-to-r from-blue-500 to-violet-600 px-3 py-2 text-sm font-semibold text-white shadow-[0_0_18px_rgba(139,92,246,0.35)] transition hover:-translate-y-0.5 hover:shadow-[0_0_26px_rgba(139,92,246,0.5)] disabled:cursor-not-allowed disabled:opacity-45 disabled:hover:translate-y-0 disabled:hover:shadow-[0_0_18px_rgba(139,92,246,0.35)]"
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
        {visibleComments.map((comment) => (
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
            canEditComment={canEditComment}
            editingId={openEditId}
            savingCommentId={editingCommentId}
            onToggleEdit={(commentId) =>
              setOpenEditId((prev) => (prev === commentId ? null : commentId))
            }
            onSubmitEdit={async (commentId, content) => {
              const saved = await onEditComment(commentId, content);
              if (saved) setOpenEditId(null);
            }}
            currentUserId={currentUserId}
            onToggleReaction={onToggleReaction}
          />
        ))}
        {hasMore ? (
          <button
            type="button"
            onClick={() =>
              setVisibleCount((prev) => prev + COMMENTS_PAGE_SIZE)
            }
            className="w-full rounded-lg border border-slate-700/50 py-1.5 text-xs font-semibold text-cyan-300/80 transition hover:border-cyan-400/40 hover:text-cyan-200"
          >
            Load more
          </button>
        ) : null}
        {isFullyExpanded ? (
          <button
            type="button"
            onClick={() => setVisibleCount(COMMENTS_PAGE_SIZE)}
            className="w-full rounded-lg border border-slate-700/50 py-1.5 text-xs font-semibold text-cyan-300/80 transition hover:border-cyan-400/40 hover:text-cyan-200"
          >
            Show less
          </button>
        ) : null}
      </div>
    </aside>
  );
}
