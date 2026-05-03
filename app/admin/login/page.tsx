"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { apiFetch, setToken } from "@/lib/api-client";
import { SITE_NAME } from "@/lib/seo/siteConfig";

export default function AdminLoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await apiFetch<{ token: string }>("/api/auth/login", {
        method: "POST",
        body: JSON.stringify({ username, password }),
      });
      setToken(res.token);
      router.replace("/admin");
    } catch (err: any) {
      setError(err?.message || "Đăng nhập thất bại");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="login">
      <form className="login__card" onSubmit={onSubmit}>
        <span className="login__logo">⚡</span>
        <h1>{SITE_NAME} Admin</h1>
        <p>Đăng nhập để quản lý sản phẩm, danh mục và đánh giá.</p>

        <label className="field">
          <span>Username</span>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            autoFocus
            required
          />
        </label>
        <label className="field">
          <span>Password</span>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </label>

        {error ? <div className="form-error">{error}</div> : null}

        <button type="submit" className="btn btn--primary btn--lg" disabled={loading}>
          {loading ? "Đang đăng nhập..." : "Đăng nhập"}
        </button>
      </form>
    </div>
  );
}
