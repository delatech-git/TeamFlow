"use client";

import { useSearchParams } from "next/navigation";
import { BackToDashboardLink } from "@/app/__components/layout/backToDashboardLink";
import { usePlannedIdeas } from "@/app/planned-ideas/usePlannedIdeas";
import { IdeaListPanel } from "@/app/planned-ideas/components/ideaListPanel";
import { IdeaDetailPanel } from "@/app/planned-ideas/components/ideaDetailPanel";
import { DiscussionPanel } from "@/app/planned-ideas/components/discussionPanel";
import { RatingPanel } from "@/app/planned-ideas/components/ratingPanel";

export default function PlannedIdeasPage() {
  const searchParams = useSearchParams();
  const selectedIdeaFromQuery = searchParams.get("ideaId");
  const {
    ideas,
    selectedIdeaId,
    setSelectedIdeaId,
    loading,
    loadingDetails,
    error,
    comments,
    commentDraft,
    setCommentDraft,
    postingComment,
    postingReplyId,
    uploadingPhoto,
    photoError,
    currentUser,
    deletingCommentId,
    editingCommentId,
    selectedIdeaView,
    teamPhotos,
    savingGuide,
    guideError,
    ratings,
    submittingRating,
    handleTeamPhotoUpload,
    handleSavePlannedGuide,
    handlePostComment,
    handlePostReply,
    handleDeleteComment,
    handleEditComment,
    handleToggleReaction,
    handleRateIdea,
  } = usePlannedIdeas(selectedIdeaFromQuery);

  return (
    <section className="min-h-screen bg-[#050b16] px-4 pb-8 pt-25 text-slate-100 sm:px-6 lg:px-8">
      <div className="mx-auto mb-4 flex max-w-425 flex-wrap items-center justify-between gap-3 rounded-2xl border border-cyan-400/10 bg-[#0b1424] px-4 py-3">
        <div>
          <p className="text-xs uppercase tracking-[0.18em] text-cyan-300/80">
            TeamTide
          </p>
          <h1 className="mt-1 text-lg font-semibold text-white">
            Planned Ideas
          </h1>
        </div>

        <BackToDashboardLink />
      </div>
      <div className="mx-auto grid max-w-425 gap-4 lg:grid-cols-[260px_minmax(0,1fr)_300px]">
        <IdeaListPanel
          ideas={ideas}
          selectedIdeaId={selectedIdeaId}
          loading={loading}
          error={error}
          onSelectIdea={setSelectedIdeaId}
        />

        <IdeaDetailPanel
          selectedIdeaView={selectedIdeaView}
          teamPhotos={teamPhotos}
          uploadingPhoto={uploadingPhoto}
          photoError={photoError}
          onTeamPhotoUpload={handleTeamPhotoUpload}
          canEditGuide={currentUser?.role === "ADMIN"}
          savingGuide={savingGuide}
          guideError={guideError}
          onSavePlannedGuide={handleSavePlannedGuide}
        />

        <div className="space-y-4">
          <RatingPanel
            ratings={ratings}
            currentUserId={currentUser?.id ?? null}
            submitting={submittingRating}
            onRate={handleRateIdea}
          />

          <DiscussionPanel
            commentDraft={commentDraft}
            onCommentDraftChange={setCommentDraft}
            onPostComment={handlePostComment}
            postingComment={postingComment}
            postingReplyId={postingReplyId}
            onPostReply={handlePostReply}
            selectedIdeaId={selectedIdeaId}
            loadingDetails={loadingDetails}
            comments={comments}
            currentUserId={currentUser?.id ?? null}
            isAdmin={currentUser?.role === "ADMIN"}
            deletingCommentId={deletingCommentId}
            editingCommentId={editingCommentId}
            onDeleteComment={handleDeleteComment}
            onEditComment={handleEditComment}
            onToggleReaction={handleToggleReaction}
          />
        </div>
      </div>
    </section>
  );
}
