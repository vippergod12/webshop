type Props = {
  value: number;
  size?: number;
  showValue?: boolean;
  className?: string;
};

/**
 * Read-only star rating — pure server component, **no client JS**.
 * Used in product cards / hero / testimonials (rendered hundreds of times).
 *
 * For interactive rating (review form) use `StarRatingEditable` instead.
 */
export default function StarRating({
  value,
  size = 18,
  showValue = false,
  className,
}: Props) {
  const rounded = Math.round(value);
  return (
    <span
      className={`star-rating ${className || ""}`}
      style={{ ["--star-size" as any]: `${size}px` }}
      role="img"
      aria-label={`Đánh giá ${value} trên 5 sao`}
    >
      {[1, 2, 3, 4, 5].map((i) => {
        const filled = i <= rounded;
        return (
          <span key={i} className={`star ${filled ? "is-filled" : ""}`} aria-hidden>
            <svg viewBox="0 0 24 24" width={size} height={size}>
              <path
                d="M12 2.5l2.95 6 6.55.95-4.75 4.6 1.12 6.55L12 17.7l-5.87 3 1.12-6.55-4.75-4.6 6.55-.95L12 2.5z"
                fill={filled ? "currentColor" : "transparent"}
                stroke="currentColor"
                strokeWidth="1.4"
                strokeLinejoin="round"
              />
            </svg>
          </span>
        );
      })}
      {showValue ? (
        <span className="star-rating__value">{value.toFixed(1)}</span>
      ) : null}
    </span>
  );
}
