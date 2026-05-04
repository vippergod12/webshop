"use client";

import { useRef, useState } from "react";
import { apiFetch } from "@/lib/api-client";
import { safeImage } from "@/lib/utils/image";

type Props = {
  value: string;
  onChange: (url: string) => void;
  label?: string;
};

export default function SingleImagePicker({ value, onChange, label }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleFiles(fileList: FileList | null) {
    if (!fileList || fileList.length === 0) return;
    setError(null);
    const file = fileList[0];

    const fd = new FormData();
    fd.append("file", file);

    setUploading(true);
    try {
      const res = await apiFetch<{ url: string }>("/api/upload", {
        method: "POST",
        auth: true,
        body: fd,
      });
      if (res.url) onChange(res.url);
    } catch (err: any) {
      setError(err?.message || "Tải ảnh thất bại");
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  return (
    <div className="image-picker image-picker--single">
      {label ? <label className="field__label">{label}</label> : null}
      <div className="image-picker__row">
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          disabled={uploading}
          onChange={(e) => handleFiles(e.target.files)}
        />
        <button
          type="button"
          className="btn btn--ghost"
          disabled={uploading}
          onClick={() => inputRef.current?.click()}
        >
          {uploading ? "Đang tải…" : value ? "Đổi ảnh" : "+ Chọn ảnh"}
        </button>
        {value ? (
          <button
            type="button"
            className="btn btn--ghost"
            onClick={() => onChange("")}
            disabled={uploading}
          >
            Xóa
          </button>
        ) : null}
      </div>
      {error ? <p className="image-picker__error">{error}</p> : null}
      {value ? (
        <div className="image-picker__single-preview">
          <img src={safeImage(value)} alt="" />
        </div>
      ) : (
        <p className="image-picker__empty">Chưa chọn ảnh.</p>
      )}
    </div>
  );
}
