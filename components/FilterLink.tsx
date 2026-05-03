"use client";

import { useRouter } from "next/navigation";
import {
  createContext,
  useContext,
  useTransition,
  type AnchorHTMLAttributes,
  type MouseEvent,
  type ReactNode,
  type TransitionStartFunction,
} from "react";

type ScopeValue = {
  isPending: boolean;
  startScopedTransition: TransitionStartFunction;
};

const FilterScopeContext = createContext<ScopeValue>({
  isPending: false,
  startScopedTransition: (cb) => cb(),
});

/**
 * Wrap a region (e.g. the shop sidebar + grid) so all `<FilterLink>` clicks
 * inside it share a single `useTransition`. The wrapper exposes `isPending`
 * via context so children (e.g. the grid) can show a subtle fade.
 */
export function FilterScope({ children }: { children: ReactNode }) {
  const [isPending, startScopedTransition] = useTransition();
  return (
    <FilterScopeContext.Provider value={{ isPending, startScopedTransition }}>
      {children}
    </FilterScopeContext.Provider>
  );
}

export function useFilterScope() {
  return useContext(FilterScopeContext);
}

export function useFilterPending() {
  return useContext(FilterScopeContext).isPending;
}

type Props = AnchorHTMLAttributes<HTMLAnchorElement> & {
  href: string;
  /** If true, scroll to top after navigation. Default: preserve scroll. */
  scroll?: boolean;
};

/**
 * Internal-link variant that:
 *  - Calls `router.push(href, { scroll: false })` so scroll is preserved
 *  - Wraps the navigation in the parent `<FilterScope>`'s transition so the
 *    PREVIOUS UI stays visible while the new RSC payload is fetched
 *    (no `loading.tsx` flash, no jump to top)
 */
export default function FilterLink({
  href,
  scroll = false,
  onClick,
  children,
  className,
  ...rest
}: Props) {
  const router = useRouter();
  const { startScopedTransition, isPending } = useContext(FilterScopeContext);

  const handleClick = (e: MouseEvent<HTMLAnchorElement>) => {
    onClick?.(e);
    if (e.defaultPrevented) return;
    if (
      e.button !== 0 ||
      e.metaKey ||
      e.ctrlKey ||
      e.shiftKey ||
      e.altKey
    ) {
      return;
    }
    e.preventDefault();
    startScopedTransition(() => {
      router.push(href, { scroll });
    });
  };

  return (
    <a
      {...rest}
      href={href}
      onClick={handleClick}
      data-pending={isPending ? "true" : undefined}
      className={className}
    >
      {children}
    </a>
  );
}
