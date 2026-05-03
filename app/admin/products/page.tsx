"use client";

import { useEffect, useMemo, useState } from "react";
import { apiFetch } from "@/lib/api-client";
import type { Category, Product } from "@/lib/types";
import Modal from "@/components/Modal";
import ImagePicker from "@/components/ImagePicker";
import { formatVND } from "@/lib/utils/format";
import { slugify } from "@/lib/utils/slug";
import { safeImage } from "@/lib/utils/image";

type FormState = {
  id?: number;
  name: string;
  slug: string;
  category_id: string;
  short_description: string;
  long_description: string;
  price: string;
  sale_price: string;
  demo_url: string;
  repo_url: string;
  thumbnail: string;
  images: string[];
  tech_stack: string;
  features: string;
  tags: string;
  is_featured: boolean;
  is_hero: boolean;
  is_published: boolean;
  sort_order: string;
};

const EMPTY: FormState = {
  name: "",
  slug: "",
  category_id: "",
  short_description: "",
  long_description: "",
  price: "0",
  sale_price: "",
  demo_url: "",
  repo_url: "",
  thumbnail: "",
  images: [],
  tech_stack: "",
  features: "",
  tags: "",
  is_featured: false,
  is_hero: false,
  is_published: true,
  sort_order: "0",
};

function fromProduct(p: Product): FormState {
  return {
    id: p.id,
    name: p.name,
    slug: p.slug,
    category_id: p.category_id ? String(p.category_id) : "",
    short_description: p.short_description || "",
    long_description: p.long_description || "",
    price: String(p.price ?? 0),
    sale_price: p.sale_price !== null ? String(p.sale_price) : "",
    demo_url: p.demo_url || "",
    repo_url: p.repo_url || "",
    thumbnail: p.thumbnail || "",
    images: p.images || [],
    tech_stack: (p.tech_stack || []).join(", "),
    features: (p.features || []).join("\n"),
    tags: (p.tags || []).join(", "),
    is_featured: !!p.is_featured,
    is_hero: !!p.is_hero,
    is_published: p.is_published !== false,
    sort_order: String(p.sort_order ?? 0),
  };
}

function toPayload(f: FormState) {
  return {
    name: f.name.trim(),
    slug: f.slug.trim() || slugify(f.name),
    category_id: f.category_id ? Number(f.category_id) : null,
    short_description: f.short_description.trim() || null,
    long_description: f.long_description.trim() || null,
    price: Number(f.price) || 0,
    sale_price: f.sale_price === "" ? null : Number(f.sale_price),
    demo_url: f.demo_url.trim() || null,
    repo_url: f.repo_url.trim() || null,
    thumbnail: f.thumbnail.trim() || null,
    images: f.images,
    tech_stack: f.tech_stack
      .split(/[,\n]/)
      .map((s) => s.trim())
      .filter(Boolean),
    features: f.features
      .split(/\n/)
      .map((s) => s.trim())
      .filter(Boolean),
    tags: f.tags
      .split(/[,\n]/)
      .map((s) => s.trim())
      .filter(Boolean),
    is_featured: f.is_featured,
    is_hero: f.is_hero,
    is_published: f.is_published,
    sort_order: Number(f.sort_order) || 0,
  };
}

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterCat, setFilterCat] = useState<string>("");
  const [search, setSearch] = useState("");

  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<FormState>(EMPTY);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function reload() {
    setLoading(true);
    try {
      const [p, c] = await Promise.all([
        apiFetch<{ products: Product[] }>("/api/products?limit=500"),
        apiFetch<{ categories: Category[] }>("/api/categories"),
      ]);
      setProducts(p.products || []);
      setCategories(c.categories || []);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    reload();
  }, []);

  const filtered = useMemo(() => {
    return products.filter((p) => {
      if (filterCat && String(p.category_id) !== filterCat) return false;
      if (search) {
        const q = search.toLowerCase();
        if (
          !p.name.toLowerCase().includes(q) &&
          !p.slug.toLowerCase().includes(q)
        )
          return false;
      }
      return true;
    });
  }, [products, filterCat, search]);

  function openCreate() {
    setForm({ ...EMPTY });
    setError(null);
    setOpen(true);
  }

  function openEdit(p: Product) {
    setForm(fromProduct(p));
    setError(null);
    setOpen(true);
  }

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSaving(true);
    try {
      const payload = toPayload(form);
      if (!payload.name) throw new Error("Vui lòng nhập tên sản phẩm");
      if (form.id) {
        await apiFetch(`/api/products/${form.id}`, {
          method: "PUT",
          auth: true,
          body: JSON.stringify(payload),
        });
      } else {
        await apiFetch("/api/products", {
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

  async function remove(p: Product) {
    if (!confirm(`Xóa sản phẩm "${p.name}"?`)) return;
    try {
      await apiFetch(`/api/products/${p.id}`, { method: "DELETE", auth: true });
      await reload();
    } catch (err: any) {
      alert(err?.message || "Xóa thất bại");
    }
  }

  return (
    <div className="admin-page">
      <header className="admin-page__head">
        <div>
          <h1>Sản phẩm</h1>
          <p>{products.length} sản phẩm — quản lý template, link Vercel, tech stack, ảnh.</p>
        </div>
        <div className="admin-page__actions">
          <button type="button" className="btn btn--primary" onClick={openCreate}>
            + Thêm sản phẩm
          </button>
        </div>
      </header>

      <div className="admin-toolbar">
        <input
          type="search"
          placeholder="Tìm theo tên hoặc slug..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <select
          value={filterCat}
          onChange={(e) => setFilterCat(e.target.value)}
        >
          <option value="">Tất cả danh mục</option>
          {categories.map((c) => (
            <option key={c.id} value={String(c.id)}>
              {c.name}
            </option>
          ))}
        </select>
      </div>

      {loading ? (
        <p>Đang tải…</p>
      ) : (
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Sản phẩm</th>
                <th>Danh mục</th>
                <th>Giá</th>
                <th>Demo</th>
                <th>Trạng thái</th>
                <th>Hành động</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((p) => (
                <tr key={p.id}>
                  <td>
                    <div className="cell-product">
                      <img src={safeImage(p.thumbnail || p.images?.[0])} alt="" />
                      <div>
                        <strong>{p.name}</strong>
                        <span className="muted">/{p.slug}</span>
                      </div>
                    </div>
                  </td>
                  <td>{categories.find((c) => c.id === p.category_id)?.name || "—"}</td>
                  <td>
                    {p.sale_price ? (
                      <>
                        <strong>{formatVND(p.sale_price)}</strong>
                        <br />
                        <s className="muted">{formatVND(p.price)}</s>
                      </>
                    ) : (
                      <strong>{formatVND(p.price)}</strong>
                    )}
                  </td>
                  <td>
                    {p.demo_url ? (
                      <a href={p.demo_url} target="_blank" rel="noreferrer" className="link">
                        Vercel ↗
                      </a>
                    ) : (
                      <span className="muted">—</span>
                    )}
                  </td>
                  <td>
                    <div className="badges-col">
                      {p.is_published ? (
                        <span className="status status--ok">Live</span>
                      ) : (
                        <span className="status status--off">Ẩn</span>
                      )}
                      {p.is_featured ? (
                        <span className="status status--accent">Featured</span>
                      ) : null}
                      {p.is_hero ? (
                        <span className="status status--hero">Hero</span>
                      ) : null}
                    </div>
                  </td>
                  <td>
                    <button
                      type="button"
                      className="btn btn--sm btn--ghost"
                      onClick={() => openEdit(p)}
                    >
                      Sửa
                    </button>
                    <button
                      type="button"
                      className="btn btn--sm btn--danger"
                      onClick={() => remove(p)}
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
        title={form.id ? "Sửa sản phẩm" : "Thêm sản phẩm"}
        size="lg"
      >
        <form onSubmit={save} className="admin-form">
          <div className="admin-form__grid">
            <label className="field field--span-2">
              <span>Tên sản phẩm *</span>
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
                placeholder="auto-generated"
              />
            </label>
            <label className="field">
              <span>Danh mục</span>
              <select
                value={form.category_id}
                onChange={(e) => setForm({ ...form, category_id: e.target.value })}
              >
                <option value="">— Không —</option>
                {categories.map((c) => (
                  <option key={c.id} value={String(c.id)}>
                    {c.name}
                  </option>
                ))}
              </select>
            </label>

            <label className="field field--span-3">
              <span>Mô tả ngắn</span>
              <input
                value={form.short_description}
                onChange={(e) =>
                  setForm({ ...form, short_description: e.target.value })
                }
                placeholder="1-2 câu giới thiệu sản phẩm"
              />
            </label>

            <label className="field field--span-3">
              <span>Mô tả chi tiết</span>
              <textarea
                rows={5}
                value={form.long_description}
                onChange={(e) =>
                  setForm({ ...form, long_description: e.target.value })
                }
              />
            </label>

            <label className="field">
              <span>Giá (VND) *</span>
              <input
                type="number"
                value={form.price}
                onChange={(e) => setForm({ ...form, price: e.target.value })}
              />
            </label>
            <label className="field">
              <span>Giá sale (VND)</span>
              <input
                type="number"
                value={form.sale_price}
                onChange={(e) =>
                  setForm({ ...form, sale_price: e.target.value })
                }
                placeholder="Bỏ trống = không sale"
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

            <label className="field field--span-3">
              <span>🔗 Demo URL (Vercel)</span>
              <input
                type="url"
                value={form.demo_url}
                onChange={(e) => setForm({ ...form, demo_url: e.target.value })}
                placeholder="https://your-site.vercel.app"
              />
            </label>
            <label className="field field--span-3">
              <span>📦 Repo URL (GitHub) — không bắt buộc</span>
              <input
                type="url"
                value={form.repo_url}
                onChange={(e) => setForm({ ...form, repo_url: e.target.value })}
                placeholder="https://github.com/your-org/your-repo"
              />
            </label>

            <label className="field field--span-3">
              <span>Thumbnail URL</span>
              <input
                type="url"
                value={form.thumbnail}
                onChange={(e) =>
                  setForm({ ...form, thumbnail: e.target.value })
                }
                placeholder="https://..."
              />
            </label>

            <div className="field field--span-3">
              <ImagePicker
                label="Ảnh gallery"
                values={form.images}
                onChange={(images) => setForm({ ...form, images })}
              />
            </div>

            <label className="field field--span-3">
              <span>Tech stack (phân cách dấu phẩy)</span>
              <input
                value={form.tech_stack}
                onChange={(e) =>
                  setForm({ ...form, tech_stack: e.target.value })
                }
                placeholder="Next.js 14, TypeScript, TailwindCSS"
              />
            </label>

            <label className="field field--span-3">
              <span>Tính năng (mỗi dòng 1 tính năng)</span>
              <textarea
                rows={4}
                value={form.features}
                onChange={(e) =>
                  setForm({ ...form, features: e.target.value })
                }
                placeholder={`Hero animation\nPricing 3 gói\nDark mode`}
              />
            </label>

            <label className="field field--span-3">
              <span>Tags (phân cách dấu phẩy)</span>
              <input
                value={form.tags}
                onChange={(e) => setForm({ ...form, tags: e.target.value })}
                placeholder="saas, landing, modern"
              />
            </label>

            <div className="field field--span-3 admin-form__toggles">
              <label className="check">
                <input
                  type="checkbox"
                  checked={form.is_published}
                  onChange={(e) =>
                    setForm({ ...form, is_published: e.target.checked })
                  }
                />
                Hiển thị công khai
              </label>
              <label className="check">
                <input
                  type="checkbox"
                  checked={form.is_featured}
                  onChange={(e) =>
                    setForm({ ...form, is_featured: e.target.checked })
                  }
                />
                ⭐ Featured
              </label>
              <label className="check">
                <input
                  type="checkbox"
                  checked={form.is_hero}
                  onChange={(e) =>
                    setForm({ ...form, is_hero: e.target.checked })
                  }
                />
                🚀 Hero (chỉ 1 sản phẩm hero)
              </label>
            </div>
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
