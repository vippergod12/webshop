import { sql } from "@/lib/server/db";
import { requireAdmin } from "@/lib/server/auth";
import { badRequest, json, serverError } from "@/lib/server/http";
import { getAllProducts } from "@/lib/data";
import { slugify } from "@/lib/utils/slug";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const categorySlug = url.searchParams.get("category");
    const q = url.searchParams.get("q");
    const tag = url.searchParams.get("tag");
    const sort = (url.searchParams.get("sort") || "newest") as any;
    const limit = Number(url.searchParams.get("limit") || 200);

    const products = await getAllProducts({
      categorySlug,
      q,
      tag,
      sort,
      limit,
    });
    return json({ products });
  } catch (err) {
    return serverError(err);
  }
}

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

export async function POST(req: Request) {
  try {
    const auth = requireAdmin(req);
    if (auth instanceof Response) return auth;
    const body = await req.json().catch(() => ({}));
    const name = String(body.name || "").trim();
    if (!name) return badRequest("Thiếu tên sản phẩm");
    const slug = (body.slug ? String(body.slug) : slugify(name)).trim();
    const category_id = body.category_id ? Number(body.category_id) : null;
    const short_description = body.short_description
      ? String(body.short_description)
      : null;
    const long_description = body.long_description
      ? String(body.long_description)
      : null;
    const price = Number(body.price ?? 0) || 0;
    const sale_price =
      body.sale_price === null ||
      body.sale_price === undefined ||
      body.sale_price === ""
        ? null
        : Number(body.sale_price);
    const demo_url = body.demo_url ? String(body.demo_url) : null;
    const repo_url = body.repo_url ? String(body.repo_url) : null;
    const thumbnail = body.thumbnail ? String(body.thumbnail) : null;
    const images = toArray(body.images);
    const tech_stack = toArray(body.tech_stack);
    const features = toArray(body.features);
    const tags = toArray(body.tags);
    const is_featured = !!body.is_featured;
    const is_hero = !!body.is_hero;
    const is_published = body.is_published !== false;
    const sort_order = Number(body.sort_order ?? 0) || 0;

    if (is_hero) {
      await sql`UPDATE products SET is_hero = FALSE WHERE is_hero = TRUE`;
    }

    const rows = (await sql`
      INSERT INTO products (
        category_id, slug, name, short_description, long_description,
        price, sale_price, demo_url, repo_url, thumbnail, images,
        tech_stack, features, tags, is_featured, is_hero, is_published, sort_order
      ) VALUES (
        ${category_id}, ${slug}, ${name}, ${short_description}, ${long_description},
        ${price}, ${sale_price}, ${demo_url}, ${repo_url}, ${thumbnail}, ${images},
        ${tech_stack}, ${features}, ${tags}, ${is_featured}, ${is_hero}, ${is_published}, ${sort_order}
      )
      RETURNING *
    `) as any[];
    return json({ product: rows[0] }, { status: 201 });
  } catch (err: any) {
    if (err?.code === "23505") return badRequest("Slug đã tồn tại");
    return serverError(err);
  }
}
