import { proxyPostJson } from "@/src/infrastructure/api/core/fetch-client";
import { buildProxyPath } from "@/src/infrastructure/api/core/proxy-path";

export type ConnectionLabelInput = { id: string; label?: string };
export type ConnectionLabelResult = { connections: Array<{ id: string; label: string }> };

/** Export-only: rewrites connection descriptions to be clearer for the PDF. Never mutates the live board. */
export async function requestConnectionLabelImprovements(
  connections: ConnectionLabelInput[],
  token: string,
): Promise<ConnectionLabelResult> {
  return proxyPostJson<ConnectionLabelResult, { connections: ConnectionLabelInput[] }>(
    buildProxyPath(["ai", "board-layout"]),
    { connections },
    {
      errorMessage: "Could not improve the connection descriptions.",
      init: { headers: { Authorization: `Bearer ${token}` } },
    },
  );
}
