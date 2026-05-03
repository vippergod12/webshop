import type { Metadata } from "next";
import Link from "next/link";
import { SITE_NAME } from "@/lib/seo/siteConfig";

export const metadata: Metadata = {
  title: "Về chúng tôi",
  description:
    "RISE — Reliable · Innovative · Scalable · Efficient. Marketplace website mẫu Next.js cao cấp, đã build sẵn, deploy 1-click trên Vercel.",
  alternates: { canonical: "/ve-chung-toi" },
};

export default function AboutPage() {
  return (
    <>
      <section className="page-hero">
        <div className="container">
          <span className="page-hero__eyebrow">VỀ {SITE_NAME}</span>
          <h1 className="page-hero__title">
            Chúng tôi build website để bạn{" "}
            <span className="text-gradient">tập trung kinh doanh</span>
          </h1>
          <p className="page-hero__lead">
            {SITE_NAME} là marketplace chuyên cung cấp website mẫu Next.js / Tailwind chất lượng cao
            cho doanh nghiệp nhỏ, freelancer và startup. Mọi template đều đã được tối ưu SEO, tốc độ
            và sẵn sàng deploy lên Vercel chỉ bằng một cú click.
          </p>
        </div>
      </section>

      <section className="container about-grid">
        <article className="about-card">
          <span className="about-card__icon">⚡</span>
          <h3>Demo Vercel sẵn</h3>
          <p>Mọi sản phẩm đều có link demo trực tiếp trên Vercel. Xem trước, ưng là chốt.</p>
        </article>
        <article className="about-card">
          <span className="about-card__icon">🧩</span>
          <h3>Code sạch, dễ tùy biến</h3>
          <p>
            Code Next.js 14 + TypeScript + Tailwind, comment tiếng Việt rõ ràng. Tự rebrand trong
            30 phút.
          </p>
        </article>
        <article className="about-card">
          <span className="about-card__icon">🚀</span>
          <h3>Deploy 1-click</h3>
          <p>Push GitHub → Vercel build → online. Không cần devops, không cần server riêng.</p>
        </article>
        <article className="about-card">
          <span className="about-card__icon">🔍</span>
          <h3>SEO chuẩn 100%</h3>
          <p>
            Metadata API per-page, JSON-LD, Sitemap động, ISR 60s, Lighthouse 95+. Lên top
            Google nhanh.
          </p>
        </article>
        <article className="about-card">
          <span className="about-card__icon">💬</span>
          <h3>Hỗ trợ qua Zalo</h3>
          <p>
            Mua xong cần hỗ trợ rebrand, deploy, đổi DB? Inbox Zalo, chúng tôi support nhanh.
          </p>
        </article>
        <article className="about-card">
          <span className="about-card__icon">🛡️</span>
          <h3>Cập nhật miễn phí</h3>
          <p>
            Khi template được nâng cấp, khách hàng đã mua nhận bản mới miễn phí trong vòng 6 tháng.
          </p>
        </article>
      </section>

      <section className="container about-cta">
        <h2>Sẵn sàng bắt đầu?</h2>
        <p>Lướt kho 50+ template hoặc liên hệ chúng tôi để đặt thiết kế riêng cho brand của bạn.</p>
        <div className="hero__cta">
          <Link href="/san-pham" className="btn btn--primary btn--lg">
            Khám phá kho web →
          </Link>
          <Link href="/lien-he" className="btn btn--ghost btn--lg">
            Đặt thiết kế riêng
          </Link>
        </div>
      </section>
    </>
  );
}
