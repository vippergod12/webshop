"use client";

import { useEffect } from "react";
import Link from "next/link";

export default function PublicError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[public] route error", error);
  }, [error]);

  return (
    <div className="container empty-state">
      <h1>Có lỗi xảy ra</h1>
      <p>
        Chúng tôi không thể tải trang này. Vui lòng thử lại sau giây lát hoặc
        quay về trang chủ.
      </p>
      <div className="hero__cta" style={{ justifyContent: "center" }}>
        <button type="button" className="btn btn--primary" onClick={reset}>
          Thử lại
        </button>
        <Link href="/" className="btn btn--ghost">
          Về trang chủ
        </Link>
      </div>
    </div>
  );
}
