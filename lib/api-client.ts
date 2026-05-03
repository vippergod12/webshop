const TOKEN_KEY = "rise.admin.token";
const LEGACY_TOKEN_KEYS = ["webvault.admin.token"];

function migrateLegacyToken() {
  if (typeof window === "undefined") return;
  if (window.localStorage.getItem(TOKEN_KEY)) return;
  for (const k of LEGACY_TOKEN_KEYS) {
    const v = window.localStorage.getItem(k);
    if (v) {
      window.localStorage.setItem(TOKEN_KEY, v);
      window.localStorage.removeItem(k);
      return;
    }
  }
}

export function getToken(): string | null {
  if (typeof window === "undefined") return null;
  migrateLegacyToken();
  return window.localStorage.getItem(TOKEN_KEY);
}

export function setToken(token: string) {
  if (typeof window !== "undefined") {
    window.localStorage.setItem(TOKEN_KEY, token);
  }
}

export function clearToken() {
  if (typeof window !== "undefined") {
    window.localStorage.removeItem(TOKEN_KEY);
    for (const k of LEGACY_TOKEN_KEYS) {
      window.localStorage.removeItem(k);
    }
  }
}

export async function apiFetch<T = any>(
  path: string,
  init?: RequestInit & { auth?: boolean }
): Promise<T> {
  const headers = new Headers(init?.headers);
  if (!headers.has("Content-Type") && init?.body) {
    headers.set("Content-Type", "application/json");
  }
  if (init?.auth) {
    const token = getToken();
    if (token) headers.set("Authorization", `Bearer ${token}`);
  }
  const res = await fetch(path, { ...init, headers, cache: "no-store" });
  let body: any = null;
  try {
    body = await res.json();
  } catch {
    /* ignore */
  }
  if (!res.ok) {
    const msg = body?.error || `Request failed (${res.status})`;
    throw new Error(msg);
  }
  return body as T;
}
