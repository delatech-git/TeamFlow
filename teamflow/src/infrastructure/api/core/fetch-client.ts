/**
 * Client Components / browser: relative paths resolve against the Next origin.
 * Do not import `fetch-server` from the same module graph as this file.
 */

import { getErrorMessageFromResponse } from "./error-response";

export async function proxyFetch(
  proxyPath: string,
  init?: RequestInit,
): Promise<Response> {
  const path = proxyPath.startsWith("/") ? proxyPath : `/${proxyPath}`;
  return fetch(path, { cache: "no-store", ...init });
}

export async function proxyGetJson<T>(
  proxyPath: string,
  options?: { errorMessage?: string; init?: RequestInit },
): Promise<T> {
  const res = await proxyFetch(proxyPath, {
    cache: "no-store",
    ...(options?.init ?? {}),
  });
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
  options?: { errorMessage?: string; init?: RequestInit },
): Promise<TResponse> {
  const extraInit = options?.init;
  const mergedHeaders = new Headers();
  mergedHeaders.set("Content-Type", "application/json");
  if (extraInit?.headers) {
    new Headers(extraInit.headers).forEach((value, key) => {
      mergedHeaders.set(key, value);
    });
  }

  const res = await proxyFetch(proxyPath, {
    ...extraInit,
    method: "POST",
    headers: mergedHeaders,
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

export async function proxyPutJson<TResponse, TBody = unknown>(
  proxyPath: string,
  body: TBody,
  options?: { errorMessage?: string; init?: RequestInit },
): Promise<TResponse> {
  const extraInit = options?.init;
  const mergedHeaders = new Headers();
  mergedHeaders.set("Content-Type", "application/json");
  if (extraInit?.headers) {
    new Headers(extraInit.headers).forEach((value, key) => {
      mergedHeaders.set(key, value);
    });
  }

  const res = await proxyFetch(proxyPath, {
    ...extraInit,
    method: "PUT",
    headers: mergedHeaders,
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

export async function proxyDelete(
  proxyPath: string,
  options?: { errorMessage?: string; init?: RequestInit },
): Promise<void> {
  const res = await proxyFetch(proxyPath, {
    method: "DELETE",
    cache: "no-store",
    ...(options?.init ?? {}),
  });
  if (!res.ok) {
    const parsed = await getErrorMessageFromResponse(res);
    throw new Error(
      parsed || options?.errorMessage || `Request failed (${res.status})`,
    );
  }
}
