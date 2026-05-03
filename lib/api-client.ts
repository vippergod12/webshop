const TOKEN_KEY = "webvault.admin.token";

export function getToken(): string | null {
  if (typeof window === "undefined") return null;
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
