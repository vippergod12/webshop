"use client";

import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/api-client";
import type { Review } from "@/lib/types";
import StarRating from "@/components/StarRating";
import { formatDateTime } from "@/lib/utils/format";

type Filter = "all" | "pending" | "approved";

export default function AdminReviewsPage() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<Filter>("pending");

  async function reload() {
    setLoading(true);
    try {
      const res = await apiFetch<{ reviews: Review[] }>(
        "/api/reviews?all=1",
        { auth: true }
      );
      setReviews(res.reviews || []);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    reload();
  }, []);

  async function approve(r: Review) {
    try {
      await apiFetch(`/api/reviews/${r.id}`, {
        method: "PUT",
        auth: true,
        body: JSON.stringify({ is_approved: true }),
      });
      await reload();
    } catch (err: any) {
      alert(err?.message || "Lỗi");
    }
  }

  async function unapprove(r: Review) {
    try {
      await apiFetch(`/api/reviews/${r.id}`, {
        method: "PUT",
        auth: true,
        body: JSON.stringify({ is_approved: false }),
      });
      await reload();
    } catch (err: any) {
      alert(err?.message || "Lỗi");
    }
  }

  async function remove(r: Review) {
    if (!confirm("Xóa review này?")) return;
    try {
      await apiFetch(`/api/reviews/${r.id}`, {
        method: "DELETE",
        auth: true,
      });
      await reload();
    } catch (err: any) {
      alert(err?.message || "Xóa thất bại");
    }
  }

  const filtered = reviews.filter((r) => {
    if (filter === "pending") return !r.is_approved;
    if (filter === "approved") return r.is_approved;
    return true;
  });

  const counts = {
    all: reviews.length,
    pending: reviews.filter((r) => !r.is_approved).length,
    approved: reviews.filter((r) => r.is_approved).length,
  };

  return (
    <div className="admin-page">
      <header className="admin-page__head">
        <div>
          <h1>Đánh giá khách hàng</h1>
          <p>{counts.all} review tổng — duyệt, ẩn hoặc xóa.</p>
        </div>
      </header>

      <div className="admin-tabs">
        {(["pending", "approved", "all"] as Filter[]).map((k) => (
          <button
            key={k}
            type="button"
            className={`admin-tab ${filter === k ? "is-active" : ""}`}
            onClick={() => setFilter(k)}
          >
            {k === "pending" ? "Chờ duyệt" : k === "approved" ? "Đã duyệt" : "Tất cả"}
            <span className="admin-tab__count">{counts[k]}</span>
          </button>
        ))}
      </div>

      {loading ? (
        <p>Đang tải…</p>
      ) : filtered.length ? (
        <ul className="review-admin-list">
          {filtered.map((r) => (
            <li key={r.id} className={r.is_approved ? "is-approved" : "is-pending"}>
              <div className="review-admin-list__head">
                <StarRating value={r.rating} size={14} />
                <strong>{r.customer_name}</strong>
                {r.customer_email ? (
                  <span className="muted">&lt;{r.customer_email}&gt;</span>
                ) : null}
                <span className="muted"> · {formatDateTime(r.created_at)}</span>
                {r.is_approved ? (
                  <span className="status status--ok">Đã duyệt</span>
                ) : (
                  <span className="status status--warn">Chờ duyệt</span>
                )}
              </div>
              {r.title ? <h4>{r.title}</h4> : null}
              <p>{r.comment}</p>
              <footer>
                <span className="muted">
                  Sản phẩm:{" "}
                  {r.product_slug ? (
                    <a
                      href={`/san-pham/${r.product_slug}`}
                      target="_blank"
                      rel="noreferrer"
                      className="link"
                    >
                      {r.product_name}
                    </a>
                  ) : (
                    "—"
                  )}
                </span>
                <div className="review-admin-list__actions">
                  {r.is_approved ? (
                    <button
                      type="button"
                      className="btn btn--sm btn--ghost"
                      onClick={() => unapprove(r)}
                    >
                      Ẩn
                    </button>
                  ) : (
                    <button
                      type="button"
                      className="btn btn--sm btn--primary"
                      onClick={() => approve(r)}
                    >
                      ✓ Duyệt
                    </button>
                  )}
                  <button
                    type="button"
                    className="btn btn--sm btn--danger"
                    onClick={() => remove(r)}
                  >
                    Xóa
                  </button>
                </div>
              </footer>
            </li>
          ))}
        </ul>
      ) : (
        <p className="muted">Không có review nào.</p>
      )}
    </div>
  );
}
