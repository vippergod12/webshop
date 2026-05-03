"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { apiFetch, clearToken, getToken } from "@/lib/api-client";
import { SITE_NAME } from "@/lib/seo/siteConfig";
import type { Contact, Review } from "@/lib/types";

const NAV = [
  { href: "/admin", label: "Tổng quan", icon: "🎛", badgeKey: null },
  { href: "/admin/products", label: "Sản phẩm", icon: "🧱", badgeKey: null },
  { href: "/admin/categories", label: "Danh mục", icon: "🗂", badgeKey: null },
  { href: "/admin/reviews", label: "Đánh giá", icon: "⭐", badgeKey: "reviews" },
  { href: "/admin/contacts", label: "Liên hệ", icon: "📩", badgeKey: "contacts" },
] as const;

type Badges = { reviews: number; contacts: number };

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [ready, setReady] = useState(false);
  const [user, setUser] = useState<{ id: number; username: string } | null>(null);
  const [badges, setBadges] = useState<Badges>({ reviews: 0, contacts: 0 });

  const isLogin = pathname?.startsWith("/admin/login");

  // Lấy số pending để hiện badge trên nav. Refresh mỗi khi đổi trang.
  useEffect(() => {
    if (!ready || isLogin) return;
    let cancelled = false;
    Promise.all([
      apiFetch<{ reviews: Review[] }>("/api/reviews?all=1", { auth: true }).catch(
        () => ({ reviews: [] as Review[] })
      ),
      apiFetch<{ contacts: Contact[] }>("/api/contacts?status=new&limit=500", {
        auth: true,
      }).catch(() => ({ contacts: [] as Contact[] })),
    ]).then(([r, c]) => {
      if (cancelled) return;
      setBadges({
        reviews: (r.reviews || []).filter((x) => !x.is_approved).length,
        contacts: (c.contacts || []).length,
      });
    });
    return () => {
      cancelled = true;
    };
  }, [ready, isLogin, pathname]);

  useEffect(() => {
    if (isLogin) {
      setReady(true);
      return;
    }
    const t = getToken();
    if (!t) {
      router.replace("/admin/login");
      return;
    }
    apiFetch<{ user: { id: number; username: string } }>("/api/auth/me", {
      auth: true,
    })
      .then((res) => {
        setUser(res.user);
        setReady(true);
      })
      .catch(() => {
        clearToken();
        router.replace("/admin/login");
      });
  }, [isLogin, router]);

  function logout() {
    clearToken();
    router.replace("/admin/login");
  }

  if (isLogin) {
    return <div className="admin admin--login">{children}</div>;
  }

  if (!ready) {
    return (
      <div className="admin-loading">
        <span className="spinner" /> Đang kiểm tra phiên đăng nhập…
      </div>
    );
  }

  return (
    <div className="admin">
      <aside className="admin__side">
        <Link href="/" className="admin__brand">
          <span className="admin__brand-mark">⚡</span>
          <strong>{SITE_NAME}</strong>
          <span className="admin__brand-tag">Admin</span>
        </Link>
        <nav className="admin__nav">
          {NAV.map((n) => {
            const active =
              n.href === "/admin"
                ? pathname === "/admin"
                : pathname?.startsWith(n.href);
            const count = n.badgeKey ? badges[n.badgeKey] : 0;
            return (
              <Link
                key={n.href}
                href={n.href}
                className={`admin__nav-link ${active ? "is-active" : ""}`}
              >
                <span aria-hidden>{n.icon}</span>
                <span className="admin__nav-label">{n.label}</span>
                {count > 0 ? (
                  <span className="admin__nav-badge" aria-label={`${count} chờ xử lý`}>
                    {count > 99 ? "99+" : count}
                  </span>
                ) : null}
              </Link>
            );
          })}
        </nav>
        <div className="admin__user">
          <div>
            <strong>{user?.username || "—"}</strong>
            <span>Admin</span>
          </div>
          <button type="button" className="btn btn--ghost btn--sm" onClick={logout}>
            Đăng xuất
          </button>
        </div>
      </aside>
      <div className="admin__main">{children}</div>
    </div>
  );
}
