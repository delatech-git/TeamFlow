import { buildProxyPath } from "../core/proxy-path";

export function aiSummaryPath(): string {
  return buildProxyPath(["ai", "summary"]);
}
