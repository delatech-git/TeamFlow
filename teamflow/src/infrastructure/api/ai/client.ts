import { proxyPostJson } from "../core/fetch-client";
import { getAccessToken } from "../../auth/session";
import { aiSummaryPath } from "./paths";

export type GenerateSummaryBody = {
  ideaId: string;
};

export type PlanSummaryDto = {
  id: string;
  summary: string;
  ideaId: string;
  createdAt: string;
};

export async function generateIdeaSummary(
  ideaId: string,
): Promise<PlanSummaryDto> {
  const token = getAccessToken();
  if (!token) {
    throw new Error("Not authenticated");
  }

  return proxyPostJson<PlanSummaryDto, GenerateSummaryBody>(
    aiSummaryPath(),
    { ideaId },
    {
      errorMessage: "Could not generate AI summary",
      init: { headers: { Authorization: `Bearer ${token}` } },
    },
  );
}
