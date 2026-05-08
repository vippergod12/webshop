"use client";

import {
  ChangeEvent,
  ClipboardEvent,
  DragEvent,
  useEffect,
  useRef,
  useState,
} from "react";
import { safeImage } from "@/lib/utils/image";
import {
  bytesOfDataUrl,
  compressImage,
  formatBytes,
} from "@/lib/utils/image-compress";

type Props = {
  value: string;
  onChange: (url: string) => void;
  label?: string;
};

const ALLOWED_MIME = new Set([
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
  "image/avif",
  "image/gif",
  "image/svg+xml",
]);
const MAX_BYTES = 12 * 1024 * 1024;

export default function SingleImagePicker({ value, onChange, label }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);

  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  async function handleFiles(files: FileList | File[] | null) {
    if (!files || (files as FileList).length === 0) return;
    const file = (files as FileList)[0];
    setError(null);

    if (file.type && !ALLOWED_MIME.has(file.type)) {
      setError(`Định dạng không hỗ trợ: ${file.type || file.name}`);
      return;
    }
    if (file.size > MAX_BYTES) {
      setError(`Tệp vượt quá 12MB`);
      return;
    }

    if (previewUrl) URL.revokeObjectURL(previewUrl);
    const localUrl = URL.createObjectURL(file);
    setPreviewUrl(localUrl);
    setBusy(true);
    try {
      const dataUrl = await compressImage(file, {
        maxSize: 1280,
        quality: 0.82,
      });
      onChange(dataUrl);
      setInfo(
        `${file.name} → ${formatBytes(bytesOfDataUrl(dataUrl))} (gốc ${formatBytes(
          file.size
        )})`
      );
    } catch (err: any) {
      setError(err?.message || "Xử lý ảnh thất bại");
    } finally {
      setBusy(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  function onInputChange(e: ChangeEvent<HTMLInputElement>) {
    handleFiles(e.target.files);
  }

  function onDrop(e: DragEvent<HTMLDivElement>) {
    e.preventDefault();
    setIsDragOver(false);
    const files: File[] = [];
    const dt = e.dataTransfer;
    if (dt?.items?.length) {
      for (let i = 0; i < dt.items.length; i++) {
        const it = dt.items[i];
        if (it.kind === "file") {
          const f = it.getAsFile();
          if (f && f.type.startsWith("image/")) files.push(f);
        }
      }
    } else if (dt?.files?.length) {
      for (let i = 0; i < dt.files.length; i++) {
        const f = dt.files[i];
        if (f.type.startsWith("image/")) files.push(f);
      }
    }
    if (files.length) handleFiles(files);
  }
  function onDragOver(e: DragEvent<HTMLDivElement>) {
    e.preventDefault();
    if (!isDragOver) setIsDragOver(true);
  }
  function onDragLeave(e: DragEvent<HTMLDivElement>) {
    if (e.currentTarget.contains(e.relatedTarget as Node)) return;
    setIsDragOver(false);
  }
  function onPaste(e: ClipboardEvent<HTMLDivElement>) {
    const items = e.clipboardData?.items;
    if (!items) return;
    for (let i = 0; i < items.length; i++) {
      const it = items[i];
      if (it.kind === "file") {
        const f = it.getAsFile();
        if (f && f.type.startsWith("image/")) {
          e.preventDefault();
          handleFiles([f]);
          return;
        }
      }
    }
  }

  function clear() {
    onChange("");
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(null);
    setError(null);
    setInfo(null);
  }

  const displayUrl = value || previewUrl;

  return (
    <div className="image-picker image-picker--single" onPaste={onPaste}>
      {label ? <label className="field__label">{label}</label> : null}

      <div
        className={`image-picker__dropzone image-picker__dropzone--single ${
          isDragOver ? "image-picker__dropzone--over" : ""
        }`}
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        onDrop={onDrop}
        onClick={() => !busy && inputRef.current?.click()}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if ((e.key === "Enter" || e.key === " ") && !busy) {
            e.preventDefault();
            inputRef.current?.click();
          }
        }}
      >
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          hidden
          disabled={busy}
          onChange={onInputChange}
        />
        {displayUrl ? (
          <div className="image-picker__single-preview">
            <img src={safeImage(displayUrl)} alt="" />
            {busy ? (
              <div className="image-picker__pending-overlay">
                <div className="image-picker__progress">
                  <div className="image-picker__progress-bar image-picker__progress-bar--indeterminate" />
                </div>
                <span>Đang nén…</span>
              </div>
            ) : null}
          </div>
        ) : (
          <div className="image-picker__dropzone-inner">
            <span className="image-picker__dropzone-icon" aria-hidden>
              ⬆
            </span>
            <strong>
              {busy ? "Đang nén…" : "Kéo & thả ảnh hoặc bấm để chọn"}
            </strong>
            <span className="image-picker__dropzone-meta">
              JPG · PNG · WebP · ảnh sẽ tự nén ~1280px
            </span>
          </div>
        )}
      </div>

      {error ? <p className="image-picker__error">{error}</p> : null}
      {!error && info ? <p className="image-picker__hint">{info}</p> : null}

      {displayUrl ? (
        <div className="image-picker__row">
          <button
            type="button"
            className="btn btn--ghost btn--sm"
            disabled={busy}
            onClick={() => inputRef.current?.click()}
          >
            Đổi ảnh
          </button>
          <button
            type="button"
            className="btn btn--ghost btn--sm"
            disabled={busy}
            onClick={clear}
          >
            Xoá
          </button>
        </div>
      ) : null}
    </div>
  );
}
