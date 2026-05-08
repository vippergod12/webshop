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
  values: string[];
  onChange: (urls: string[]) => void;
  label?: string;
  max?: number;
  hint?: string;
  /** URL hiện đang dùng làm thumbnail/cover (để hiển thị badge ★) */
  thumbnail?: string;
  /** Callback khi click "Đặt làm thumbnail" trên 1 ảnh */
  onPickThumbnail?: (url: string) => void;
};

type PendingItem = {
  id: string;
  name: string;
  previewUrl: string;
  error?: string;
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
// 12MB cho ảnh GỐC trước nén (sau khi nén còn ~100-300KB).
const MAX_BYTES = 12 * 1024 * 1024;

function genId() {
  return Math.random().toString(36).slice(2, 10);
}

export default function ImagePicker({
  values,
  onChange,
  label,
  max = 12,
  hint,
  thumbnail,
  onPickThumbnail,
}: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const dragIndex = useRef<number | null>(null);
  const [pending, setPending] = useState<PendingItem[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [lightbox, setLightbox] = useState<string | null>(null);
  const [lastInfo, setLastInfo] = useState<string | null>(null);

  const valuesRef = useRef(values);
  useEffect(() => {
    valuesRef.current = values;
  }, [values]);

  // Cleanup blob URLs nếu unmount khi đang xử lý
  useEffect(() => {
    return () => {
      pending.forEach((p) => URL.revokeObjectURL(p.previewUrl));
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ESC để đóng lightbox
  useEffect(() => {
    if (!lightbox) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setLightbox(null);
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [lightbox]);

  async function handleFiles(files: FileList | File[] | null) {
    if (!files || (files as FileList).length === 0) return;
    setError(null);

    const arr = Array.from(files as FileList);
    const remaining = Math.max(0, max - values.length - pending.length);
    if (remaining === 0) {
      setError(`Tối đa ${max} ảnh.`);
      return;
    }
    const batch = arr.slice(0, remaining);

    const valid: File[] = [];
    for (const f of batch) {
      if (f.type && !ALLOWED_MIME.has(f.type)) {
        setError(`Định dạng không hỗ trợ: ${f.name}`);
        continue;
      }
      if (f.size > MAX_BYTES) {
        setError(`Tệp "${f.name}" vượt quá 12MB`);
        continue;
      }
      valid.push(f);
    }
    if (!valid.length) return;

    const tasks: PendingItem[] = valid.map((f) => ({
      id: genId(),
      name: f.name,
      previewUrl: URL.createObjectURL(f),
    }));
    setPending((prev) => [...prev, ...tasks]);

    let totalSavedBytes = 0;
    let totalOriginalBytes = 0;

    await Promise.all(
      tasks.map(async (task, i) => {
        const file = valid[i];
        try {
          const dataUrl = await compressImage(file, {
            maxSize: 1280,
            quality: 0.82,
          });
          totalOriginalBytes += file.size;
          totalSavedBytes += bytesOfDataUrl(dataUrl);

          const cur = valuesRef.current;
          if (!cur.includes(dataUrl)) {
            const next = [...cur, dataUrl];
            valuesRef.current = next;
            onChange(next);
          }
          URL.revokeObjectURL(task.previewUrl);
          setPending((prev) => prev.filter((t) => t.id !== task.id));
        } catch (err: any) {
          setPending((prev) =>
            prev.map((t) =>
              t.id === task.id
                ? { ...t, error: err?.message || "Xử lý ảnh thất bại" }
                : t
            )
          );
        }
      })
    );

    if (totalSavedBytes > 0) {
      setLastInfo(
        `Đã nén ${valid.length} ảnh: ${formatBytes(
          totalOriginalBytes
        )} → ${formatBytes(totalSavedBytes)}`
      );
    }
  }

  function onInputChange(e: ChangeEvent<HTMLInputElement>) {
    handleFiles(e.target.files);
    if (inputRef.current) inputRef.current.value = "";
  }

  function onDrop(e: DragEvent<HTMLDivElement>) {
    e.preventDefault();
    setIsDragOver(false);
    const dt = e.dataTransfer;
    if (!dt) return;
    const files: File[] = [];
    if (dt.items?.length) {
      for (let i = 0; i < dt.items.length; i++) {
        const it = dt.items[i];
        if (it.kind === "file") {
          const f = it.getAsFile();
          if (f && f.type.startsWith("image/")) files.push(f);
        }
      }
    } else if (dt.files?.length) {
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
    const files: File[] = [];
    for (let i = 0; i < items.length; i++) {
      const it = items[i];
      if (it.kind === "file") {
        const f = it.getAsFile();
        if (f && f.type.startsWith("image/")) files.push(f);
      }
    }
    if (files.length) {
      e.preventDefault();
      handleFiles(files);
    }
  }

  // ---- Tile actions ----
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
  function makeCover(idx: number) {
    if (idx === 0) return;
    const next = [...values];
    const [pick] = next.splice(idx, 1);
    next.unshift(pick);
    onChange(next);
  }

  // ---- Drag & drop reorder ----
  function onTileDragStart(e: DragEvent<HTMLLIElement>, idx: number) {
    dragIndex.current = idx;
    e.dataTransfer.effectAllowed = "move";
    try {
      e.dataTransfer.setData("text/plain", String(idx));
    } catch {}
  }
  function onTileDragOver(e: DragEvent<HTMLLIElement>) {
    if (dragIndex.current == null) return;
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  }
  function onTileDrop(e: DragEvent<HTMLLIElement>, idx: number) {
    e.preventDefault();
    const from = dragIndex.current;
    dragIndex.current = null;
    if (from == null || from === idx) return;
    const next = [...values];
    const [pick] = next.splice(from, 1);
    next.splice(idx, 0, pick);
    onChange(next);
  }
  function onTileDragEnd() {
    dragIndex.current = null;
  }

  function discardPending(task: PendingItem) {
    URL.revokeObjectURL(task.previewUrl);
    setPending((prev) => prev.filter((t) => t.id !== task.id));
  }

  const totalSlots = values.length + pending.length;
  const canAdd = totalSlots < max;
  const isProcessing = pending.some((p) => !p.error);

  return (
    <div className="image-picker image-picker--multi" onPaste={onPaste}>
      {label ? (
        <div className="image-picker__head">
          <label className="field__label">{label}</label>
          <span className="image-picker__count">
            {values.length}/{max}
          </span>
        </div>
      ) : null}

      <div
        className={`image-picker__dropzone ${
          isDragOver ? "image-picker__dropzone--over" : ""
        } ${!canAdd ? "image-picker__dropzone--full" : ""}`}
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        onDrop={onDrop}
        onClick={() => canAdd && inputRef.current?.click()}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if ((e.key === "Enter" || e.key === " ") && canAdd) {
            e.preventDefault();
            inputRef.current?.click();
          }
        }}
      >
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          multiple
          hidden
          disabled={!canAdd}
          onChange={onInputChange}
        />
        <div className="image-picker__dropzone-inner">
          <span className="image-picker__dropzone-icon" aria-hidden>
            ⬆
          </span>
          <strong>
            {canAdd
              ? isProcessing
                ? "Đang nén ảnh…"
                : "Kéo & thả ảnh vào đây"
              : `Đã đạt giới hạn ${max} ảnh`}
          </strong>
          <span className="image-picker__dropzone-sub">
            {canAdd
              ? "hoặc bấm để chọn nhiều tệp · dán ảnh từ clipboard (Ctrl+V)"
              : "Xoá bớt ảnh để tải thêm"}
          </span>
          <span className="image-picker__dropzone-meta">
            JPG · PNG · WebP · AVIF · GIF · ảnh sẽ tự nén ~1280px
          </span>
        </div>
      </div>

      {error ? <p className="image-picker__error">{error}</p> : null}
      {!error && lastInfo ? (
        <p className="image-picker__hint">{lastInfo}</p>
      ) : null}
      {hint ? <p className="image-picker__hint">{hint}</p> : null}

      {(values.length > 0 || pending.length > 0) && (
        <ul className="image-picker__list">
          {values.map((u, i) => {
            const isCover = i === 0;
            const isThumbnail = thumbnail && thumbnail === u;
            return (
              <li
                key={u.slice(0, 64) + i}
                className={`image-picker__tile ${
                  isCover ? "image-picker__tile--cover" : ""
                }`}
                draggable
                onDragStart={(e) => onTileDragStart(e, i)}
                onDragOver={onTileDragOver}
                onDrop={(e) => onTileDrop(e, i)}
                onDragEnd={onTileDragEnd}
                title="Kéo để sắp xếp lại"
              >
                <button
                  type="button"
                  className="image-picker__tile-img"
                  onClick={() => setLightbox(u)}
                  aria-label="Xem ảnh lớn"
                >
                  <img src={safeImage(u)} alt="" loading="lazy" />
                </button>

                <div className="image-picker__badges">
                  {isCover ? (
                    <span className="image-picker__badge image-picker__badge--cover">
                      Cover
                    </span>
                  ) : null}
                  {isThumbnail ? (
                    <span
                      className="image-picker__badge image-picker__badge--thumb"
                      title="Đang dùng làm thumbnail"
                    >
                      ★ Thumbnail
                    </span>
                  ) : null}
                </div>

                <div className="image-picker__overlay">
                  <div className="image-picker__overlay-row">
                    <button
                      type="button"
                      className="image-picker__icon-btn"
                      aria-label="Chuyển trái"
                      onClick={() => move(i, -1)}
                      disabled={i === 0}
                    >
                      ←
                    </button>
                    <button
                      type="button"
                      className="image-picker__icon-btn"
                      aria-label="Chuyển phải"
                      onClick={() => move(i, 1)}
                      disabled={i === values.length - 1}
                    >
                      →
                    </button>
                    {!isCover ? (
                      <button
                        type="button"
                        className="image-picker__icon-btn"
                        aria-label="Đặt làm Cover"
                        onClick={() => makeCover(i)}
                        title="Đưa lên đầu (Cover)"
                      >
                        ⤴
                      </button>
                    ) : null}
                    {onPickThumbnail && !isThumbnail ? (
                      <button
                        type="button"
                        className="image-picker__icon-btn"
                        aria-label="Đặt làm thumbnail"
                        onClick={() => onPickThumbnail(u)}
                        title="Dùng ảnh này làm thumbnail"
                      >
                        ★
                      </button>
                    ) : null}
                    <button
                      type="button"
                      className="image-picker__icon-btn image-picker__icon-btn--danger"
                      aria-label="Xoá ảnh"
                      onClick={() => remove(i)}
                      title="Xoá ảnh"
                    >
                      ×
                    </button>
                  </div>
                </div>
              </li>
            );
          })}

          {pending.map((p) => (
            <li
              key={p.id}
              className={`image-picker__tile image-picker__tile--pending ${
                p.error ? "image-picker__tile--error" : ""
              }`}
            >
              <div className="image-picker__tile-img image-picker__tile-img--static">
                <img src={p.previewUrl} alt={p.name} />
              </div>
              {p.error ? (
                <div className="image-picker__pending-state">
                  <span className="image-picker__pending-msg">{p.error}</span>
                  <button
                    type="button"
                    className="btn btn--xs btn--ghost"
                    onClick={() => discardPending(p)}
                  >
                    Bỏ
                  </button>
                </div>
              ) : (
                <div className="image-picker__pending-state">
                  <div className="image-picker__progress">
                    <div className="image-picker__progress-bar image-picker__progress-bar--indeterminate" />
                  </div>
                  <span className="image-picker__pending-msg">Đang nén…</span>
                </div>
              )}
            </li>
          ))}
        </ul>
      )}

      {lightbox ? (
        <div
          className="image-picker__lightbox"
          role="dialog"
          aria-modal="true"
          onClick={() => setLightbox(null)}
        >
          <img src={safeImage(lightbox)} alt="" />
          <button
            type="button"
            className="image-picker__lightbox-close"
            aria-label="Đóng"
            onClick={() => setLightbox(null)}
          >
            ×
          </button>
        </div>
      ) : null}
    </div>
  );
}
