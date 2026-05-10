/**
 * API client for TOG Admin backend.
 * - Same-origin by default (Next rewrites /api/v1/* to backend)
 * - Bearer token from getter.
 * - On 401: attempt refresh, then retry or redirect to login.
 * - ✅ NEW: tiny "wait for token" to prevent initial 401/refresh retry storm.
 */

import type { ApiError } from "./types";
import { isNetworkError, NETWORK_ERROR_MESSAGE } from "./errorUtils";

const BASE_URL = "";
const API_PREFIX = "/api/v1";

export type TokenGetter = () => string | null;
export type RefreshTokens = () => Promise<string | null>;
export type OnUnauthorized = () => void;

let tokenGetter: TokenGetter = () => null;
let refreshTokens: RefreshTokens = async () => null;
let onUnauthorized: OnUnauthorized = () => {};

export function setAuthHandlers(getToken: TokenGetter, refresh: RefreshTokens, on401: OnUnauthorized) {
  tokenGetter = getToken;
  refreshTokens = refresh;
  onUnauthorized = on401;
}

/** ✅ wait up to X ms for accessToken to appear (AuthContext boot/refresh) */
async function waitForToken(maxWaitMs = 600, stepMs = 50): Promise<string | null> {
  const start = Date.now();
  let t = tokenGetter();
  if (t) return t;

  while (Date.now() - start < maxWaitMs) {
    await new Promise((r) => setTimeout(r, stepMs));
    t = tokenGetter();
    if (t) return t;
  }
  return null;
}

/** ✅ only apply "wait for token" to protected admin endpoints */
function isProtectedAdminPath(path: string) {
  // adjust if you have other protected namespaces
  return path.startsWith("/admin/");
}

export async function request<T>(path: string, options: RequestInit = {}): Promise<{ data: T }> {
  const url = path.startsWith("http") ? path : `${BASE_URL}${API_PREFIX}${path}`;

  // ✅ NEW: prevent first-call 401 by waiting briefly for token to become available
  let token = tokenGetter();
  if (!token && isProtectedAdminPath(path)) {
    token = await waitForToken(600, 50);
  }

  const headers: HeadersInit = {
    "Content-Type": "application/json",
    ...options.headers,
  };

  if (token) {
    (headers as Record<string, string>)["Authorization"] = `Bearer ${token}`;
  }

  let res: Response;
  try {
    res = await fetch(url, { ...options, headers });
  } catch (e) {
    if (isNetworkError(e)) throw new Error(NETWORK_ERROR_MESSAGE);
    throw e;
  }

  // ✅ existing behavior stays exactly same
  if (res.status === 401) {
    const newToken = await refreshTokens();
    if (newToken) {
      (headers as Record<string, string>)["Authorization"] = `Bearer ${newToken}`;
      try {
        res = await fetch(url, { ...options, headers });
      } catch (e) {
        if (isNetworkError(e)) throw new Error(NETWORK_ERROR_MESSAGE);
        throw e;
      }
    }

    if (res.status === 401) {
      onUnauthorized();
      const err = (await res.json().catch(() => ({}))) as ApiError;
      throw new Error(err?.error?.message ?? "Unauthorized");
    }
  }

  const json = await res.json().catch(() => ({}));

  if (!res.ok) {
    const apiErr = json as ApiError;
    const msg = apiErr?.error?.message ?? res.statusText;
    const code = apiErr?.error?.code;
    const err = new Error(msg) as Error & { code?: string; details?: unknown };
    err.code = code;
    err.details = apiErr?.error?.details;
    throw err;
  }

  return json as { data: T };
}

/** Upload image (multipart). Returns URL. Max 5MB, JPEG/PNG/GIF/WebP. */
export async function uploadImage(file: File): Promise<string> {
  const url = `${BASE_URL}${API_PREFIX}/admin/upload/image`;

  // ✅ NEW: wait briefly for token (same issue can happen on first upload)
  let token = tokenGetter();
  if (!token) token = await waitForToken(600, 50);

  const makeRequest = () => {
    const form = new FormData();
    form.append("image", file);

    const headers: HeadersInit = {};
    if (token) headers["Authorization"] = `Bearer ${token}`;

    return fetch(url, { method: "POST", body: form, headers });
  };

  let res: Response;
  try {
    res = await makeRequest();
  } catch (e) {
    if (isNetworkError(e)) throw new Error(NETWORK_ERROR_MESSAGE);
    throw e;
  }

  if (res.status === 401) {
    const newToken = await refreshTokens();
    if (newToken) {
      token = newToken;
      try {
        res = await makeRequest();
      } catch (e) {
        if (isNetworkError(e)) throw new Error(NETWORK_ERROR_MESSAGE);
        throw e;
      }
    }

    if (res.status === 401) {
      onUnauthorized();
      const err = (await res.json().catch(() => ({}))) as ApiError;
      throw new Error(err?.error?.message ?? "Unauthorized");
    }
  }

  const json = await res.json().catch(() => ({}));
  if (!res.ok) {
    const apiErr = json as ApiError;
    throw new Error(apiErr?.error?.message ?? "Upload failed");
  }

  const data = json as { data?: { url?: string } };
  if (!data?.data?.url) throw new Error("No URL in response");
  return data.data.url;
}

/** Delete image by path or full URL. Path must be under uploads/images/. */
export async function deleteImage(pathOrUrl: string): Promise<{ deleted: boolean }> {
  const url = `${BASE_URL}${API_PREFIX}/admin/upload/image`;
  let token = tokenGetter();
  if (!token) token = await waitForToken(600, 50);

  const path = pathOrUrl.includes("/uploads/") ? pathOrUrl.replace(/^.*?(\/uploads\/[^?#]+).*$/, "$1") : pathOrUrl;
  const makeRequest = () => {
    const headers: HeadersInit = {};
    if (token) headers["Authorization"] = `Bearer ${token}`;
    return fetch(`${url}?path=${encodeURIComponent(path)}`, { method: "DELETE", headers });
  };

  let res: Response;
  try {
    res = await makeRequest();
  } catch (e) {
    if (isNetworkError(e)) throw new Error(NETWORK_ERROR_MESSAGE);
    throw e;
  }

  if (res.status === 401) {
    const newToken = await refreshTokens();
    if (newToken) {
      token = newToken;
      try {
        res = await makeRequest();
      } catch (e) {
        if (isNetworkError(e)) throw new Error(NETWORK_ERROR_MESSAGE);
        throw e;
      }
    }
    if (res.status === 401) {
      onUnauthorized();
      const err = (await res.json().catch(() => ({}))) as ApiError;
      throw new Error(err?.error?.message ?? "Unauthorized");
    }
  }

  const json = await res.json().catch(() => ({}));
  if (!res.ok) {
    const apiErr = json as ApiError;
    throw new Error(apiErr?.error?.message ?? "Delete failed");
  }
  const data = json as { data?: { deleted?: boolean } };
  return { deleted: data?.data?.deleted ?? false };
}

export const api = {
  get: <T>(path: string) => request<T>(path, { method: "GET" }),
  post: <T>(path: string, body: unknown) =>
    request<T>(path, { method: "POST", body: JSON.stringify(body) }),
  put: <T>(path: string, body: unknown) =>
    request<T>(path, { method: "PUT", body: JSON.stringify(body) }),
  patch: <T>(path: string, body: unknown) =>
    request<T>(path, { method: "PATCH", body: JSON.stringify(body) }),
  delete: <T>(path: string) => request<T>(path, { method: "DELETE" }),
  uploadImage,
  deleteImage,
};
