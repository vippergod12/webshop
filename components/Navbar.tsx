"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { SITE_NAME } from "@/lib/seo/siteConfig";

const NAV = [
  { href: "/", label: "Trang chủ" },
  { href: "/san-pham", label: "Sản phẩm" },
  { href: "/ve-chung-toi", label: "Về chúng tôi" },
  { href: "/lien-he", label: "Liên hệ" },
];

export default function Navbar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 16);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  return (
    <header
      className={`navbar ${scrolled ? "navbar--scrolled" : ""}`}
      data-open={open ? "true" : "false"}
    >
      <div className="container navbar__inner">
        <Link href="/" className="navbar__brand" aria-label={SITE_NAME}>
          <span className="navbar__logo">
            <svg width="28" height="28" viewBox="0 0 32 32" fill="none">
              <path
                d="M4 6h7l5 14L21 6h7L19 28h-6L4 6Z"
                stroke="url(#g)"
                strokeWidth="2.5"
                strokeLinejoin="round"
              />
              <defs>
                <linearGradient id="g" x1="0" x2="32" y1="0" y2="32">
                  <stop offset="0" stopColor="#22d3ee" />
                  <stop offset="1" stopColor="#a78bfa" />
                </linearGradient>
              </defs>
            </svg>
          </span>
          <span className="navbar__name">{SITE_NAME}</span>
        </Link>

        <nav className="navbar__menu" aria-label="Main">
          {NAV.map((n) => (
            <Link
              key={n.href}
              href={n.href}
              className={`navbar__link ${isActive(n.href) ? "is-active" : ""}`}
            >
              {n.label}
            </Link>
          ))}
        </nav>

        <div className="navbar__actions">
          <Link href="/lien-he" className="btn btn--ghost navbar__cta-ghost">
            Tư vấn
          </Link>
          <Link href="/san-pham" className="btn btn--primary">
            Khám phá kho web
          </Link>
          <button
            type="button"
            className="navbar__burger"
            aria-label="Mở menu"
            aria-expanded={open}
            onClick={() => setOpen((v) => !v)}
          >
            <span />
            <span />
            <span />
          </button>
        </div>
      </div>

      {open ? (
        <div className="navbar__drawer">
          {NAV.map((n) => (
            <Link
              key={n.href}
              href={n.href}
              className={`navbar__drawer-link ${isActive(n.href) ? "is-active" : ""}`}
            >
              {n.label}
            </Link>
          ))}
          <Link href="/lien-he" className="btn btn--primary navbar__drawer-cta">
            Liên hệ tư vấn
          </Link>
        </div>
      ) : null}
    </header>
  );
}
