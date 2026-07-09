import { proxyDelete, proxyGetJson, proxyPostJson, proxyPutJson } from "../core/fetch-client";
import { getAccessToken } from "../../auth/session";
import { ideaCommentsPath, ideaTeamPhotosPath, ideasBoardPath, ideasCreatePath, ideasDetailPath, ideasListPath } from "./paths";
import type {
  CreateIdeaBody,
  CreateIdeaCommentBody,
  IdeaCommentDto,
  IdeaResponseDto,
  SaveIdeaBoardBody,
  TeamPhotoDto,
} from "./types";

export type { CreateIdeaBody, IdeaCommentDto, IdeaResponseDto, TeamPhotoDto };

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export async function getIdeas(
  status?: string,
): Promise<IdeaResponseDto[]> {
  return proxyGetJson<IdeaResponseDto[]>(ideasListPath(status), {
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

  const response = await fetch(`${API_URL}/ideas`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: formData,
  });

  const rawText = await response.text();

  let result: unknown = null;

  try {
    result = rawText ? JSON.parse(rawText) : null;
  } catch {
    result = null;
  }

  if (!response.ok) {
    const message =
      typeof result === "object" &&
      result !== null &&
      "message" in result
        ? (result as { message?: string | string[] }).message
        : null;

    throw new Error(
      Array.isArray(message)
        ? message.join(", ")
        : message || rawText || "Could not create idea",
    );
  }

  return result as IdeaResponseDto;
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

  const response = await fetch(ideaTeamPhotosPath(id), {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: formData,
  });

  const rawText = await response.text();

  let result: unknown = null;
  try {
    result = rawText ? JSON.parse(rawText) : null;
  } catch {
    result = null;
  }

  if (!response.ok) {
    const message =
      typeof result === "object" && result !== null && "message" in result
        ? (result as { message?: string | string[] }).message
        : null;

    throw new Error(
      Array.isArray(message)
        ? message.join(", ")
        : message || rawText || "Could not upload team photo",
    );
  }

  return result as TeamPhotoDto;
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
