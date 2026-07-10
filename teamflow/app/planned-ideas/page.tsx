"use client";

import { useSearchParams } from "next/navigation";
import { usePlannedIdeas } from "@/app/planned-ideas/usePlannedIdeas";
import { IdeaListPanel } from "@/app/planned-ideas/components/ideaListPanel";
import { IdeaDetailPanel } from "@/app/planned-ideas/components/ideaDetailPanel";
import { DiscussionPanel } from "@/app/planned-ideas/components/discussionPanel";

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
    selectedIdeaView,
    plannedGuideSections,
    teamPhotos,
    handleTeamPhotoUpload,
    handlePostComment,
    handlePostReply,
    handleDeleteComment,
  } = usePlannedIdeas(selectedIdeaFromQuery);

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
      </div>
      <div className="mx-auto grid max-w-425 gap-4 lg:grid-cols-[320px_minmax(0,1fr)_340px]">
        <IdeaListPanel
          ideas={ideas}
          selectedIdeaId={selectedIdeaId}
          loading={loading}
          error={error}
          onSelectIdea={setSelectedIdeaId}
        />

        <IdeaDetailPanel
          selectedIdeaView={selectedIdeaView}
          plannedGuideSections={plannedGuideSections}
          teamPhotos={teamPhotos}
          uploadingPhoto={uploadingPhoto}
          photoError={photoError}
          onTeamPhotoUpload={handleTeamPhotoUpload}
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
          onDeleteComment={handleDeleteComment}
        />
      </div>
    </section>
  );
}
