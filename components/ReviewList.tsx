import StarRating from "./StarRating";
import { formatDate } from "@/lib/utils/format";
import type { Review } from "@/lib/types";

type Props = { reviews: Review[] };

export default function ReviewList({ reviews }: Props) {
  if (!reviews.length) {
    return (
      <div className="review-empty">
        <p>Chưa có đánh giá nào. Hãy là người đầu tiên review sản phẩm này.</p>
      </div>
    );
  }

  return (
    <ul className="review-list">
      {reviews.map((r) => (
        <li key={r.id} className="review-item">
          <div className="review-item__head">
            <div className="review-item__avatar" aria-hidden>
              {r.customer_name.charAt(0).toUpperCase()}
            </div>
            <div className="review-item__meta">
              <strong>{r.customer_name}</strong>
              <time dateTime={r.created_at}>{formatDate(r.created_at)}</time>
            </div>
            <StarRating value={r.rating} size={14} />
          </div>
          {r.title ? <h4 className="review-item__title">{r.title}</h4> : null}
          <p className="review-item__body">{r.comment}</p>
        </li>
      ))}
    </ul>
  );
}
