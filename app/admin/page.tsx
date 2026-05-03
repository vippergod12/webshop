"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/api-client";
import type { Category, Contact, Product, Review } from "@/lib/types";
import { formatDateTime } from "@/lib/utils/format";

export default function AdminDashboard() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [pending, setPending] = useState<Review[]>([]);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      apiFetch<{ products: Product[] }>("/api/products?limit=500"),
      apiFetch<{ categories: Category[] }>("/api/categories"),
      apiFetch<{ reviews: Review[] }>("/api/reviews?all=1", { auth: true }),
      apiFetch<{ contacts: Contact[] }>("/api/contacts?limit=500", {
        auth: true,
      }).catch(() => ({ contacts: [] as Contact[] })),
    ])
      .then(([p, c, r, ct]) => {
        setProducts(p.products || []);
        setCategories(c.categories || []);
        setPending((r.reviews || []).filter((x) => !x.is_approved));
        setContacts(ct.contacts || []);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const totalProducts = products.length;
  const totalCategories = categories.length;
  const totalFeatured = products.filter((p) => p.is_featured).length;
  const newContacts = contacts.filter((c) => c.status === "new");
  const recentContacts = contacts.slice(0, 5);

  return (
    <div className="admin-page">
      <header className="admin-page__head">
        <div>
          <h1>Tổng quan</h1>
          <p>Chào mừng trở lại — quản lý sản phẩm, danh mục, đánh giá và liên hệ.</p>
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
        <div className={`kpi ${pending.length ? "kpi--accent" : ""}`}>
          <span className="kpi__label">Review chờ duyệt</span>
          <strong className="kpi__value">{pending.length}</strong>
          <Link href="/admin/reviews" className="kpi__link">Duyệt →</Link>
        </div>
        <div className={`kpi ${newContacts.length ? "kpi--accent" : ""}`}>
          <span className="kpi__label">Liên hệ chờ xử lý</span>
          <strong className="kpi__value">{newContacts.length}</strong>
          <Link href="/admin/contacts" className="kpi__link">Xem ngay →</Link>
        </div>
      </section>

      <div className="admin-dashboard__row">
        <section className="admin-card">
          <header className="admin-card__head">
            <h2>Liên hệ mới nhất</h2>
            <Link href="/admin/contacts" className="link">Xem tất cả →</Link>
          </header>
          {loading ? (
            <p>Đang tải…</p>
          ) : recentContacts.length ? (
            <ul className="pending-list">
              {recentContacts.map((c) => (
                <li key={c.id}>
                  <strong>{c.name}</strong>
                  <span className="pending-list__rating">{c.phone}</span>
                  <span className="pending-list__product">
                    {c.project_type ? <em>{c.project_type}</em> : null}
                    <span className="muted"> · {formatDateTime(c.created_at)}</span>
                  </span>
                  {c.message ? <p>{c.message}</p> : null}
                </li>
              ))}
            </ul>
          ) : (
            <p className="muted">Chưa có liên hệ nào — chia sẻ trang Liên hệ để khách điền form. 🚀</p>
          )}
        </section>

        <section className="admin-card">
          <header className="admin-card__head">
            <h2>Review chờ duyệt</h2>
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
    </div>
  );
}
