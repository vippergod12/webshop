"use client";

import dynamic from "next/dynamic";
import { useEffect, useRef, useState } from "react";

const FloatingZaloCard = dynamic(() => import("./FloatingZaloCard"), {
  ssr: false,
  loading: () => null,
});

const TEASER_DELAY_MS = 3500;
const TEASER_KEY = "wv_zalo_teaser_seen";

function ZaloIcon({ size = 24 }: { size?: number }) {
  return (
    <svg viewBox="0 0 64 64" width={size} height={size} aria-hidden focusable="false">
      <path
        fill="currentColor"
        d="M32 6C16.5 6 4 16.7 4 30c0 7 3.5 13.3 9.2 17.6-.5 2.5-1.7 5.7-4 8 .3.4.8.6 1.4.5 4.3-.5 8.5-2.2 11.5-3.7 3.2.9 6.5 1.4 9.9 1.4 15.5 0 28-10.7 28-24S47.5 6 32 6zm-9.6 28.7h-6.7c-.6 0-1-.4-1-1v-9.5c0-.6.4-1 1-1s1 .4 1 1v8.5h5.7c.6 0 1 .4 1 1s-.4 1-1 1zm5-1c0 .6-.4 1-1 1s-1-.4-1-1v-9.5c0-.6.4-1 1-1s1 .4 1 1v9.5zm9.4 0c0 .6-.4 1-1 1-.3 0-.6-.2-.8-.4l-5-6.6v6c0 .6-.4 1-1 1s-1-.4-1-1v-9.5c0-.6.4-1 1-1 .3 0 .6.2.8.4l5 6.6v-6c0-.6.4-1 1-1s1 .4 1 1v9.5zm10.6 0c0 .3-.2.6-.4.8-.2.2-.4.3-.6.3h-6c-.6 0-1-.4-1-1v-9.5c0-.6.4-1 1-1s1 .4 1 1v8.5h5c.6 0 1 .4 1 .9z"
      />
    </svg>
  );
}

export default function FloatingActions() {
  const [open, setOpen] = useState(false);
  const [showTop, setShowTop] = useState(false);
  const [teaser, setTeaser] = useState(false);
  const popupRef = useRef<HTMLDivElement | null>(null);
  const btnRef = useRef<HTMLButtonElement | null>(null);

  useEffect(() => {
    let raf = 0;
    const onScroll = () => {
      if (raf) return;
      raf = window.requestAnimationFrame(() => {
        setShowTop(window.scrollY > 480);
        raf = 0;
      });
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      if (raf) window.cancelAnimationFrame(raf);
    };
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      if (sessionStorage.getItem(TEASER_KEY)) return;
    } catch {
      /* ignore */
    }
    const idle = (cb: () => void) => {
      const w = window as unknown as {
        requestIdleCallback?: (cb: () => void, opts?: { timeout: number }) => number;
      };
      if (typeof w.requestIdleCallback === "function") {
        w.requestIdleCallback(cb, { timeout: TEASER_DELAY_MS + 500 });
      } else {
        window.setTimeout(cb, TEASER_DELAY_MS);
      }
    };
    const t = window.setTimeout(() => idle(() => setTeaser(true)), TEASER_DELAY_MS);
    return () => window.clearTimeout(t);
  }, []);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    const onClickOutside = (e: MouseEvent) => {
      const target = e.target as Node;
      if (
        popupRef.current &&
        !popupRef.current.contains(target) &&
        btnRef.current &&
        !btnRef.current.contains(target)
      ) {
        setOpen(false);
      }
    };
    window.addEventListener("keydown", onKey);
    window.addEventListener("mousedown", onClickOutside);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("mousedown", onClickOutside);
    };
  }, [open]);

  const markTeaserSeen = () => {
    try {
      sessionStorage.setItem(TEASER_KEY, "1");
    } catch {
      /* ignore */
    }
  };

  const handleToggle = () => {
    setOpen((v) => !v);
    if (teaser) setTeaser(false);
    markTeaserSeen();
  };

  const dismissTeaser = () => {
    setTeaser(false);
    markTeaserSeen();
  };

  return (
    <div className="floating" data-open={open ? "true" : "false"}>
      {open && <FloatingZaloCard ref={popupRef} onClose={() => setOpen(false)} />}

      {teaser && !open && (
        <div className="floating__teaser" role="status">
          <button
            type="button"
            className="floating__teaser-close"
            aria-label="Ẩn gợi ý"
            onClick={dismissTeaser}
          >
            ×
          </button>
          <strong>Cần tư vấn website?</strong>
          <span>Nhắn ngay qua Zalo, miễn phí 24/7</span>
          <i className="floating__teaser-arrow" />
        </div>
      )}

      <button
        ref={btnRef}
        type="button"
        className="floating__btn floating__btn--zalo"
        aria-label={open ? "Đóng chat Zalo" : "Mở chat Zalo"}
        aria-expanded={open}
        onClick={handleToggle}
      >
        <span className="floating__pulse" aria-hidden />
        <span className="floating__pulse floating__pulse--lag" aria-hidden />
        <ZaloIcon size={24} />
      </button>

      <button
        type="button"
        className={`floating__btn floating__btn--top ${showTop ? "is-visible" : ""}`}
        aria-label="Lên đầu trang"
        onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
          <path
            d="M6 14l6-6 6 6"
            stroke="currentColor"
            strokeWidth="2.4"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>
    </div>
  );
}
