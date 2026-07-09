import { buildProxyPath } from "../core/proxy-path";

export function ideasListPath(status?: string): string {
  return buildProxyPath(["ideas"], status ? { status } : undefined);
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

export function ideaCommentsPath(id: string): string {
  return buildProxyPath(["ideas", id, "comments"]);
}

export function ideaTeamPhotosPath(id: string): string {
  return buildProxyPath(["ideas", id, "team-photos"]);
}
