"use client";

import { useState } from "react";

type Props = {
  value: number;
  size?: number;
  editable?: boolean;
  onChange?: (v: number) => void;
  showValue?: boolean;
  className?: string;
};

export default function StarRating({
  value,
  size = 18,
  editable = false,
  onChange,
  showValue = false,
  className,
}: Props) {
  const [hover, setHover] = useState<number | null>(null);
  const display = hover ?? value;

  return (
    <span
      className={`star-rating ${editable ? "is-editable" : ""} ${className || ""}`}
      style={{ ["--star-size" as any]: `${size}px` }}
      role={editable ? "radiogroup" : "img"}
      aria-label={`Đánh giá ${value} trên 5 sao`}
    >
      {[1, 2, 3, 4, 5].map((i) => {
        const filled = i <= Math.round(display);
        return (
          <button
            type="button"
            key={i}
            className={`star ${filled ? "is-filled" : ""}`}
            disabled={!editable}
            onMouseEnter={editable ? () => setHover(i) : undefined}
            onMouseLeave={editable ? () => setHover(null) : undefined}
            onClick={editable ? () => onChange?.(i) : undefined}
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
      {showValue ? <span className="star-rating__value">{value.toFixed(1)}</span> : null}
    </span>
  );
}
