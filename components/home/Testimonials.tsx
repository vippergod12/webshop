import Link from "next/link";
import type { Review } from "@/lib/types";
import StarRating from "../StarRating";

type Props = { reviews: Review[] };

export default function Testimonials({ reviews }: Props) {
  if (!reviews?.length) return null;
  const items = reviews.slice(0, 6);
  return (
    <section className="section section--soft">
      <div className="container">
        <header className="section__head">
          <div>
            <span className="section__eyebrow">KHÁCH HÀNG NÓI GÌ</span>
            <h2 className="section__title">Hơn 100 khách hàng đã tin chọn</h2>
          </div>
          <Link href="/san-pham?sort=rating" className="section__link">
            Xem top đánh giá →
          </Link>
        </header>

        <div className="testimonials">
          {items.map((r) => (
            <article key={r.id} className="testimonial">
              <StarRating value={r.rating} size={16} />
              {r.title ? <h4>{r.title}</h4> : null}
              <p>"{r.comment}"</p>
              <footer>
                <div className="testimonial__avatar">
                  {r.customer_name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <strong>{r.customer_name}</strong>
                  {r.product_name ? <span>{r.product_name}</span> : null}
                </div>
              </footer>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
