import { proxyDelete, proxyGetJson, proxyPatchFormData, proxyPatchJson, proxyPostFormData, proxyPostJson, proxyPutJson } from "../core/fetch-client";
import { getAccessToken } from "../../auth/session";
import { commentReactionsPath, ideaCommentDetailPath, ideaCommentsPath, ideaCoverImagePath, ideaPlannedGuidePath, ideaRatingsPath, ideaTeamPhotosPath, ideasBoardPath, ideasCreatePath, ideasDetailPath, ideasListPath } from "./paths";
import type {
  CommentReactionDto,
  CreateIdeaBody,
  CreateIdeaCommentBody,
  IdeaCommentDto,
  IdeaResponseDto,
  PlannedGuideDto,
  RatingsSummaryDto,
  SaveIdeaBoardBody,
  TeamPhotoDto,
} from "./types";

export type {
  CommentReactionDto,
  CreateIdeaBody,
  IdeaCommentDto,
  IdeaResponseDto,
  PlannedGuideDto,
  RatingsSummaryDto,
  TeamPhotoDto,
};

export async function getIdeas(
  status?: string,
  search?: string,
): Promise<IdeaResponseDto[]> {
  return proxyGetJson<IdeaResponseDto[]>(ideasListPath(status, search), {
    errorMessage: "Failed to fetch ideas",
  });
}

export async function createIdea(
  body: CreateIdeaBody,
): Promise<IdeaResponseDto> {
  const token = getAccessToken();

  if (!token) {
    throw new Error("Not authenticated");
  }

  const formData = new FormData();

  formData.append("title", body.title);
  formData.append("shortDescription", body.shortDescription);
  formData.append("tagIds", JSON.stringify(body.tagIds ?? []));

  if (body.coverImageFile) {
    formData.append("coverImage", body.coverImageFile);
  }

  return proxyPostFormData<IdeaResponseDto>(ideasCreatePath(), formData, {
    errorMessage: "Could not create idea",
    init: { headers: { Authorization: `Bearer ${token}` } },
  });
}

export async function updateIdeaCoverImage(
  id: string,
  coverImage: File,
): Promise<IdeaResponseDto> {
  const token = getAccessToken();
  if (!token) {
    throw new Error("Not authenticated");
  }

  const formData = new FormData();
  formData.append("coverImage", coverImage);

  return proxyPatchFormData<IdeaResponseDto>(ideaCoverImagePath(id), formData, {
    errorMessage: "Could not update the cover image",
    init: { headers: { Authorization: `Bearer ${token}` } },
  });
}

export async function getIdeaById(id: string): Promise<IdeaResponseDto> {
  return proxyGetJson<IdeaResponseDto>(ideasDetailPath(id), {
    errorMessage: "Failed to fetch idea",
  });
}

export async function deleteIdea(id: string): Promise<void> {
  const token = getAccessToken();
  if (!token) {
    throw new Error("Not authenticated");
  }
  return proxyDelete(ideasDetailPath(id), {
    errorMessage: "Could not delete idea",
    init: { headers: { Authorization: `Bearer ${token}` } },
  });
}

export async function saveIdeaBoard(
  id: string,
  body: SaveIdeaBoardBody,
): Promise<void> {
  const token = getAccessToken();
  if (!token) {
    throw new Error("Not authenticated");
  }
  await proxyPutJson<{ success: boolean }, SaveIdeaBoardBody>(
    ideasBoardPath(id),
    body,
    {
      errorMessage: "Could not save idea board",
      init: { headers: { Authorization: `Bearer ${token}` } },
    },
  );
}

export async function updatePlannedGuide(
  id: string,
  summary: string,
): Promise<PlannedGuideDto> {
  const token = getAccessToken();
  if (!token) {
    throw new Error("Not authenticated");
  }
  return proxyPutJson<PlannedGuideDto, { summary: string }>(
    ideaPlannedGuidePath(id),
    { summary },
    {
      errorMessage: "Could not save the planned guide",
      init: { headers: { Authorization: `Bearer ${token}` } },
    },
  );
}

export async function getIdeaRatings(id: string): Promise<RatingsSummaryDto> {
  return proxyGetJson<RatingsSummaryDto>(ideaRatingsPath(id), {
    errorMessage: "Failed to fetch ratings",
  });
}

export async function rateIdea(
  id: string,
  value: number,
): Promise<RatingsSummaryDto["ratings"][number]> {
  const token = getAccessToken();
  if (!token) {
    throw new Error("Not authenticated");
  }
  return proxyPutJson<RatingsSummaryDto["ratings"][number], { value: number }>(
    ideaRatingsPath(id),
    { value },
    {
      errorMessage: "Could not save your rating",
      init: { headers: { Authorization: `Bearer ${token}` } },
    },
  );
}

export async function getIdeaComments(id: string): Promise<IdeaCommentDto[]> {
  return proxyGetJson<IdeaCommentDto[]>(ideaCommentsPath(id), {
    errorMessage: "Failed to fetch comments",
  });
}

export async function addTeamPhoto(
  id: string,
  photo: File,
): Promise<TeamPhotoDto> {
  const token = getAccessToken();
  if (!token) {
    throw new Error("Not authenticated");
  }

  const formData = new FormData();
  formData.append("photo", photo);

  return proxyPostFormData<TeamPhotoDto>(ideaTeamPhotosPath(id), formData, {
    errorMessage: "Could not upload team photo",
    init: { headers: { Authorization: `Bearer ${token}` } },
  });
}

export async function createIdeaComment(
  id: string,
  body: CreateIdeaCommentBody,
): Promise<IdeaCommentDto> {
  const token = getAccessToken();
  if (!token) {
    throw new Error("Not authenticated");
  }
  return proxyPostJson<IdeaCommentDto, CreateIdeaCommentBody>(
    ideaCommentsPath(id),
    body,
    {
      errorMessage: "Could not post comment",
      init: { headers: { Authorization: `Bearer ${token}` } },
    },
  );
}

export async function toggleCommentReaction(
  commentId: string,
  emoji: string,
): Promise<CommentReactionDto | null> {
  const token = getAccessToken();
  if (!token) {
    throw new Error("Not authenticated");
  }
  return proxyPostJson<CommentReactionDto | null, { emoji: string }>(
    commentReactionsPath(commentId),
    { emoji },
    {
      errorMessage: "Could not react to comment",
      init: { headers: { Authorization: `Bearer ${token}` } },
    },
  );
}

export async function updateIdeaComment(
  ideaId: string,
  commentId: string,
  content: string,
): Promise<IdeaCommentDto> {
  const token = getAccessToken();
  if (!token) {
    throw new Error("Not authenticated");
  }
  return proxyPatchJson<IdeaCommentDto, { content: string }>(
    ideaCommentDetailPath(ideaId, commentId),
    { content },
    {
      errorMessage: "Could not update comment",
      init: { headers: { Authorization: `Bearer ${token}` } },
    },
  );
}

export async function deleteIdeaComment(
  ideaId: string,
  commentId: string,
): Promise<void> {
  const token = getAccessToken();
  if (!token) {
    throw new Error("Not authenticated");
  }
  return proxyDelete(ideaCommentDetailPath(ideaId, commentId), {
    errorMessage: "Could not delete comment",
    init: { headers: { Authorization: `Bearer ${token}` } },
  });
}
