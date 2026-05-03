export function json(data: unknown, init?: ResponseInit): Response {
  return new Response(JSON.stringify(data), {
    ...init,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      ...(init?.headers || {}),
    },
  });
}

export function badRequest(message: string, extra?: Record<string, unknown>) {
  return json({ error: message, ...(extra || {}) }, { status: 400 });
}

export function notFound(message = "Not found") {
  return json({ error: message }, { status: 404 });
}

export function serverError(err: unknown) {
  console.error("[api] server error", err);
  return json({ error: "Internal Server Error" }, { status: 500 });
}
