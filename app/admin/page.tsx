"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/api-client";
import type { Category, Product, Review } from "@/lib/types";

export default function AdminDashboard() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [pending, setPending] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      apiFetch<{ products: Product[] }>("/api/products?limit=500"),
      apiFetch<{ categories: Category[] }>("/api/categories"),
      apiFetch<{ reviews: Review[] }>("/api/reviews?all=1", { auth: true }),
    ])
      .then(([p, c, r]) => {
        setProducts(p.products || []);
        setCategories(c.categories || []);
        setPending((r.reviews || []).filter((x) => !x.is_approved));
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const totalProducts = products.length;
  const totalCategories = categories.length;
  const totalFeatured = products.filter((p) => p.is_featured).length;

  return (
    <div className="admin-page">
      <header className="admin-page__head">
        <div>
          <h1>Tổng quan</h1>
          <p>Chào mừng trở lại — quản lý sản phẩm, danh mục và đánh giá.</p>
        </div>
        <div className="admin-page__actions">
          <Link href="/admin/products" className="btn btn--primary">
            + Thêm sản phẩm
          </Link>
        </div>
      </header>

      <section className="kpi-grid">
        <div className="kpi">
          <span className="kpi__label">Tổng sản phẩm</span>
          <strong className="kpi__value">{totalProducts}</strong>
          <Link href="/admin/products" className="kpi__link">Quản lý →</Link>
        </div>
        <div className="kpi">
          <span className="kpi__label">Danh mục</span>
          <strong className="kpi__value">{totalCategories}</strong>
          <Link href="/admin/categories" className="kpi__link">Quản lý →</Link>
        </div>
        <div className="kpi">
          <span className="kpi__label">Featured</span>
          <strong className="kpi__value">{totalFeatured}</strong>
          <Link href="/admin/products?featured=1" className="kpi__link">Xem →</Link>
        </div>
        <div className="kpi kpi--accent">
          <span className="kpi__label">Review chờ duyệt</span>
          <strong className="kpi__value">{pending.length}</strong>
          <Link href="/admin/reviews" className="kpi__link">Duyệt ngay →</Link>
        </div>
      </section>

      <section className="admin-card">
        <header className="admin-card__head">
          <h2>Review mới chờ duyệt</h2>
          <Link href="/admin/reviews" className="link">Xem tất cả →</Link>
        </header>
        {loading ? (
          <p>Đang tải…</p>
        ) : pending.length ? (
          <ul className="pending-list">
            {pending.slice(0, 5).map((r) => (
              <li key={r.id}>
                <strong>{r.customer_name}</strong>
                <span className="pending-list__rating">★ {r.rating}/5</span>
                <span className="pending-list__product">
                  trên <em>{r.product_name || "—"}</em>
                </span>
                <p>{r.comment}</p>
              </li>
            ))}
          </ul>
        ) : (
          <p className="muted">Không có review nào đang chờ duyệt. 🎉</p>
        )}
      </section>
    </div>
  );
}
