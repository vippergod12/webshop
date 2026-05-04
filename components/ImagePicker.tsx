"use client";

import { useRef, useState } from "react";
import { apiFetch } from "@/lib/api-client";
import { safeImage } from "@/lib/utils/image";

type Props = {
  values: string[];
  onChange: (urls: string[]) => void;
  label?: string;
  max?: number;
};

export default function ImagePicker({ values, onChange, label, max = 12 }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleFiles(fileList: FileList | null) {
    if (!fileList || fileList.length === 0) return;
    setError(null);

    const remaining = Math.max(0, max - values.length);
    if (remaining === 0) {
      setError(`Tối đa ${max} ảnh.`);
      return;
    }

    const picked = Array.from(fileList).slice(0, remaining);
    const fd = new FormData();
    for (const f of picked) fd.append("files", f);

    setUploading(true);
    try {
      const res = await apiFetch<{ urls: string[] }>("/api/upload", {
        method: "POST",
        auth: true,
        body: fd,
      });
      const newUrls = (res.urls || []).filter((u) => !values.includes(u));
      if (newUrls.length) onChange([...values, ...newUrls]);
    } catch (err: any) {
      setError(err?.message || "Tải ảnh thất bại");
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
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

  const canAdd = values.length < max;

  return (
    <div className="image-picker">
      {label ? <label className="field__label">{label}</label> : null}
      <div className="image-picker__row">
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          multiple
          disabled={uploading || !canAdd}
          onChange={(e) => handleFiles(e.target.files)}
        />
        <button
          type="button"
          className="btn btn--ghost"
          disabled={uploading || !canAdd}
          onClick={() => inputRef.current?.click()}
        >
          {uploading ? "Đang tải…" : "+ Chọn ảnh"}
        </button>
      </div>
      {error ? <p className="image-picker__error">{error}</p> : null}
      <p className="image-picker__hint">
        {values.length}/{max} ảnh — JPG / PNG / WebP / AVIF, tối đa 8MB mỗi tệp.
      </p>
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
