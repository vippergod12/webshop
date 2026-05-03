import type { Metadata } from "next";
import Link from "next/link";
import { getAllCategories, getAllProducts } from "@/lib/data";
import ProductCard from "@/components/ProductCard";
import FilterLink, { FilterScope } from "@/components/FilterLink";
import ShopGrid from "@/components/ShopGrid";
import SortSelect from "@/components/SortSelect";
import SearchInput from "@/components/SearchInput";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "Tất cả website mẫu",
  description:
    "Kho 50+ website mẫu Next.js: landing page, ecommerce, portfolio, SaaS dashboard, blog, doanh nghiệp. Demo Vercel sẵn, mua là dùng.",
  alternates: { canonical: "/san-pham" },
};

const SORT_OPTIONS = [
  { value: "newest", label: "Mới nhất" },
  { value: "popular", label: "Phổ biến" },
  { value: "rating", label: "Top đánh giá" },
  { value: "price_asc", label: "Giá: thấp → cao" },
  { value: "price_desc", label: "Giá: cao → thấp" },
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
    <FilterScope>
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

          <SearchInput
            initialValue={q || ""}
            category={category}
            sort={sort}
          />
        </div>
      </section>

      <section className="container shop">
        <aside className="shop__side">
          <div className="shop__group">
            <h3>Danh mục</h3>
            <ul className="shop__list">
              <li>
                <FilterLink
                  href={buildHref({ category: null })}
                  className={!category ? "is-active" : ""}
                >
                  Tất cả
                </FilterLink>
              </li>
              {categories.map((c) => (
                <li key={c.id}>
                  <FilterLink
                    href={buildHref({ category: c.slug })}
                    className={category === c.slug ? "is-active" : ""}
                  >
                    {c.name}
                    <span className="shop__count">{c.product_count || 0}</span>
                  </FilterLink>
                </li>
              ))}
            </ul>
          </div>
        </aside>

        <div className="shop__main">
          <div className="shop__bar">
            <div className="shop__bar-left">
              <strong>{products.length}</strong>
              <span>kết quả</span>
              {q ? (
                <span className="shop__chip">
                  &quot;{q}&quot;
                  <FilterLink href={buildHref({ q: null })} aria-label="Bỏ từ khóa">
                    ×
                  </FilterLink>
                </span>
              ) : null}
              {category ? (
                <span className="shop__chip">
                  {categories.find((c) => c.slug === category)?.name || category}
                  <FilterLink href={buildHref({ category: null })} aria-label="Bỏ lọc danh mục">
                    ×
                  </FilterLink>
                </span>
              ) : null}
            </div>
            <div className="shop__bar-right">
              <SortSelect
                value={sort}
                options={SORT_OPTIONS.map((o) => ({
                  ...o,
                  href: buildHref({ sort: o.value }),
                }))}
              />
            </div>
          </div>

          {products.length ? (
            <ShopGrid>
              <div className="grid grid--cards">
                {products.map((p, i) => (
                  <ProductCard key={p.id} product={p} priority={i < 4} />
                ))}
              </div>
            </ShopGrid>
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
    </FilterScope>
  );
}
