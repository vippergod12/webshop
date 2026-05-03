import Link from "next/link";
import type { Category } from "@/lib/types";
import { safeImage } from "@/lib/utils/image";

type Props = { categories: Category[] };

export default function CategoriesBento({ categories }: Props) {
  if (!categories.length) return null;
  const items = categories.slice(0, 6);

  return (
    <section className="section">
      <div className="container">
        <header className="section__head">
          <div>
            <span className="section__eyebrow">DANH MỤC</span>
            <h2 className="section__title">Chọn website theo lĩnh vực</h2>
          </div>
          <Link href="/san-pham" className="section__link">
            Tất cả sản phẩm →
          </Link>
        </header>

        <div className="bento">
          {items.map((c, i) => (
            <Link
              key={c.id}
              href={`/danh-muc/${c.slug}`}
              className={`bento__cell bento__cell--${i + 1}`}
            >
              <img src={safeImage(c.image_url)} alt={c.name} />
              <div className="bento__overlay" />
              <div className="bento__body">
                <span className="bento__count">
                  {c.product_count || 0} sản phẩm
                </span>
                <h3>{c.name}</h3>
                {c.description ? <p>{c.description}</p> : null}
                <span className="bento__cta">Xem ngay →</span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
