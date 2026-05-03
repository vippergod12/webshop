import { cache } from "react";
import { sql } from "@/lib/server/db";
import type {
  Category,
  HomeBundle,
  Product,
  Review,
} from "@/lib/types";

const PRODUCT_SELECT = `
  SELECT
    p.id, p.category_id, p.slug, p.name, p.short_description, p.long_description,
    p.price, p.sale_price, p.demo_url, p.repo_url, p.thumbnail, p.images,
    p.tech_stack, p.features, p.tags,
    p.is_featured, p.is_hero, p.is_published, p.sort_order, p.view_count,
    p.created_at, p.updated_at,
    c.slug AS category_slug, c.name AS category_name,
    COALESCE(rs.avg_rating, 0) AS avg_rating,
    COALESCE(rs.review_count, 0) AS review_count
  FROM products p
  LEFT JOIN categories c ON c.id = p.category_id
  LEFT JOIN (
    SELECT product_id, AVG(rating)::numeric(3,2) AS avg_rating, COUNT(*) AS review_count
    FROM reviews WHERE is_approved = TRUE
    GROUP BY product_id
  ) rs ON rs.product_id = p.id
`;

function mapProduct(r: any): Product {
  return {
    id: r.id,
    category_id: r.category_id,
    category_slug: r.category_slug ?? null,
    category_name: r.category_name ?? null,
    slug: r.slug,
    name: r.name,
    short_description: r.short_description,
    long_description: r.long_description,
    price: Number(r.price ?? 0),
    sale_price: r.sale_price === null ? null : Number(r.sale_price),
    demo_url: r.demo_url,
    repo_url: r.repo_url,
    thumbnail: r.thumbnail,
    images: r.images || [],
    tech_stack: r.tech_stack || [],
    features: r.features || [],
    tags: r.tags || [],
    is_featured: !!r.is_featured,
    is_hero: !!r.is_hero,
    is_published: !!r.is_published,
    sort_order: r.sort_order ?? 0,
    view_count: r.view_count ?? 0,
    avg_rating: r.avg_rating ? Number(r.avg_rating) : 0,
    review_count: r.review_count ? Number(r.review_count) : 0,
    created_at: r.created_at,
    updated_at: r.updated_at,
  };
}

function mapCategory(r: any): Category {
  return {
    id: r.id,
    slug: r.slug,
    name: r.name,
    description: r.description,
    image_url: r.image_url,
    icon: r.icon,
    sort_order: r.sort_order ?? 0,
    product_count: r.product_count ? Number(r.product_count) : 0,
    created_at: r.created_at,
    updated_at: r.updated_at,
  };
}

function mapReview(r: any): Review {
  return {
    id: r.id,
    product_id: r.product_id,
    product_slug: r.product_slug,
    product_name: r.product_name,
    customer_name: r.customer_name,
    customer_email: r.customer_email,
    rating: Number(r.rating),
    title: r.title,
    comment: r.comment,
    is_approved: !!r.is_approved,
    created_at: r.created_at,
  };
}

// ---------- CATEGORIES ----------
// Wrapped in React `cache` to deduplicate within a single request
// (e.g. Footer + page both call getAllCategories).
export const getAllCategories = cache(async (): Promise<Category[]> => {
  const rows = (await sql`
    SELECT c.*, COUNT(p.id) FILTER (WHERE p.is_published) AS product_count
    FROM categories c
    LEFT JOIN products p ON p.category_id = c.id
    GROUP BY c.id
    ORDER BY c.sort_order ASC, c.name ASC
  `) as any[];
  return rows.map(mapCategory);
});

export const getCategoryBySlug = cache(
  async (slug: string): Promise<Category | null> => {
    const rows = (await sql`
      SELECT c.*, COUNT(p.id) FILTER (WHERE p.is_published) AS product_count
      FROM categories c
      LEFT JOIN products p ON p.category_id = c.id
      WHERE c.slug = ${slug}
      GROUP BY c.id
      LIMIT 1
    `) as any[];
    return rows.length ? mapCategory(rows[0]) : null;
  }
);

// ---------- PRODUCTS ----------
export async function getAllProducts(opts?: {
  categorySlug?: string | null;
  q?: string | null;
  tag?: string | null;
  sort?: "newest" | "price_asc" | "price_desc" | "rating" | "popular";
  limit?: number;
}): Promise<Product[]> {
  const cat = opts?.categorySlug || null;
  const q = opts?.q || null;
  const tag = opts?.tag || null;
  const sort = opts?.sort || "newest";
  const limit = opts?.limit || 200;

  const orderBy =
    sort === "price_asc"
      ? "ORDER BY COALESCE(p.sale_price, p.price) ASC"
      : sort === "price_desc"
      ? "ORDER BY COALESCE(p.sale_price, p.price) DESC"
      : sort === "rating"
      ? "ORDER BY COALESCE(rs.avg_rating, 0) DESC, p.created_at DESC"
      : sort === "popular"
      ? "ORDER BY p.view_count DESC, p.created_at DESC"
      : "ORDER BY p.created_at DESC";

  const where: string[] = ["p.is_published = TRUE"];
  const params: any[] = [];

  if (cat) {
    params.push(cat);
    where.push(`c.slug = $${params.length}`);
  }
  if (q) {
    params.push(`%${q}%`);
    where.push(
      `(p.name ILIKE $${params.length} OR p.short_description ILIKE $${params.length} OR p.long_description ILIKE $${params.length})`
    );
  }
  if (tag) {
    params.push(tag);
    where.push(`$${params.length} = ANY(p.tags)`);
  }
  params.push(limit);

  const query = `${PRODUCT_SELECT} WHERE ${where.join(" AND ")} ${orderBy} LIMIT $${params.length}`;
  const rows = (await sql(query, params)) as any[];
  return rows.map(mapProduct);
}

// Cached so that `generateMetadata` + `Page` + JSON-LD share the same DB hit.
export const getProductBySlug = cache(
  async (slug: string): Promise<Product | null> => {
    const query = `${PRODUCT_SELECT} WHERE p.slug = $1 AND p.is_published = TRUE LIMIT 1`;
    const rows = (await sql(query, [slug])) as any[];
    return rows.length ? mapProduct(rows[0]) : null;
  }
);

export async function getFeaturedProducts(limit = 8): Promise<Product[]> {
  const query = `${PRODUCT_SELECT}
    WHERE p.is_published = TRUE AND p.is_featured = TRUE
    ORDER BY p.sort_order ASC, p.created_at DESC
    LIMIT $1`;
  const rows = (await sql(query, [limit])) as any[];
  return rows.map(mapProduct);
}

export async function getHeroProduct(): Promise<Product | null> {
  const query = `${PRODUCT_SELECT}
    WHERE p.is_published = TRUE AND p.is_hero = TRUE
    ORDER BY p.updated_at DESC LIMIT 1`;
  const rows = (await sql(query, [])) as any[];
  return rows.length ? mapProduct(rows[0]) : null;
}

export async function getLatestProducts(limit = 8): Promise<Product[]> {
  const query = `${PRODUCT_SELECT}
    WHERE p.is_published = TRUE
    ORDER BY p.created_at DESC
    LIMIT $1`;
  const rows = (await sql(query, [limit])) as any[];
  return rows.map(mapProduct);
}

export async function getTopRatedProducts(limit = 6): Promise<Product[]> {
  const query = `${PRODUCT_SELECT}
    WHERE p.is_published = TRUE AND COALESCE(rs.review_count, 0) > 0
    ORDER BY COALESCE(rs.avg_rating, 0) DESC, COALESCE(rs.review_count, 0) DESC
    LIMIT $1`;
  const rows = (await sql(query, [limit])) as any[];
  return rows.map(mapProduct);
}

export async function getRelatedProducts(
  product: Product,
  limit = 4
): Promise<Product[]> {
  const query = `${PRODUCT_SELECT}
    WHERE p.is_published = TRUE
      AND p.id <> $1
      AND (p.category_id = $2 OR p.tags && $3)
    ORDER BY p.created_at DESC
    LIMIT $4`;
  const rows = (await sql(query, [
    product.id,
    product.category_id,
    product.tags || [],
    limit,
  ])) as any[];
  return rows.map(mapProduct);
}

export async function incrementProductViews(id: number): Promise<void> {
  try {
    await sql`UPDATE products SET view_count = view_count + 1 WHERE id = ${id}`;
  } catch {
    /* ignore */
  }
}

/**
 * Lightweight slug-only fetch for sitemap & static rendering.
 * Avoids hydrating heavy joins / images when we only need URLs.
 */
export async function getAllProductSlugs(limit = 5000): Promise<
  { slug: string; updated_at: string }[]
> {
  try {
    const rows = (await sql`
      SELECT slug, updated_at FROM products
      WHERE is_published = TRUE
      ORDER BY updated_at DESC
      LIMIT ${limit}
    `) as any[];
    return rows.map((r) => ({ slug: r.slug, updated_at: r.updated_at }));
  } catch {
    return [];
  }
}

export async function getPublishedProductCount(): Promise<number> {
  try {
    const rows = (await sql`
      SELECT COUNT(*)::int AS n FROM products WHERE is_published = TRUE
    `) as any[];
    return rows[0]?.n ?? 0;
  } catch {
    return 0;
  }
}

// ---------- REVIEWS ----------
export async function getApprovedReviews(
  productId: number,
  limit = 50
): Promise<Review[]> {
  const rows = (await sql`
    SELECT * FROM reviews
    WHERE product_id = ${productId} AND is_approved = TRUE
    ORDER BY created_at DESC
    LIMIT ${limit}
  `) as any[];
  return rows.map(mapReview);
}

export async function getRecentApprovedReviews(limit = 6): Promise<Review[]> {
  try {
    const rows = (await sql`
      SELECT r.*, p.slug AS product_slug, p.name AS product_name
      FROM reviews r
      LEFT JOIN products p ON p.id = r.product_id
      WHERE r.is_approved = TRUE
      ORDER BY r.created_at DESC
      LIMIT ${limit}
    `) as any[];
    return rows.map(mapReview);
  } catch {
    return [];
  }
}

export async function getAllReviews(opts?: {
  approvedOnly?: boolean;
}): Promise<Review[]> {
  const approvedOnly = opts?.approvedOnly ?? false;
  const rows = (await (approvedOnly
    ? sql`
        SELECT r.*, p.slug AS product_slug, p.name AS product_name
        FROM reviews r LEFT JOIN products p ON p.id = r.product_id
        WHERE r.is_approved = TRUE
        ORDER BY r.created_at DESC
      `
    : sql`
        SELECT r.*, p.slug AS product_slug, p.name AS product_name
        FROM reviews r LEFT JOIN products p ON p.id = r.product_id
        ORDER BY r.is_approved ASC, r.created_at DESC
      `)) as any[];
  return rows.map(mapReview);
}

// ---------- HOME BUNDLE ----------
export async function getHomeBundle(): Promise<HomeBundle> {
  const [categories, hero, featured, latest, topRated] = await Promise.all([
    getAllCategories(),
    getHeroProduct(),
    getFeaturedProducts(8),
    getLatestProducts(8),
    getTopRatedProducts(6),
  ]);
  return { categories, hero, featured, latest, topRated };
}
