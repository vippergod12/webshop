import Link from "next/link";

export default function NotFound() {
  return (
    <div className="not-found">
      <div className="container">
        <h1>404</h1>
        <p>Trang bạn tìm không tồn tại hoặc đã bị xóa.</p>
        <Link href="/" className="btn btn--primary">
          Về trang chủ
        </Link>
      </div>
    </div>
  );
}
