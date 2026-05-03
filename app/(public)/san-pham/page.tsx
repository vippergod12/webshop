import type { Metadata } from "next";
import Link from "next/link";
import { getAllCategories, getAllProducts } from "@/lib/data";
import ProductCard from "@/components/ProductCard";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "Tất cả website mẫu",
  description:
    "Kho 50+ website mẫu Next.js: landing page, ecommerce, portfolio, SaaS dashboard, blog, doanh nghiệp. Demo Vercel sẵn, mua là dùng.",
  alternates: { canonical: "/san-pham" },
};

const SORT_OPTIONS = [
  { v: "newest", label: "Mới nhất" },
  { v: "popular", label: "Phổ biến" },
  { v: "rating", label: "Top đánh giá" },
  { v: "price_asc", label: "Giá: thấp → cao" },
  { v: "price_desc", label: "Giá: cao → thấp" },
];

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: { q?: string; category?: string; sort?: string };
}) {
  const q = searchParams.q?.trim() || null;
  const category = searchParams.category?.trim() || null;
  const sort = (searchParams.sort?.trim() || "newest") as any;

  const [products, categories] = await Promise.all([
    getAllProducts({ q, categorySlug: category, sort, limit: 200 }),
    getAllCategories(),
  ]);

  const buildHref = (next: Record<string, string | null>) => {
    const sp = new URLSearchParams();
    const merged = { q, category, sort, ...next };
    for (const [k, v] of Object.entries(merged)) {
      if (v) sp.set(k, String(v));
    }
    const qs = sp.toString();
    return qs ? `/san-pham?${qs}` : "/san-pham";
  };

  return (
    <>
      <section className="page-hero">
        <div className="container">
          <span className="page-hero__eyebrow">CỬA HÀNG</span>
          <h1 className="page-hero__title">
            Khám phá <span className="text-gradient">{products.length}</span> website mẫu
          </h1>
          <p className="page-hero__lead">
            Mua website Next.js đã build sẵn, demo Vercel trực tiếp, deploy 1-click.
            Lọc theo danh mục, đánh giá, giá để tìm template phù hợp nhất.
          </p>

          <form className="search-bar" action="/san-pham">
            <input
              type="search"
              name="q"
              defaultValue={q || ""}
              placeholder="Tìm theo tên, mô tả, công nghệ..."
            />
            {category ? <input type="hidden" name="category" value={category} /> : null}
            {sort ? <input type="hidden" name="sort" value={sort} /> : null}
            <button type="submit" className="btn btn--primary">
              Tìm kiếm
            </button>
          </form>
        </div>
      </section>

      <section className="container shop">
        <aside className="shop__side">
          <div className="shop__group">
            <h3>Danh mục</h3>
            <ul className="shop__list">
              <li>
                <Link
                  href={buildHref({ category: null })}
                  className={!category ? "is-active" : ""}
                >
                  Tất cả
                </Link>
              </li>
              {categories.map((c) => (
                <li key={c.id}>
                  <Link
                    href={buildHref({ category: c.slug })}
                    className={category === c.slug ? "is-active" : ""}
                  >
                    {c.name}
                    <span className="shop__count">{c.product_count || 0}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="shop__group">
            <h3>Sắp xếp</h3>
            <ul className="shop__list">
              {SORT_OPTIONS.map((s) => (
                <li key={s.v}>
                  <Link
                    href={buildHref({ sort: s.v })}
                    className={sort === s.v ? "is-active" : ""}
                  >
                    {s.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </aside>

        <div className="shop__main">
          <div className="shop__bar">
            <strong>{products.length}</strong> kết quả
            {q ? <> cho "<em>{q}</em>"</> : null}
            {category ? (
              <span className="shop__chip">
                {categories.find((c) => c.slug === category)?.name || category}
                <Link href={buildHref({ category: null })}>×</Link>
              </span>
            ) : null}
          </div>

          {products.length ? (
            <div className="grid grid--cards">
              {products.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          ) : (
            <div className="empty-state empty-state--soft">
              <h3>Không tìm thấy sản phẩm</h3>
              <p>Thử thay đổi bộ lọc hoặc tìm với từ khóa khác.</p>
              <Link href="/san-pham" className="btn btn--primary">
                Xóa bộ lọc
              </Link>
            </div>
          )}
        </div>
      </section>
    </>
  );
}
