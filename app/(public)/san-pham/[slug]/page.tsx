import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  getApprovedReviews,
  getProductBySlug,
  getRelatedProducts,
  incrementProductViews,
} from "@/lib/data";
import { breadcrumbLd, productLd } from "@/lib/seo/jsonld";
import { SITE_NAME, SITE_URL } from "@/lib/seo/siteConfig";
import { discountPercent, formatVND } from "@/lib/utils/format";
import { buildZaloUrl } from "@/lib/utils/zalo";
import StarRating from "@/components/StarRating";
import ProductCard from "@/components/ProductCard";
import ReviewList from "@/components/ReviewList";
import LazyReviewForm from "@/components/LazyReviewForm";
import ProductGallery from "./ProductGallery";

export const revalidate = 60;

type PageProps = { params: { slug: string } };

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const product = await getProductBySlug(params.slug);
  if (!product) return { title: "Không tìm thấy" };
  const url = `/san-pham/${product.slug}`;
  const title = product.name;
  const description =
    product.short_description || product.long_description?.slice(0, 200) || product.name;
  const images = product.images?.length
    ? product.images
    : product.thumbnail
    ? [product.thumbnail]
    : [];
  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: {
      title: `${title} · ${SITE_NAME}`,
      description,
      url,
      type: "website",
      images,
    },
  };
}

export default async function ProductDetailPage({ params }: PageProps) {
  const product = await getProductBySlug(params.slug);
  if (!product) notFound();

  const [reviews, related] = await Promise.all([
    getApprovedReviews(product.id),
    getRelatedProducts(product, 4),
  ]);

  // best-effort, don't await blocking
  incrementProductViews(product.id).catch(() => {});

  const finalPrice = product.sale_price ?? product.price;
  const discount = discountPercent(product.price, product.sale_price);
  const zaloMessage = `Chào ${SITE_NAME}, mình muốn mua "${product.name}" (giá ${formatVND(finalPrice)}).`;
  const zaloHref = buildZaloUrl(zaloMessage);

  const ld = productLd(product, reviews);
  const breadcrumb = breadcrumbLd([
    { name: "Trang chủ", url: SITE_URL },
    { name: "Sản phẩm", url: `${SITE_URL}/san-pham` },
    {
      name: product.category_name || "Danh mục",
      url: `${SITE_URL}/danh-muc/${product.category_slug || ""}`,
    },
    { name: product.name, url: `${SITE_URL}/san-pham/${product.slug}` },
  ]);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(ld) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumb) }}
      />

      <nav className="container breadcrumb" aria-label="Breadcrumb">
        <Link href="/">Trang chủ</Link>
        <span>/</span>
        <Link href="/san-pham">Sản phẩm</Link>
        {product.category_slug ? (
          <>
            <span>/</span>
            <Link href={`/danh-muc/${product.category_slug}`}>
              {product.category_name}
            </Link>
          </>
        ) : null}
        <span>/</span>
        <span aria-current="page">{product.name}</span>
      </nav>

      <section className="container product-detail">
        <ProductGallery images={product.images} alt={product.name} />

        <div className="product-detail__info">
          {product.is_featured ? (
            <span className="badge badge--accent">⭐ Featured</span>
          ) : null}
          <h1 className="product-detail__title">{product.name}</h1>

          <div className="product-detail__rating">
            <StarRating value={product.avg_rating || 0} size={18} />
            <span>
              {product.avg_rating ? (product.avg_rating || 0).toFixed(1) : "Chưa có"} ·{" "}
              {product.review_count || 0} đánh giá
            </span>
          </div>

          {product.short_description ? (
            <p className="product-detail__lead">{product.short_description}</p>
          ) : null}

          <div className="product-detail__price">
            <span className="price-main">{formatVND(finalPrice)}</span>
            {product.sale_price ? (
              <>
                <span className="price-old">{formatVND(product.price)}</span>
                <span className="price-discount">-{discount}%</span>
              </>
            ) : null}
          </div>

          {product.tech_stack?.length ? (
            <div className="product-detail__chips">
              {product.tech_stack.map((t) => (
                <span key={t} className="chip">{t}</span>
              ))}
            </div>
          ) : null}

          <div className="product-detail__actions">
            <a
              href={zaloHref}
              target="_blank"
              rel="noreferrer"
              className="btn btn--primary btn--lg"
            >
              💬 Mua qua Zalo
            </a>
            {product.demo_url ? (
              <a
                href={product.demo_url}
                target="_blank"
                rel="noreferrer"
                className="btn btn--ghost btn--lg"
              >
                🔗 Xem demo Vercel
              </a>
            ) : null}
            {product.repo_url ? (
              <a
                href={product.repo_url}
                target="_blank"
                rel="noreferrer"
                className="btn btn--ghost btn--lg"
              >
                ⚡ Xem GitHub
              </a>
            ) : null}
          </div>

          {product.features?.length ? (
            <div className="product-detail__features">
              <h3>✅ Tính năng nổi bật</h3>
              <ul>
                {product.features.map((f) => (
                  <li key={f}>{f}</li>
                ))}
              </ul>
            </div>
          ) : null}
        </div>
      </section>

      {product.long_description ? (
        <section className="container product-section">
          <h2>Mô tả chi tiết</h2>
          <div className="prose">
            {product.long_description.split("\n").map((para, i) => (
              <p key={i}>{para}</p>
            ))}
          </div>
        </section>
      ) : null}

      <section className="container product-section">
        <header className="section__head">
          <div>
            <span className="section__eyebrow">ĐÁNH GIÁ</span>
            <h2 className="section__title">
              {product.review_count || 0} đánh giá từ khách hàng
            </h2>
          </div>
          <div className="rating-summary">
            <strong>{(product.avg_rating || 0).toFixed(1)}</strong>
            <StarRating value={product.avg_rating || 0} size={20} />
            <span>{product.review_count || 0} review</span>
          </div>
        </header>

        <div className="reviews-grid">
          <div>
            <ReviewList reviews={reviews} />
          </div>
          <div>
            <LazyReviewForm productId={product.id} />
          </div>
        </div>
      </section>

      {related.length ? (
        <section className="container product-section">
          <header className="section__head">
            <div>
              <span className="section__eyebrow">CÓ THỂ BẠN THÍCH</span>
              <h2 className="section__title">Sản phẩm liên quan</h2>
            </div>
          </header>
          <div className="grid grid--cards">
            {related.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      ) : null}
    </>
  );
}
