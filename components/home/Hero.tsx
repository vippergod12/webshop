import Link from "next/link";
import type { Product } from "@/lib/types";
import { discountPercent, formatVND } from "@/lib/utils/format";
import { safeImage } from "@/lib/utils/image";
import StarRating from "../StarRating";

type Props = { hero: Product | null; productCount?: number };

export default function Hero({ hero, productCount = 0 }: Props) {
  return (
    <section className="hero">
      <div className="hero__grid container">
        <div className="hero__copy">
          <span className="hero__eyebrow">
            <span className="hero__dot" />
            WEBVAULT — Marketplace Next.js cao cấp
          </span>
          <h1 className="hero__title">
            Mua website mẫu, <span className="text-gradient">deploy 1-click</span>
            <br />
            khởi nghiệp số ngay hôm nay.
          </h1>
          <p className="hero__lead">
            Hơn {productCount}+ template Next.js / Tailwind chất lượng cao: landing page,
            ecommerce, portfolio, SaaS dashboard, blog… Demo Vercel sẵn, code sạch,
            tối ưu SEO 100/100, sẵn sàng đi vào kinh doanh.
          </p>
          <div className="hero__cta">
            <Link href="/san-pham" className="btn btn--primary btn--lg">
              Khám phá kho web →
            </Link>
            <Link href="/lien-he" className="btn btn--ghost btn--lg">
              Đặt thiết kế riêng
            </Link>
          </div>
          <div className="hero__stats">
            <div>
              <strong>{productCount}+</strong>
              <span>Template sẵn</span>
            </div>
            <div>
              <strong>50+</strong>
              <span>Khách hàng</span>
            </div>
            <div>
              <strong>4.9★</strong>
              <span>Đánh giá</span>
            </div>
            <div>
              <strong>24/7</strong>
              <span>Hỗ trợ Zalo</span>
            </div>
          </div>
        </div>

        <div className="hero__visual">
          <div className="hero__glow" aria-hidden />
          {hero ? (
            <Link href={`/san-pham/${hero.slug}`} className="hero__card">
              <div className="hero__card-media">
                <img
                  src={safeImage(hero.thumbnail || hero.images[0])}
                  alt={hero.name}
                  width={920}
                  height={575}
                  decoding="async"
                  fetchPriority="high"
                />
                {discountPercent(hero.price, hero.sale_price) > 0 ? (
                  <span className="hero__card-badge">
                    -{discountPercent(hero.price, hero.sale_price)}%
                  </span>
                ) : null}
              </div>
              <div className="hero__card-body">
                <span className="hero__card-tag">⭐ Featured Hero</span>
                <h3>{hero.name}</h3>
                <p>{hero.short_description}</p>
                <div className="hero__card-foot">
                  <span className="hero__card-price">
                    {formatVND(hero.sale_price ?? hero.price)}
                  </span>
                  <span className="hero__card-rating">
                    <StarRating value={hero.avg_rating || 5} size={14} />
                    <span>
                      {(hero.avg_rating || 5).toFixed(1)} ({hero.review_count || 0})
                    </span>
                  </span>
                </div>
              </div>
            </Link>
          ) : (
            <div className="hero__card hero__card--empty">
              <h3>Sắp ra mắt</h3>
              <p>Chưa có sản phẩm hero. Truy cập admin để chọn 1 sản phẩm làm hero.</p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
