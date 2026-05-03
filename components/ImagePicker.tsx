"use client";

import { useState } from "react";
import { safeImage } from "@/lib/utils/image";

type Props = {
  values: string[];
  onChange: (urls: string[]) => void;
  label?: string;
  max?: number;
};

export default function ImagePicker({ values, onChange, label, max = 12 }: Props) {
  const [draft, setDraft] = useState("");

  function add() {
    const url = draft.trim();
    if (!url) return;
    if (values.includes(url)) return;
    if (values.length >= max) return;
    onChange([...values, url]);
    setDraft("");
  }

  function remove(idx: number) {
    onChange(values.filter((_, i) => i !== idx));
  }

  function move(idx: number, dir: -1 | 1) {
    const next = [...values];
    const target = idx + dir;
    if (target < 0 || target >= next.length) return;
    [next[idx], next[target]] = [next[target], next[idx]];
    onChange(next);
  }

  return (
    <div className="image-picker">
      {label ? <label className="field__label">{label}</label> : null}
      <div className="image-picker__row">
        <input
          type="url"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder="https://..."
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              add();
            }
          }}
        />
        <button type="button" className="btn btn--ghost" onClick={add}>
          + Thêm
        </button>
      </div>
      {values.length ? (
        <ul className="image-picker__list">
          {values.map((u, i) => (
            <li key={u + i}>
              <img src={safeImage(u)} alt="" />
              <div className="image-picker__actions">
                <button
                  type="button"
                  className="image-picker__btn"
                  aria-label="Lên"
                  onClick={() => move(i, -1)}
                >
                  ↑
                </button>
                <button
                  type="button"
                  className="image-picker__btn"
                  aria-label="Xuống"
                  onClick={() => move(i, 1)}
                >
                  ↓
                </button>
                <button
                  type="button"
                  className="image-picker__btn image-picker__btn--del"
                  aria-label="Xóa"
                  onClick={() => remove(i)}
                >
                  ×
                </button>
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <p className="image-picker__empty">Chưa có ảnh nào.</p>
      )}
    </div>
  );
}
