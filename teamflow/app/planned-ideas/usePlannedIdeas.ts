import { useEffect, useMemo, useState } from "react";
import {
  addTeamPhoto,
  createIdeaComment,
  getIdeaById,
  getIdeaComments,
  getIdeas,
  type IdeaCommentDto,
  type IdeaResponseDto,
  type TeamPhotoDto,
} from "@/src/infrastructure/api/ideas/client";
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
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [photoError, setPhotoError] = useState("");

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

  const selectedIdeaView = selectedIdeaDetails
    ? toPlannedIdeaCard(selectedIdeaDetails)
    : selectedIdea;

  const plannedGuideSections = useMemo(() => {
    if (!selectedIdeaView?.summary) return [];

    return selectedIdeaView.summary
      .split(
        /\n(?=\d+\.\s|#{1,3}\s|[A-Z][A-Za-z\s/]+:|[^\n]+🎯|[^\n]+✨|[^\n]+📍|[^\n]+🍽️|[^\n]+🎵|[^\n]+🎨|[^\n]+✅)/,
      )
      .map((section) => section.trim())
      .filter(Boolean);
  }, [selectedIdeaView?.summary]);

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
    uploadingPhoto,
    photoError,
    selectedIdeaView,
    plannedGuideSections,
    teamPhotos,
    handleTeamPhotoUpload,
    handlePostComment,
  };
}
