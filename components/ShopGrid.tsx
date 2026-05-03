"use client";

import type { ReactNode } from "react";
import { useFilterPending } from "./FilterLink";

/**
 * Client wrapper around the product grid that listens to the parent
 * `<FilterScope>` pending state and fades the content slightly while a
 * filter navigation is in flight. The parent keeps showing the previous
 * grid (no skeleton flash) until the new RSC payload arrives.
 */
export default function ShopGrid({ children }: { children: ReactNode }) {
  const isPending = useFilterPending();
  return (
    <div className="shop__grid-wrap" data-pending={isPending ? "true" : undefined}>
      {children}
    </div>
  );
}
