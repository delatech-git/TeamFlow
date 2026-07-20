import { buildProxyPath } from "../core/proxy-path";

export function ideasListPath(status?: string, search?: string): string {
  return buildProxyPath(["ideas"], { status, search });
}

export function ideasCreatePath(): string {
  return buildProxyPath(["ideas"]);
}

export function ideasDetailPath(id: string): string {
  return buildProxyPath(["ideas", id]);
}

export function ideasBoardPath(id: string): string {
  return buildProxyPath(["ideas", id, "board"]);
}

export function ideaPlannedGuidePath(id: string): string {
  return buildProxyPath(["ideas", id, "planned-guide"]);
}

export function ideaRatingsPath(id: string): string {
  return buildProxyPath(["ideas", id, "ratings"]);
}

export function ideaCommentsPath(id: string): string {
  return buildProxyPath(["ideas", id, "comments"]);
}

export function ideaCommentDetailPath(ideaId: string, commentId: string): string {
  return buildProxyPath(["ideas", ideaId, "comments", commentId]);
}

export function commentReactionsPath(commentId: string): string {
  return buildProxyPath(["comments", commentId, "reactions"]);
}

export function ideaTeamPhotosPath(id: string): string {
  return buildProxyPath(["ideas", id, "team-photos"]);
}
