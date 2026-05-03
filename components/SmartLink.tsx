"use client";

import Link, { type LinkProps } from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useRef, type AnchorHTMLAttributes, type ReactNode } from "react";

type Props = Omit<LinkProps, "prefetch"> &
  Omit<AnchorHTMLAttributes<HTMLAnchorElement>, keyof LinkProps> & {
    children?: ReactNode;
  };

/**
 * Link that prefetches lazily — only when the user hovers, focuses, or taps the link.
 *
 * Why: default Next.js Link prefetches every link visible in the viewport. On
 * pages with hundreds of product cards this floods the network. Lazy prefetch
 * gives ~instant navigation feel (route is fetched while finger travels to click)
 * without idle bandwidth waste.
 */
export default function SmartLink({
  href,
  onMouseEnter,
  onFocus,
  onTouchStart,
  children,
  ...rest
}: Props) {
  const router = useRouter();
  const prefetched = useRef(false);

  const trigger = useCallback(() => {
    if (prefetched.current) return;
    prefetched.current = true;
    try {
      router.prefetch(typeof href === "string" ? href : href.toString());
    } catch {
      /* ignore */
    }
  }, [router, href]);

  return (
    <Link
      href={href}
      prefetch={false}
      onMouseEnter={(e) => {
        trigger();
        onMouseEnter?.(e);
      }}
      onFocus={(e) => {
        trigger();
        onFocus?.(e);
      }}
      onTouchStart={(e) => {
        trigger();
        onTouchStart?.(e);
      }}
      {...rest}
    >
      {children}
    </Link>
  );
}
