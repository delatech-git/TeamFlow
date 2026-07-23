import { buildProxyPath } from "../core/proxy-path";

export function usersListPath(): string {
  return buildProxyPath(["users"]);
}

export function userDetailPath(id: string): string {
  return buildProxyPath(["users", id]);
}
