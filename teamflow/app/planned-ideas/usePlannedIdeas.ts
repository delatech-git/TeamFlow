import { useEffect, useState } from "react";
import {
  addTeamPhoto,
  createIdeaComment,
  deleteIdeaComment,
  getIdeaById,
  getIdeaComments,
  getIdeaRatings,
  getIdeas,
  rateIdea,
  toggleCommentReaction,
  updateIdeaComment,
  updatePlannedGuide,
  type IdeaCommentDto,
  type IdeaResponseDto,
  type RatingsSummaryDto,
  type TeamPhotoDto,
} from "@/src/infrastructure/api/ideas/client";
import { fetchCurrentUser } from "@/src/infrastructure/api/auth/client";
import { getAccessToken } from "@/src/infrastructure/auth/session";
import { toPlannedIdeaCard } from "@/app/planned-ideas/types";

export function usePlannedIdeas(selectedIdeaFromQuery: string | null) {
  const [ideas, setIdeas] = useState<ReturnType<typeof toPlannedIdeaCard>[]>([]);
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
  const [postingReplyId, setPostingReplyId] = useState<string | null>(null);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [photoError, setPhotoError] = useState("");
  const [currentUser, setCurrentUser] = useState<{ id: string; role: string } | null>(
    null,
  );
  const [deletingCommentId, setDeletingCommentId] = useState<string | null>(null);
  const [editingCommentId, setEditingCommentId] = useState<string | null>(null);
  const [savingGuide, setSavingGuide] = useState(false);
  const [guideError, setGuideError] = useState("");
  const [ratings, setRatings] = useState<RatingsSummaryDto | null>(null);
  const [submittingRating, setSubmittingRating] = useState(false);

  useEffect(() => {
    if (!getAccessToken()) return;
    let cancelled = false;
    void (async () => {
      try {
        const me = await fetchCurrentUser();
        if (!cancelled) setCurrentUser({ id: me.id, role: me.role });
      } catch {
        if (!cancelled) setCurrentUser(null);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      try {
        const planned = await getIdeas("PLANNED");
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
      setRatings(null);
      return;
    }
    let cancelled = false;
    setLoadingDetails(true);
    void (async () => {
      try {
        const [idea, ideaComments, ideaRatings] = await Promise.all([
          getIdeaById(selectedIdeaId),
          getIdeaComments(selectedIdeaId),
          getIdeaRatings(selectedIdeaId),
        ]);
        if (cancelled) return;
        setSelectedIdeaDetails(idea);
        setComments(ideaComments);
        setRatings(ideaRatings);
      } catch {
        if (!cancelled) {
          setSelectedIdeaDetails(null);
          setComments([]);
          setRatings(null);
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

  const teamPhotos: TeamPhotoDto[] = selectedIdeaDetails?.teamPhotos ?? [];

  const handleTeamPhotoUpload = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file || !selectedIdeaId) return;

    setPhotoError("");

    if (!file.type.startsWith("image/")) {
      setPhotoError("Please choose an image file.");
      return;
    }

    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      setPhotoError("Image must be smaller than 5MB.");
      return;
    }

    if (!getAccessToken()) {
      window.alert("Please log in to upload a team photo.");
      return;
    }

    setUploadingPhoto(true);
    try {
      const uploaded = await addTeamPhoto(selectedIdeaId, file);
      setSelectedIdeaDetails((prev) =>
        prev
          ? { ...prev, teamPhotos: [uploaded, ...(prev.teamPhotos ?? [])] }
          : prev,
      );
    } catch (err) {
      setPhotoError(
        err instanceof Error ? err.message : "Could not upload photo.",
      );
    } finally {
      setUploadingPhoto(false);
    }
  };

  const handleSavePlannedGuide = async (summary: string) => {
    if (!selectedIdeaId) return false;
    setGuideError("");
    setSavingGuide(true);
    try {
      const updated = await updatePlannedGuide(selectedIdeaId, summary);
      setSelectedIdeaDetails((prev) =>
        prev ? { ...prev, plannedGuide: updated } : prev,
      );
      return true;
    } catch (err) {
      setGuideError(
        err instanceof Error ? err.message : "Could not save the planned guide.",
      );
      return false;
    } finally {
      setSavingGuide(false);
    }
  };

  const handleRateIdea = async (value: number) => {
    if (!selectedIdeaId) return;
    if (!getAccessToken()) {
      window.alert("Please log in to rate this idea.");
      return;
    }

    setSubmittingRating(true);
    try {
      await rateIdea(selectedIdeaId, value);
      const refreshed = await getIdeaRatings(selectedIdeaId);
      setRatings(refreshed);
    } catch (err) {
      window.alert(
        err instanceof Error ? err.message : "Could not save your rating.",
      );
    } finally {
      setSubmittingRating(false);
    }
  };

  const postComment = async (content: string, parentId?: string) => {
    if (!selectedIdeaId || !content.trim()) return;
    if (!getAccessToken()) {
      window.alert("Please log in to post a comment.");
      return;
    }
    try {
      const created = await createIdeaComment(selectedIdeaId, {
        content: content.trim(),
        parentId,
      });
      setComments((prev) => [...prev, created]);
      return created;
    } catch (err) {
      window.alert(
        err instanceof Error ? err.message : "Could not post comment.",
      );
      return null;
    }
  };

  const handlePostComment = async () => {
    setPostingComment(true);
    try {
      const created = await postComment(commentDraft);
      if (created) setCommentDraft("");
    } finally {
      setPostingComment(false);
    }
  };

  const handlePostReply = async (parentId: string, content: string) => {
    setPostingReplyId(parentId);
    try {
      return await postComment(content, parentId);
    } finally {
      setPostingReplyId(null);
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    if (!selectedIdeaId) return;
    if (!window.confirm("Delete this comment?")) return;

    setDeletingCommentId(commentId);
    try {
      await deleteIdeaComment(selectedIdeaId, commentId);
      setComments((prev) =>
        prev.filter(
          (comment) => comment.id !== commentId && comment.parentId !== commentId,
        ),
      );
    } catch (err) {
      window.alert(
        err instanceof Error ? err.message : "Could not delete comment.",
      );
    } finally {
      setDeletingCommentId(null);
    }
  };

  const handleEditComment = async (commentId: string, content: string) => {
    if (!selectedIdeaId || !content.trim()) return false;

    setEditingCommentId(commentId);
    try {
      const updated = await updateIdeaComment(
        selectedIdeaId,
        commentId,
        content.trim(),
      );
      setComments((prev) =>
        prev.map((comment) => (comment.id === commentId ? updated : comment)),
      );
      return true;
    } catch (err) {
      window.alert(
        err instanceof Error ? err.message : "Could not update comment.",
      );
      return false;
    } finally {
      setEditingCommentId(null);
    }
  };

  const handleToggleReaction = async (commentId: string, emoji: string) => {
    if (!getAccessToken()) {
      window.alert("Please log in to react to a comment.");
      return;
    }
    if (!currentUser) return;

    try {
      const reaction = await toggleCommentReaction(commentId, emoji);
      setComments((prev) =>
        prev.map((comment) => {
          if (comment.id !== commentId) return comment;
          const others = comment.reactions.filter(
            (r) => r.user.id !== currentUser.id,
          );
          return {
            ...comment,
            reactions: reaction ? [...others, reaction] : others,
          };
        }),
      );
    } catch (err) {
      window.alert(
        err instanceof Error ? err.message : "Could not react to comment.",
      );
    }
  };

  return {
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
  };
}
