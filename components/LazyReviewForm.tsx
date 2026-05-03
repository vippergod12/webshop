"use client";

import dynamic from "next/dynamic";
import { useEffect, useRef, useState } from "react";

const ReviewForm = dynamic(() => import("./ReviewForm"), {
  ssr: false,
  loading: () => <div className="skeleton skeleton--form" aria-hidden />,
});

type Props = { productId: number };

/**
 * Client wrapper that mounts ReviewForm only when scrolled into view.
 * - Saves ~10KB of client JS on initial product detail load
 * - Form HTML/JS chunk is loaded just-in-time (rootMargin 200px lookahead)
 */
export default function LazyReviewForm({ productId }: Props) {
  const [visible, setVisible] = useState(false);
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (visible || !ref.current) return;
    if (typeof IntersectionObserver === "undefined") {
      setVisible(true);
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            setVisible(true);
            io.disconnect();
            break;
          }
        }
      },
      { rootMargin: "200px 0px" }
    );
    io.observe(ref.current);
    return () => io.disconnect();
  }, [visible]);

  return (
    <div ref={ref} className="lazy-mount">
      {visible ? (
        <ReviewForm productId={productId} />
      ) : (
        <div className="skeleton skeleton--form" aria-hidden />
      )}
    </div>
  );
}
