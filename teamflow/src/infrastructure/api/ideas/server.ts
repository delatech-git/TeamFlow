import "server-only";

import { proxyGetJson } from "../core/fetch-server";
import { ideasDetailPath, ideasListPath } from "./paths";
import type { IdeaResponseDto } from "./types";

export type { IdeaResponseDto };

export async function getIdeas(
  status?: string,
): Promise<IdeaResponseDto[]> {
  return proxyGetJson<IdeaResponseDto[]>(ideasListPath(status), {
    errorMessage: "Failed to fetch ideas",
  });
}

export async function getRecentIdeas(): Promise<IdeaResponseDto[]> {
  return getIdeas();
}

export async function getIdeaById(
  id: string,
): Promise<IdeaResponseDto | null> {
  try {
    return await proxyGetJson<IdeaResponseDto>(ideasDetailPath(id), {
      errorMessage: "Failed to fetch idea",
    });
  } catch {
    return null;
  }
}
