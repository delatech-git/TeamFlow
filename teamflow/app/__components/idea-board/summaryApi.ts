import { proxyPostJson } from "@/src/infrastructure/api/core/fetch-client";
import { buildProxyPath } from "@/src/infrastructure/api/core/proxy-path";

export type PlannedGuideDto = { id: string; summary: string };

export async function requestPlannedGuide(
  ideaId: string,
  token: string,
): Promise<PlannedGuideDto> {
  return proxyPostJson<PlannedGuideDto, { ideaId: string }>(
    buildProxyPath(["ai", "summary"]),
    { ideaId },
    {
      errorMessage: "Could not generate planned guide.",
      init: { headers: { Authorization: `Bearer ${token}` } },
    },
  );
}
