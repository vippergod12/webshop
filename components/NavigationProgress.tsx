"use client";

import { usePathname, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";

/**
 * Top progress bar (NProgress-style) that gives instant visual feedback when
 * the user clicks a Link. It listens at document level for clicks on internal
 * anchors and shows the bar until the route's RSC payload finishes loading
 * (detected by `pathname`/`searchParams` change).
 */
export default function NavigationProgress() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [progress, setProgress] = useState(0);
  const [visible, setVisible] = useState(false);
  const timer = useRef<number | null>(null);
  const hideTimer = useRef<number | null>(null);

  const start = () => {
    if (hideTimer.current) {
      window.clearTimeout(hideTimer.current);
      hideTimer.current = null;
    }
    setVisible(true);
    setProgress(8);
    if (timer.current) window.clearInterval(timer.current);
    timer.current = window.setInterval(() => {
      setProgress((p) => {
        if (p >= 90) return p;
        const inc = p < 30 ? 12 : p < 60 ? 6 : p < 85 ? 2 : 0.5;
        return Math.min(90, p + inc);
      });
    }, 220);
  };

  const finish = () => {
    if (timer.current) {
      window.clearInterval(timer.current);
      timer.current = null;
    }
    setProgress(100);
    hideTimer.current = window.setTimeout(() => {
      setVisible(false);
      setProgress(0);
    }, 280);
  };

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (e.defaultPrevented) return;
      if (e.button !== 0) return;
      if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      const target = e.target as HTMLElement | null;
      const anchor = target?.closest("a") as HTMLAnchorElement | null;
      if (!anchor) return;
      if (anchor.target && anchor.target !== "_self") return;
      if (anchor.hasAttribute("download")) return;
      const href = anchor.getAttribute("href");
      if (!href) return;
      if (
        href.startsWith("mailto:") ||
        href.startsWith("tel:") ||
        href.startsWith("javascript:") ||
        href.startsWith("#")
      ) {
        return;
      }
      try {
        const url = new URL(anchor.href, window.location.href);
        if (url.origin !== window.location.origin) return;
        if (
          url.pathname === window.location.pathname &&
          url.search === window.location.search
        ) {
          return;
        }
      } catch {
        return;
      }
      start();
    };

    document.addEventListener("click", onClick);
    return () => document.removeEventListener("click", onClick);
  }, []);

  // Finish progress whenever the route actually changes
  useEffect(() => {
    finish();
    return () => {
      if (timer.current) window.clearInterval(timer.current);
      if (hideTimer.current) window.clearTimeout(hideTimer.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname, searchParams]);

  return (
    <div
      className="nav-progress"
      data-visible={visible ? "true" : "false"}
      aria-hidden
    >
      <div
        className="nav-progress__bar"
        style={{ transform: `translateX(${progress - 100}%)` }}
      />
    </div>
  );
}
