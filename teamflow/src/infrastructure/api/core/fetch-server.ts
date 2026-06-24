import "server-only";

import { headers } from "next/headers";

import { getErrorMessageFromResponse } from "./error-response";

function normalizeHost(host: string): string {
  return host.replace(/^localhost(?=:|$)/i, "127.0.0.1");
}

async function absoluteProxyUrl(pathAndQuery: string): Promise<string> {
  const h = await headers();
  const hostRaw =
    h.get("x-forwarded-host") ?? h.get("host") ?? "127.0.0.1:3000";
  const host = normalizeHost(hostRaw);
  const proto = h.get("x-forwarded-proto") ?? "http";
  const path = pathAndQuery.startsWith("/")
    ? pathAndQuery
    : `/${pathAndQuery}`;
  return `${proto}://${host}${path}`;
}

/** Server Components / Server Actions: Node fetch requires an absolute URL. */
export async function proxyFetch(
  proxyPath: string,
  init?: RequestInit,
): Promise<Response> {
  const url = await absoluteProxyUrl(proxyPath);
  return fetch(url, { cache: "no-store", ...init });
}

export async function proxyGetJson<T>(
  proxyPath: string,
  options?: { errorMessage?: string },
): Promise<T> {
  const res = await proxyFetch(proxyPath);
  if (!res.ok) {
    const parsed = await getErrorMessageFromResponse(res);
    throw new Error(
      parsed || options?.errorMessage || `Request failed (${res.status})`,
    );
  }
  return res.json();
}

export async function proxyPostJson<TResponse, TBody = unknown>(
  proxyPath: string,
  body: TBody,
  options?: { errorMessage?: string },
): Promise<TResponse> {
  const res = await proxyFetch(proxyPath, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const parsed = await getErrorMessageFromResponse(res);
    throw new Error(
      parsed || options?.errorMessage || `Request failed (${res.status})`,
    );
  }
  return res.json();
}
