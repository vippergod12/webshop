import { sql } from "@/lib/server/db";
import { requireAdmin } from "@/lib/server/auth";
import { badRequest, json, serverError } from "@/lib/server/http";
import { clientIp, rateLimit } from "@/lib/server/rate-limit";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const NAME_MAX = 160;
const PHONE_MAX = 40;
const EMAIL_MAX = 160;
const TYPE_MAX = 80;
const MESSAGE_MAX = 4000;
const UA_MAX = 400;

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_REGEX = /^[0-9 +()\-]{8,}$/;

function clip(value: string, max: number) {
  return value.length > max ? value.slice(0, max) : value;
}

const ALLOWED_STATUS = new Set(["new", "contacted", "done", "spam"]);

export async function GET(req: Request) {
  try {
    const auth = requireAdmin(req);
    if (auth instanceof Response) return auth;

    const url = new URL(req.url);
    const status = url.searchParams.get("status");
    const limit = Math.max(
      1,
      Math.min(500, Number(url.searchParams.get("limit")) || 200)
    );

    const rows =
      status && ALLOWED_STATUS.has(status)
        ? ((await sql`
            SELECT * FROM contacts
            WHERE status = ${status}
            ORDER BY created_at DESC
            LIMIT ${limit}
          `) as any[])
        : ((await sql`
            SELECT * FROM contacts
            ORDER BY created_at DESC
            LIMIT ${limit}
          `) as any[]);

    return json({ contacts: rows });
  } catch (err) {
    return serverError(err);
  }
}

export async function POST(req: Request) {
  try {
    // Rate-limit: max 5 form submissions / 10 minutes per IP.
    const limit = rateLimit(`contact:${clientIp(req)}`, {
      windowMs: 10 * 60_000,
      max: 5,
    });
    if (!limit.ok) {
      return json(
        {
          error: "Bạn đã gửi quá nhiều yêu cầu. Vui lòng thử lại sau ít phút.",
        },
        {
          status: 429,
          headers: {
            "Retry-After": String(
              Math.max(1, Math.ceil((limit.resetAt - Date.now()) / 1000))
            ),
          },
        }
      );
    }

    const body = await req.json().catch(() => ({}));

    const name = clip(String(body.name || "").trim(), NAME_MAX);
    const phone = clip(String(body.phone || "").trim(), PHONE_MAX);
    const email_raw = body.email ? String(body.email).trim() : "";
    const project_type = body.project_type
      ? clip(String(body.project_type).trim(), TYPE_MAX)
      : null;
    const message = body.message
      ? clip(String(body.message).trim(), MESSAGE_MAX)
      : null;

    if (!name) return badRequest("Vui lòng nhập họ tên");
    if (!phone) return badRequest("Vui lòng nhập số điện thoại");
    if (!PHONE_REGEX.test(phone)) {
      return badRequest("Số điện thoại không hợp lệ");
    }

    let email: string | null = null;
    if (email_raw) {
      const e = clip(email_raw.toLowerCase(), EMAIL_MAX);
      if (!EMAIL_REGEX.test(e)) return badRequest("Email không hợp lệ");
      email = e;
    }

    const ip = clip(clientIp(req), 60);
    const ua = clip(String(req.headers.get("user-agent") || ""), UA_MAX);

    const rows = (await sql`
      INSERT INTO contacts (name, phone, email, project_type, message, status, ip, user_agent)
      VALUES (${name}, ${phone}, ${email}, ${project_type}, ${message}, 'new', ${ip}, ${ua})
      RETURNING id, created_at
    `) as any[];

    return json({ ok: true, id: rows[0].id }, { status: 201 });
  } catch (err) {
    return serverError(err);
  }
}
