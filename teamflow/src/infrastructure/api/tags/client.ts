import { proxyGetJson } from "../core/fetch-client";
import { buildProxyPath } from "../core/proxy-path";

export type TagDto = {
  id: string;
  name: string;
  color?: string | null;
};

function tagsListPath(): string {
  return buildProxyPath(["tags"]);
}

function isTagArray(value: unknown): value is TagDto[] {
  if (!Array.isArray(value)) return false;
  return value.every(
    (item) =>
      item &&
      typeof item === "object" &&
      "id" in item &&
      typeof (item as TagDto).id === "string" &&
      "name" in item &&
      typeof (item as TagDto).name === "string",
  );
}

/** Best-effort tag list for pickers; returns [] when the API is unavailable or not wired yet. */
export async function listTags(): Promise<TagDto[]> {
  try {
    const data = await proxyGetJson<unknown>(tagsListPath(), {
      errorMessage: "Could not load tags",
    });
    return isTagArray(data) ? data : [];
  } catch {
    return [];
  }
}
