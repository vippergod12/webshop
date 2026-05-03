import Link from "next/link";
import type { Product } from "@/lib/types";
import { discountPercent, formatVND } from "@/lib/utils/format";
import SafeImage from "./SafeImage";
import SmartLink from "./SmartLink";
import StarRating from "./StarRating";

type Props = {
  product: Product;
  compact?: boolean;
  /** Mark above-the-fold cards (e.g. first row) so the image is preloaded. */
  priority?: boolean;
};

const CARD_SIZES =
  "(max-width: 640px) 100vw, (max-width: 1024px) 50vw, (max-width: 1440px) 33vw, 320px";

export default function ProductCard({ product, compact, priority }: Props) {
  const discount = discountPercent(product.price, product.sale_price);
  const cover = product.thumbnail || product.images[0];
  const finalPrice = product.sale_price ?? product.price;
  const rating = product.avg_rating || 0;
  const reviewCount = product.review_count || 0;
  const detailHref = `/san-pham/${product.slug}`;

  return (
    <article className={`pcard ${compact ? "pcard--compact" : ""}`}>
      <SmartLink
        href={detailHref}
        className="pcard__media"
        aria-label={product.name}
      >
        <SafeImage
          src={cover}
          alt={`Ảnh xem trước ${product.name}`}
          width={640}
          height={400}
          sizes={CARD_SIZES}
          priority={priority}
          loading={priority ? undefined : "lazy"}
        />
        {discount > 0 ? (
          <span className="pcard__badge pcard__badge--sale">-{discount}%</span>
        ) : null}
        {product.is_featured ? (
          <span className="pcard__badge pcard__badge--feat">Featured</span>
        ) : null}
        <div className="pcard__overlay">
          <span className="pcard__overlay-text">Xem chi tiết →</span>
        </div>
      </SmartLink>

      <div className="pcard__body">
        <div className="pcard__meta">
          {product.category_name ? (
            <Link
              href={`/danh-muc/${product.category_slug}`}
              className="pcard__cat"
              prefetch={false}
            >
              {product.category_name}
            </Link>
          ) : <span />}
          <span className="pcard__rating">
            <StarRating value={rating} size={13} />
            <span className="pcard__rating-num">
              {rating ? rating.toFixed(1) : "—"}
              {reviewCount ? ` (${reviewCount})` : ""}
            </span>
          </span>
        </div>

        <h3 className="pcard__title">
          <SmartLink href={detailHref}>{product.name}</SmartLink>
        </h3>

        {product.short_description ? (
          <p className="pcard__desc">{product.short_description}</p>
        ) : null}

        {product.tech_stack?.length ? (
          <div className="pcard__chips">
            {product.tech_stack.slice(0, 3).map((t) => (
              <span key={t} className="chip">{t}</span>
            ))}
          </div>
        ) : null}

        <div className="pcard__foot">
          <div className="pcard__price">
            <span className="pcard__price-main">{formatVND(finalPrice)}</span>
            {product.sale_price ? (
              <span className="pcard__price-old">{formatVND(product.price)}</span>
            ) : null}
          </div>
          {product.demo_url ? (
            <a
              className="pcard__demo"
              href={product.demo_url}
              target="_blank"
              rel="noreferrer"
            >
              Demo ↗
            </a>
          ) : null}
        </div>
      </div>
    </article>
  );
}
