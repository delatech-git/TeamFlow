import { proxyPostJson } from "@/src/infrastructure/api/core/fetch-client";
import { buildProxyPath } from "@/src/infrastructure/api/core/proxy-path";

export async function requestLinkedInCaption(
  ideaId: string,
  token: string,
): Promise<{ caption: string }> {
  return proxyPostJson<{ caption: string }, { ideaId: string }>(
    buildProxyPath(["ai", "linkedin-post"]),
    { ideaId },
    {
      errorMessage: "Could not generate a LinkedIn post.",
      init: { headers: { Authorization: `Bearer ${token}` } },
    },
  );
}
