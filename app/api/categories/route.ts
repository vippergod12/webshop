import { sql } from "@/lib/server/db";
import { requireAdmin } from "@/lib/server/auth";
import { badRequest, json, serverError } from "@/lib/server/http";
import { getAllCategories } from "@/lib/data";
import { slugify } from "@/lib/utils/slug";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const cats = await getAllCategories();
    return json({ categories: cats });
  } catch (err) {
    return serverError(err);
  }
}

export async function POST(req: Request) {
  try {
    const auth = requireAdmin(req);
    if (auth instanceof Response) return auth;
    const body = await req.json().catch(() => ({}));
    const name = String(body.name || "").trim();
    if (!name) return badRequest("Thiếu tên danh mục");
    const slug = (body.slug ? String(body.slug) : slugify(name)).trim();
    const description = body.description ? String(body.description) : null;
    const image_url = body.image_url ? String(body.image_url) : null;
    const icon = body.icon ? String(body.icon) : null;
    const sort_order = Number(body.sort_order ?? 0) || 0;

    const rows = (await sql`
      INSERT INTO categories (slug, name, description, image_url, icon, sort_order)
      VALUES (${slug}, ${name}, ${description}, ${image_url}, ${icon}, ${sort_order})
      RETURNING *
    `) as any[];
    return json({ category: rows[0] }, { status: 201 });
  } catch (err: any) {
    if (err?.code === "23505") {
      return badRequest("Slug đã tồn tại");
    }
    return serverError(err);
  }
}
