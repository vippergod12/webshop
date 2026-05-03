import { sql } from "@/lib/server/db";
import { requireAdmin } from "@/lib/server/auth";
import { badRequest, json, notFound, serverError } from "@/lib/server/http";
import { isNumericId } from "@/lib/utils/slug";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(_req: Request, ctx: { params: { id: string } }) {
  try {
    const idOrSlug = ctx.params.id;
    const rows = (await (isNumericId(idOrSlug)
      ? sql`SELECT * FROM categories WHERE id = ${Number(idOrSlug)} LIMIT 1`
      : sql`SELECT * FROM categories WHERE slug = ${idOrSlug} LIMIT 1`)) as any[];
    if (!rows.length) return notFound("Không tìm thấy danh mục");
    return json({ category: rows[0] });
  } catch (err) {
    return serverError(err);
  }
}

export async function PUT(req: Request, ctx: { params: { id: string } }) {
  try {
    const auth = requireAdmin(req);
    if (auth instanceof Response) return auth;
    const idOrSlug = ctx.params.id;
    const body = await req.json().catch(() => ({}));
    const name = body.name !== undefined ? String(body.name).trim() : null;
    const slug = body.slug !== undefined ? String(body.slug).trim() : null;
    const description =
      body.description !== undefined
        ? body.description === null
          ? null
          : String(body.description)
        : null;
    const image_url =
      body.image_url !== undefined
        ? body.image_url === null
          ? null
          : String(body.image_url)
        : null;
    const icon =
      body.icon !== undefined
        ? body.icon === null
          ? null
          : String(body.icon)
        : null;
    const sort_order =
      body.sort_order !== undefined ? Number(body.sort_order) || 0 : null;

    const rows = (await (isNumericId(idOrSlug)
      ? sql`
        UPDATE categories SET
          name = COALESCE(${name}, name),
          slug = COALESCE(${slug}, slug),
          description = COALESCE(${description}, description),
          image_url = COALESCE(${image_url}, image_url),
          icon = COALESCE(${icon}, icon),
          sort_order = COALESCE(${sort_order}, sort_order),
          updated_at = NOW()
        WHERE id = ${Number(idOrSlug)}
        RETURNING *
      `
      : sql`
        UPDATE categories SET
          name = COALESCE(${name}, name),
          slug = COALESCE(${slug}, slug),
          description = COALESCE(${description}, description),
          image_url = COALESCE(${image_url}, image_url),
          icon = COALESCE(${icon}, icon),
          sort_order = COALESCE(${sort_order}, sort_order),
          updated_at = NOW()
        WHERE slug = ${idOrSlug}
        RETURNING *
      `)) as any[];
    if (!rows.length) return notFound("Không tìm thấy danh mục");
    return json({ category: rows[0] });
  } catch (err: any) {
    if (err?.code === "23505") return badRequest("Slug đã tồn tại");
    return serverError(err);
  }
}

export async function DELETE(req: Request, ctx: { params: { id: string } }) {
  try {
    const auth = requireAdmin(req);
    if (auth instanceof Response) return auth;
    const idOrSlug = ctx.params.id;
    const rows = (await (isNumericId(idOrSlug)
      ? sql`DELETE FROM categories WHERE id = ${Number(idOrSlug)} RETURNING id`
      : sql`DELETE FROM categories WHERE slug = ${idOrSlug} RETURNING id`)) as any[];
    if (!rows.length) return notFound("Không tìm thấy danh mục");
    return json({ ok: true });
  } catch (err) {
    return serverError(err);
  }
}
