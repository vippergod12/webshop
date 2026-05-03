"use client";

import { useRouter } from "next/navigation";
import {
  useEffect,
  useRef,
  useState,
  type ChangeEvent,
  type FormEvent,
} from "react";
import { useFilterScope } from "./FilterLink";

const DEBOUNCE_MS = 280;

type Props = {
  initialValue: string;
  category: string | null;
  sort: string;
  basePath?: string;
  placeholder?: string;
};

/**
 * Live search input with debounce. As the user types, after ~280ms of silence
 * we push a new URL (`?q=...`) — wrapped in the parent `<FilterScope>`'s
 * transition so the grid fades while server fetches new data, and the input
 * keeps focus + cursor position the whole time.
 *
 * Falls back to a regular form submit when JS is disabled (still works).
 */
export default function SearchInput({
  initialValue,
  category,
  sort,
  basePath = "/san-pham",
  placeholder = "Tìm theo tên, mô tả, công nghệ...",
}: Props) {
  const router = useRouter();
  const { isPending, startScopedTransition } = useFilterScope();

  const [value, setValue] = useState(initialValue);
  const lastSyncedRef = useRef(initialValue);
  const debounceRef = useRef<number | null>(null);

  // Re-sync when URL `q` changes externally (e.g. user clicks a filter
  // chip × that strips q, or hits browser back/forward).
  useEffect(() => {
    if (initialValue !== lastSyncedRef.current) {
      setValue(initialValue);
      lastSyncedRef.current = initialValue;
    }
  }, [initialValue]);

  const buildHref = (q: string) => {
    const sp = new URLSearchParams();
    const trimmed = q.trim();
    if (trimmed) sp.set("q", trimmed);
    if (category) sp.set("category", category);
    if (sort) sp.set("sort", sort);
    const qs = sp.toString();
    return qs ? `${basePath}?${qs}` : basePath;
  };

  const push = (q: string) => {
    const trimmed = q.trim();
    if (trimmed === lastSyncedRef.current.trim()) return;
    lastSyncedRef.current = trimmed;
    startScopedTransition(() => {
      router.push(buildHref(trimmed), { scroll: false });
    });
  };

  const scheduleDebounce = (q: string) => {
    if (debounceRef.current) window.clearTimeout(debounceRef.current);
    debounceRef.current = window.setTimeout(() => {
      push(q);
      debounceRef.current = null;
    }, DEBOUNCE_MS);
  };

  const cancelDebounce = () => {
    if (debounceRef.current) {
      window.clearTimeout(debounceRef.current);
      debounceRef.current = null;
    }
  };

  useEffect(() => () => cancelDebounce(), []);

  const onChange = (e: ChangeEvent<HTMLInputElement>) => {
    const next = e.target.value;
    setValue(next);
    scheduleDebounce(next);
  };

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    cancelDebounce();
    push(value);
  };

  const onClear = () => {
    setValue("");
    cancelDebounce();
    push("");
  };

  return (
    <form
      className="search-bar"
      role="search"
      action={basePath}
      onSubmit={onSubmit}
      data-pending={isPending ? "true" : undefined}
    >
      <span className="search-bar__icon" aria-hidden>
        {isPending ? (
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" className="search-bar__spinner">
            <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2.4" strokeOpacity="0.25" />
            <path
              d="M21 12a9 9 0 0 0-9-9"
              stroke="currentColor"
              strokeWidth="2.4"
              strokeLinecap="round"
            />
          </svg>
        ) : (
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
            <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="2" />
            <path
              d="m20 20-3.5-3.5"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            />
          </svg>
        )}
      </span>
      <input
        type="search"
        name="q"
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        autoComplete="off"
        spellCheck={false}
        aria-label="Tìm kiếm sản phẩm"
      />
      {value ? (
        <button
          type="button"
          className="search-bar__clear"
          onClick={onClear}
          aria-label="Xóa từ khóa"
          tabIndex={-1}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
            <path
              d="M6 6l12 12M18 6L6 18"
              stroke="currentColor"
              strokeWidth="2.4"
              strokeLinecap="round"
            />
          </svg>
        </button>
      ) : null}
      {category ? <input type="hidden" name="category" value={category} /> : null}
      {sort ? <input type="hidden" name="sort" value={sort} /> : null}
      <button type="submit" className="btn btn--primary">
        Tìm kiếm
      </button>
    </form>
  );
}
