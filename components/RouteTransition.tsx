"use client";

import { usePathname } from "next/navigation";
import { type ReactNode } from "react";

/**
 * Forces React to remount the page content when pathname changes, which
 * re-triggers the `.main` CSS fade-in animation. Combined with the View
 * Transitions API CSS (in globals.css), navigation feels smooth & polished.
 */
export default function RouteTransition({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  return (
    <main className="main" key={pathname}>
      {children}
    </main>
  );
}
