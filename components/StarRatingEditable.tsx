"use client";

import { useState } from "react";

type Props = {
  value: number;
  size?: number;
  onChange?: (v: number) => void;
  className?: string;
};

/**
 * Interactive star rating (hover/click). Client-only.
 * Use ONLY inside forms (e.g. ReviewForm). For display, use `StarRating`.
 */
export default function StarRatingEditable({
  value,
  size = 18,
  onChange,
  className,
}: Props) {
  const [hover, setHover] = useState<number | null>(null);
  const display = hover ?? value;

  return (
    <span
      className={`star-rating is-editable ${className || ""}`}
      style={{ ["--star-size" as any]: `${size}px` }}
      role="radiogroup"
      aria-label={`Đánh giá ${value} trên 5 sao`}
    >
      {[1, 2, 3, 4, 5].map((i) => {
        const filled = i <= Math.round(display);
        return (
          <button
            type="button"
            key={i}
            className={`star ${filled ? "is-filled" : ""}`}
            onMouseEnter={() => setHover(i)}
            onMouseLeave={() => setHover(null)}
            onClick={() => onChange?.(i)}
            aria-label={`${i} sao`}
          >
            <svg viewBox="0 0 24 24" width={size} height={size}>
              <path
                d="M12 2.5l2.95 6 6.55.95-4.75 4.6 1.12 6.55L12 17.7l-5.87 3 1.12-6.55-4.75-4.6 6.55-.95L12 2.5z"
                fill={filled ? "currentColor" : "transparent"}
                stroke="currentColor"
                strokeWidth="1.4"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        );
      })}
    </span>
  );
}
