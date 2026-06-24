/**
 * Must match the rewrite `source` in next.config.ts (`/api/backend/:path*`).
 */
export const BACKEND_PROXY_PREFIX = "/api/backend";

/**
 * Build a path under the Next.js → Nest proxy, e.g. `['ideas']` → `/api/backend/ideas`.
 */
export function buildProxyPath(
  segments: string[],
  query?: Record<string, string | number | boolean | undefined>,
): string {
  const normalized = segments.map((s) =>
    s.replace(/^\//, "").replace(/\/$/, ""),
  );
  const path = [BACKEND_PROXY_PREFIX, ...normalized].join("/");

  const q = new URLSearchParams();
  if (query) {
    for (const [key, value] of Object.entries(query)) {
      if (value === undefined) continue;
      q.set(key, String(value));
    }
  }

  const qs = q.toString();
  return qs ? `${path}?${qs}` : path;
}
