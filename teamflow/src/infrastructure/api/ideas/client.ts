import { proxyDelete, proxyGetJson, proxyPostJson, proxyPutJson } from "../core/fetch-client";
import { getAccessToken } from "../../auth/session";
import { ideaCommentsPath, ideasBoardPath, ideasCreatePath, ideasDetailPath, ideasListPath } from "./paths";
import type {
  CreateIdeaBody,
  CreateIdeaCommentBody,
  IdeaCommentDto,
  IdeaResponseDto,
  SaveIdeaBoardBody,
} from "./types";

export type { CreateIdeaBody, IdeaCommentDto, IdeaResponseDto };

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
  return proxyPostJson<IdeaResponseDto, CreateIdeaBody>(
    ideasCreatePath(),
    body,
    {
      errorMessage: "Could not create idea",
      init: { headers: { Authorization: `Bearer ${token}` } },
    },
  );
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
