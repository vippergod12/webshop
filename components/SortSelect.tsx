"use client";

import { useRouter } from "next/navigation";
import {
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
  type KeyboardEvent,
} from "react";
import { useFilterScope } from "./FilterLink";

export type SortOption = { value: string; label: string; href: string };

type Props = {
  value: string;
  options: SortOption[];
  label?: string;
};

/**
 * Custom dropdown (replaces native `<select>` for full UI control).
 * Features:
 *  - Animated popover with proper gap below the trigger
 *  - Hover / active states matching the dark theme
 *  - Keyboard support: ArrowUp / ArrowDown / Home / End / Enter / Escape / Tab
 *  - Click-outside to close
 *  - aria-expanded / role="listbox" / role="option" for screen readers
 *  - Uses parent `<FilterScope>` transition so the grid fades while loading
 */
export default function SortSelect({
  value,
  options,
  label = "Sắp xếp",
}: Props) {
  const router = useRouter();
  const { isPending, startScopedTransition } = useFilterScope();
  const triggerId = useId();
  const listId = useId();

  const [open, setOpen] = useState(false);
  const [highlightIdx, setHighlightIdx] = useState(() => {
    const i = options.findIndex((o) => o.value === value);
    return i >= 0 ? i : 0;
  });

  const wrapRef = useRef<HTMLDivElement | null>(null);
  const triggerRef = useRef<HTMLButtonElement | null>(null);
  const listRef = useRef<HTMLUListElement | null>(null);

  const current = options.find((o) => o.value === value) || options[0];

  const select = useCallback(
    (opt: SortOption) => {
      setOpen(false);
      if (opt.value === value) return;
      startScopedTransition(() => {
        router.push(opt.href, { scroll: false });
      });
    },
    [router, startScopedTransition, value]
  );

  // Sync highlight with current value when opening
  useEffect(() => {
    if (!open) return;
    const i = options.findIndex((o) => o.value === value);
    if (i >= 0) setHighlightIdx(i);
  }, [open, options, value]);

  // Click outside + Escape
  useEffect(() => {
    if (!open) return;
    const onClick = (e: MouseEvent) => {
      const t = e.target as Node;
      if (wrapRef.current && !wrapRef.current.contains(t)) setOpen(false);
    };
    const onKey = (e: globalThis.KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
        triggerRef.current?.focus();
      }
    };
    document.addEventListener("mousedown", onClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onClick);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  // Auto-scroll highlighted item into view
  useEffect(() => {
    if (!open || !listRef.current) return;
    const el = listRef.current.querySelector<HTMLElement>(
      `[data-idx="${highlightIdx}"]`
    );
    el?.scrollIntoView({ block: "nearest" });
  }, [highlightIdx, open]);

  const handleTriggerKey = (e: KeyboardEvent<HTMLButtonElement>) => {
    if (e.key === "ArrowDown" || e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      setOpen(true);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setOpen(true);
      setHighlightIdx(options.length - 1);
    }
  };

  const handleListKey = (e: KeyboardEvent<HTMLUListElement>) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setHighlightIdx((i) => (i + 1) % options.length);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlightIdx((i) => (i - 1 + options.length) % options.length);
    } else if (e.key === "Home") {
      e.preventDefault();
      setHighlightIdx(0);
    } else if (e.key === "End") {
      e.preventDefault();
      setHighlightIdx(options.length - 1);
    } else if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      const opt = options[highlightIdx];
      if (opt) select(opt);
    } else if (e.key === "Tab") {
      setOpen(false);
    }
  };

  return (
    <div
      ref={wrapRef}
      className="sort-select"
      data-pending={isPending ? "true" : undefined}
      data-open={open ? "true" : undefined}
    >
      <span className="sort-select__label" id={`${triggerId}-label`}>
        {label}
      </span>
      <button
        ref={triggerRef}
        id={triggerId}
        type="button"
        className="sort-select__trigger"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-labelledby={`${triggerId}-label`}
        aria-controls={listId}
        onClick={() => setOpen((v) => !v)}
        onKeyDown={handleTriggerKey}
      >
        <span className="sort-select__value">{current?.label}</span>
        <svg
          aria-hidden
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          className="sort-select__chevron"
        >
          <path
            d="M6 9l6 6 6-6"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>

      {open && (
        <ul
          ref={(node) => {
            listRef.current = node;
            // Auto-focus the menu so keyboard navigation works immediately
            node?.focus();
          }}
          id={listId}
          role="listbox"
          aria-labelledby={`${triggerId}-label`}
          tabIndex={-1}
          className="sort-select__menu"
          onKeyDown={handleListKey}
        >
          {options.map((opt, idx) => {
            const selected = opt.value === value;
            const highlighted = idx === highlightIdx;
            return (
              <li
                key={opt.value}
                data-idx={idx}
                role="option"
                aria-selected={selected}
                className={`sort-select__option ${
                  highlighted ? "is-highlighted" : ""
                } ${selected ? "is-selected" : ""}`}
                onMouseEnter={() => setHighlightIdx(idx)}
                onClick={() => select(opt)}
              >
                <span>{opt.label}</span>
                {selected && (
                  <svg
                    aria-hidden
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    className="sort-select__check"
                  >
                    <path
                      d="M5 13l4 4L19 7"
                      stroke="currentColor"
                      strokeWidth="2.4"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
