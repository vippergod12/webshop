import { sql } from "@/lib/server/db";
import { requireAdmin } from "@/lib/server/auth";
import { badRequest, json, notFound, serverError } from "@/lib/server/http";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const ALLOWED_STATUS = new Set(["new", "contacted", "done", "spam"]);
const NOTE_MAX = 2000;

function parseId(raw: string) {
  const id = Number(raw);
  return Number.isFinite(id) && id > 0 ? id : null;
}

export async function PATCH(req: Request, ctx: { params: { id: string } }) {
  try {
    const auth = requireAdmin(req);
    if (auth instanceof Response) return auth;

    const id = parseId(ctx.params.id);
    if (!id) return badRequest("ID không hợp lệ");

    const body = await req.json().catch(() => ({}));

    const status = body.status !== undefined ? String(body.status) : null;
    if (status !== null && !ALLOWED_STATUS.has(status)) {
      return badRequest("Trạng thái không hợp lệ");
    }
    const noteProvided = body.note !== undefined;
    const noteValue: string | null = noteProvided
      ? body.note === null
        ? null
        : String(body.note).slice(0, NOTE_MAX)
      : null;

    const rows = (await sql`
      UPDATE contacts SET
        status = COALESCE(${status}, status),
        note = CASE WHEN ${noteProvided}::boolean THEN ${noteValue} ELSE note END,
        updated_at = NOW()
      WHERE id = ${id}
      RETURNING *
    `) as any[];
    if (!rows.length) return notFound("Không tìm thấy liên hệ");
    return json({ contact: rows[0] });
  } catch (err) {
    return serverError(err);
  }
}

export async function DELETE(req: Request, ctx: { params: { id: string } }) {
  try {
    const auth = requireAdmin(req);
    if (auth instanceof Response) return auth;
    const id = parseId(ctx.params.id);
    if (!id) return badRequest("ID không hợp lệ");
    const rows = (await sql`
      DELETE FROM contacts WHERE id = ${id} RETURNING id
    `) as any[];
    if (!rows.length) return notFound("Không tìm thấy liên hệ");
    return json({ ok: true });
  } catch (err) {
    return serverError(err);
  }
}
