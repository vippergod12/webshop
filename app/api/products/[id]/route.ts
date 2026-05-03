import { sql } from "@/lib/server/db";
import { requireAdmin } from "@/lib/server/auth";
import { badRequest, json, notFound, serverError } from "@/lib/server/http";
import { isNumericId } from "@/lib/utils/slug";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function toArray(input: any): string[] {
  if (Array.isArray(input))
    return input.map((s) => String(s).trim()).filter(Boolean);
  if (typeof input === "string")
    return input
      .split(/[,\n]/)
      .map((s) => s.trim())
      .filter(Boolean);
  return [];
}

export async function GET(_req: Request, ctx: { params: { id: string } }) {
  try {
    const idOrSlug = ctx.params.id;
    const rows = (await (isNumericId(idOrSlug)
      ? sql`SELECT * FROM products WHERE id = ${Number(idOrSlug)} LIMIT 1`
      : sql`SELECT * FROM products WHERE slug = ${idOrSlug} LIMIT 1`)) as any[];
    if (!rows.length) return notFound("Không tìm thấy sản phẩm");
    return json({ product: rows[0] });
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

    const v = (k: string) => body[k];
    const has = (k: string) => Object.prototype.hasOwnProperty.call(body, k);

    const name = has("name") ? String(v("name") || "").trim() : null;
    const slug = has("slug") ? String(v("slug") || "").trim() : null;
    const category_id = has("category_id")
      ? v("category_id") === null || v("category_id") === ""
        ? null
        : Number(v("category_id"))
      : undefined;
    const short_description = has("short_description")
      ? v("short_description") === null
        ? null
        : String(v("short_description"))
      : null;
    const long_description = has("long_description")
      ? v("long_description") === null
        ? null
        : String(v("long_description"))
      : null;
    const price = has("price") ? Number(v("price") ?? 0) || 0 : null;
    const sale_price = has("sale_price")
      ? v("sale_price") === null || v("sale_price") === ""
        ? null
        : Number(v("sale_price"))
      : undefined;
    const demo_url = has("demo_url")
      ? v("demo_url") === null
        ? null
        : String(v("demo_url"))
      : null;
    const repo_url = has("repo_url")
      ? v("repo_url") === null
        ? null
        : String(v("repo_url"))
      : null;
    const thumbnail = has("thumbnail")
      ? v("thumbnail") === null
        ? null
        : String(v("thumbnail"))
      : null;
    const images = has("images") ? toArray(v("images")) : null;
    const tech_stack = has("tech_stack") ? toArray(v("tech_stack")) : null;
    const features = has("features") ? toArray(v("features")) : null;
    const tags = has("tags") ? toArray(v("tags")) : null;
    const is_featured = has("is_featured") ? !!v("is_featured") : null;
    const is_hero = has("is_hero") ? !!v("is_hero") : null;
    const is_published = has("is_published") ? !!v("is_published") : null;
    const sort_order = has("sort_order") ? Number(v("sort_order") || 0) : null;

    if (is_hero === true) {
      const idForExclude = isNumericId(idOrSlug) ? Number(idOrSlug) : 0;
      await sql`UPDATE products SET is_hero = FALSE WHERE is_hero = TRUE AND id <> ${idForExclude}`;
    }

    const setClauses: string[] = [];
    const params: any[] = [];
    const push = (col: string, val: any) => {
      params.push(val);
      setClauses.push(`${col} = $${params.length}`);
    };

    if (name !== null) push("name", name);
    if (slug !== null) push("slug", slug);
    if (category_id !== undefined) push("category_id", category_id);
    if (short_description !== null) push("short_description", short_description);
    if (long_description !== null) push("long_description", long_description);
    if (price !== null) push("price", price);
    if (sale_price !== undefined) push("sale_price", sale_price);
    if (demo_url !== null) push("demo_url", demo_url);
    if (repo_url !== null) push("repo_url", repo_url);
    if (thumbnail !== null) push("thumbnail", thumbnail);
    if (images !== null) push("images", images);
    if (tech_stack !== null) push("tech_stack", tech_stack);
    if (features !== null) push("features", features);
    if (tags !== null) push("tags", tags);
    if (is_featured !== null) push("is_featured", is_featured);
    if (is_hero !== null) push("is_hero", is_hero);
    if (is_published !== null) push("is_published", is_published);
    if (sort_order !== null) push("sort_order", sort_order);

    if (!setClauses.length) {
      return badRequest("Không có trường nào để cập nhật");
    }
    setClauses.push(`updated_at = NOW()`);

    const whereCol = isNumericId(idOrSlug) ? "id" : "slug";
    const whereVal: any = isNumericId(idOrSlug) ? Number(idOrSlug) : idOrSlug;
    params.push(whereVal);
    const query = `UPDATE products SET ${setClauses.join(", ")} WHERE ${whereCol} = $${params.length} RETURNING *`;

    const rows = (await sql(query, params)) as any[];
    if (!rows.length) return notFound("Không tìm thấy sản phẩm");
    return json({ product: rows[0] });
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
      ? sql`DELETE FROM products WHERE id = ${Number(idOrSlug)} RETURNING id`
      : sql`DELETE FROM products WHERE slug = ${idOrSlug} RETURNING id`)) as any[];
    if (!rows.length) return notFound("Không tìm thấy sản phẩm");
    return json({ ok: true });
  } catch (err) {
    return serverError(err);
  }
}
