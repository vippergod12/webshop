"use client";

import { ReactNode, useEffect, useId } from "react";

type Props = {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
  size?: "sm" | "md" | "lg";
};

export default function Modal({ open, onClose, title, children, size = "md" }: Props) {
  const titleId = useId();

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="modal"
      role="dialog"
      aria-modal="true"
      aria-labelledby={title ? titleId : undefined}
      onClick={onClose}
    >
      <div
        className={`modal__panel modal__panel--${size}`}
        onClick={(e) => e.stopPropagation()}
      >
        <header className="modal__head">
          <h3 id={titleId}>{title}</h3>
          <button
            type="button"
            className="modal__close"
            aria-label="Đóng"
            onClick={onClose}
          >
            ×
          </button>
        </header>
        <div className="modal__body">{children}</div>
      </div>
    </div>
  );
}
