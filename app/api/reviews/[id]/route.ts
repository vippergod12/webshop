import { sql } from "@/lib/server/db";
import { requireAdmin } from "@/lib/server/auth";
import { badRequest, json, notFound, serverError } from "@/lib/server/http";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function parseId(v: string): number | null {
  const n = Number(v);
  return Number.isInteger(n) && n > 0 ? n : null;
}

export async function PUT(req: Request, ctx: { params: { id: string } }) {
  try {
    const auth = requireAdmin(req);
    if (auth instanceof Response) return auth;

    const id = parseId(ctx.params.id);
    if (!id) return badRequest("ID không hợp lệ");

    const body = await req.json().catch(() => ({}));
    const is_approved =
      typeof body.is_approved === "boolean" ? body.is_approved : null;
    const rating =
      body.rating !== undefined
        ? Math.max(1, Math.min(5, Number(body.rating)))
        : null;
    const title =
      body.title !== undefined && body.title !== null
        ? String(body.title).slice(0, 200)
        : null;
    const comment =
      body.comment !== undefined ? String(body.comment).slice(0, 2000) : null;

    const rows = (await sql`
      UPDATE reviews SET
        is_approved = COALESCE(${is_approved}, is_approved),
        rating = COALESCE(${rating}, rating),
        title = COALESCE(${title}, title),
        comment = COALESCE(${comment}, comment)
      WHERE id = ${id}
      RETURNING *
    `) as any[];
    if (!rows.length) return notFound("Không tìm thấy review");
    return json({ review: rows[0] });
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

    const rows = (await sql`DELETE FROM reviews WHERE id = ${id} RETURNING id`) as any[];
    if (!rows.length) return notFound("Không tìm thấy review");
    return json({ ok: true });
  } catch (err) {
    return serverError(err);
  }
}
