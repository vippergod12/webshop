"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { apiFetch, clearToken, getToken } from "@/lib/api-client";
import { SITE_NAME } from "@/lib/seo/siteConfig";

const NAV = [
  { href: "/admin", label: "Tổng quan", icon: "🎛" },
  { href: "/admin/products", label: "Sản phẩm", icon: "🧱" },
  { href: "/admin/categories", label: "Danh mục", icon: "🗂" },
  { href: "/admin/reviews", label: "Đánh giá", icon: "⭐" },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [ready, setReady] = useState(false);
  const [user, setUser] = useState<{ id: number; username: string } | null>(null);

  const isLogin = pathname?.startsWith("/admin/login");

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
            return (
              <Link
                key={n.href}
                href={n.href}
                className={`admin__nav-link ${active ? "is-active" : ""}`}
              >
                <span aria-hidden>{n.icon}</span>
                {n.label}
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
