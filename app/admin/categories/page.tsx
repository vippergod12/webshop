"use client";

import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/api-client";
import type { Category } from "@/lib/types";
import Modal from "@/components/Modal";
import { slugify } from "@/lib/utils/slug";
import { safeImage } from "@/lib/utils/image";

type FormState = {
  id?: number;
  name: string;
  slug: string;
  description: string;
  image_url: string;
  icon: string;
  sort_order: string;
};

const EMPTY: FormState = {
  name: "",
  slug: "",
  description: "",
  image_url: "",
  icon: "",
  sort_order: "0",
};

export default function AdminCategoriesPage() {
  const [list, setList] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<FormState>(EMPTY);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [reordering, setReordering] = useState<number | null>(null);

  async function reload() {
    setLoading(true);
    try {
      const res = await apiFetch<{ categories: Category[] }>("/api/categories");
      setList(res.categories || []);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    reload();
  }, []);

  /**
   * Đổi vị trí danh mục với hàng kế tiếp/trước đó bằng cách swap sort_order.
   * Hai PUT call cho 2 hàng — đơn giản, không cần endpoint bulk.
   */
  async function move(idx: number, dir: -1 | 1) {
    const target = idx + dir;
    if (target < 0 || target >= list.length) return;
    const a = list[idx];
    const b = list[target];
    const aOrder = a.sort_order ?? 0;
    const bOrder = b.sort_order ?? 0;
    // Nếu sort_order trùng nhau, vẫn swap dùng pos thay thế.
    const newA = aOrder === bOrder ? bOrder + dir : bOrder;
    const newB = aOrder === bOrder ? aOrder - dir : aOrder;

    setReordering(a.id);
    // Optimistic update
    const next = [...list];
    next[idx] = { ...a, sort_order: newA };
    next[target] = { ...b, sort_order: newB };
    next.sort(
      (x, y) => (x.sort_order ?? 0) - (y.sort_order ?? 0) || x.id - y.id
    );
    setList(next);

    try {
      await Promise.all([
        apiFetch(`/api/categories/${a.id}`, {
          method: "PUT",
          auth: true,
          body: JSON.stringify({ sort_order: newA }),
        }),
        apiFetch(`/api/categories/${b.id}`, {
          method: "PUT",
          auth: true,
          body: JSON.stringify({ sort_order: newB }),
        }),
      ]);
    } catch (err: any) {
      alert(err?.message || "Đổi thứ tự thất bại, đang reload...");
      await reload();
    } finally {
      setReordering(null);
    }
  }

  function openCreate() {
    setForm({ ...EMPTY });
    setError(null);
    setOpen(true);
  }

  function openEdit(c: Category) {
    setForm({
      id: c.id,
      name: c.name,
      slug: c.slug,
      description: c.description || "",
      image_url: c.image_url || "",
      icon: c.icon || "",
      sort_order: String(c.sort_order ?? 0),
    });
    setError(null);
    setOpen(true);
  }

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSaving(true);
    const payload = {
      name: form.name.trim(),
      slug: form.slug.trim() || slugify(form.name),
      description: form.description.trim() || null,
      image_url: form.image_url.trim() || null,
      icon: form.icon.trim() || null,
      sort_order: Number(form.sort_order) || 0,
    };
    try {
      if (!payload.name) throw new Error("Vui lòng nhập tên danh mục");
      if (form.id) {
        await apiFetch(`/api/categories/${form.id}`, {
          method: "PUT",
          auth: true,
          body: JSON.stringify(payload),
        });
      } else {
        await apiFetch("/api/categories", {
          method: "POST",
          auth: true,
          body: JSON.stringify(payload),
        });
      }
      setOpen(false);
      await reload();
    } catch (err: any) {
      setError(err?.message || "Lưu thất bại");
    } finally {
      setSaving(false);
    }
  }

  async function remove(c: Category) {
    if (!confirm(`Xóa danh mục "${c.name}"? Hành động này sẽ huỷ liên kết các sản phẩm.`))
      return;
    try {
      await apiFetch(`/api/categories/${c.id}`, { method: "DELETE", auth: true });
      await reload();
    } catch (err: any) {
      alert(err?.message || "Xóa thất bại");
    }
  }

  return (
    <div className="admin-page">
      <header className="admin-page__head">
        <div>
          <h1>Danh mục</h1>
          <p>{list.length} danh mục — tổ chức website mẫu của bạn theo lĩnh vực.</p>
        </div>
        <div className="admin-page__actions">
          <button type="button" className="btn btn--primary" onClick={openCreate}>
            + Thêm danh mục
          </button>
        </div>
      </header>

      {loading ? (
        <p>Đang tải…</p>
      ) : (
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th style={{ width: 80 }}>Thứ tự</th>
                <th>Danh mục</th>
                <th>Slug</th>
                <th>Sản phẩm</th>
                <th>Hành động</th>
              </tr>
            </thead>
            <tbody>
              {list.map((c, i) => (
                <tr key={c.id} className={reordering === c.id ? "is-busy" : ""}>
                  <td>
                    <div className="sort-cell">
                      <button
                        type="button"
                        className="sort-btn"
                        onClick={() => move(i, -1)}
                        disabled={i === 0 || reordering !== null}
                        aria-label="Chuyển lên"
                        title="Chuyển lên"
                      >
                        ▲
                      </button>
                      <span className="sort-cell__num" aria-label="Sort order">
                        {c.sort_order ?? 0}
                      </span>
                      <button
                        type="button"
                        className="sort-btn"
                        onClick={() => move(i, 1)}
                        disabled={i === list.length - 1 || reordering !== null}
                        aria-label="Chuyển xuống"
                        title="Chuyển xuống"
                      >
                        ▼
                      </button>
                    </div>
                  </td>
                  <td>
                    <div className="cell-product">
                      <img src={safeImage(c.image_url)} alt="" />
                      <div>
                        <strong>{c.name}</strong>
                        <span className="muted">{c.description}</span>
                      </div>
                    </div>
                  </td>
                  <td><code>/{c.slug}</code></td>
                  <td>{c.product_count ?? 0}</td>
                  <td>
                    <button
                      type="button"
                      className="btn btn--sm btn--ghost"
                      onClick={() => openEdit(c)}
                    >
                      Sửa
                    </button>
                    <button
                      type="button"
                      className="btn btn--sm btn--danger"
                      onClick={() => remove(c)}
                    >
                      Xóa
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title={form.id ? "Sửa danh mục" : "Thêm danh mục"}
      >
        <form onSubmit={save} className="admin-form">
          <div className="admin-form__grid">
            <label className="field field--span-2">
              <span>Tên danh mục *</span>
              <input
                value={form.name}
                onChange={(e) =>
                  setForm({
                    ...form,
                    name: e.target.value,
                    slug: form.slug || slugify(e.target.value),
                  })
                }
                required
              />
            </label>
            <label className="field">
              <span>Slug</span>
              <input
                value={form.slug}
                onChange={(e) => setForm({ ...form, slug: e.target.value })}
              />
            </label>
            <label className="field field--span-3">
              <span>Mô tả</span>
              <textarea
                rows={3}
                value={form.description}
                onChange={(e) =>
                  setForm({ ...form, description: e.target.value })
                }
              />
            </label>
            <label className="field field--span-2">
              <span>Image URL</span>
              <input
                type="url"
                value={form.image_url}
                onChange={(e) =>
                  setForm({ ...form, image_url: e.target.value })
                }
                placeholder="https://..."
              />
            </label>
            <label className="field">
              <span>Sort order</span>
              <input
                type="number"
                value={form.sort_order}
                onChange={(e) =>
                  setForm({ ...form, sort_order: e.target.value })
                }
              />
            </label>
          </div>

          {error ? <div className="form-error">{error}</div> : null}

          <div className="admin-form__foot">
            <button type="button" className="btn btn--ghost" onClick={() => setOpen(false)}>
              Hủy
            </button>
            <button type="submit" className="btn btn--primary" disabled={saving}>
              {saving ? "Đang lưu..." : form.id ? "Cập nhật" : "Tạo mới"}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
