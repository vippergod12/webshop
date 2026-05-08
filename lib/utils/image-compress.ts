// Client-side image compression helpers (browser only).
// Output là data URL (base64) để lưu thẳng vào DB như cách MINT làm.

export type CompressOptions = {
  /** Cạnh dài tối đa (px). Mặc định 1280. */
  maxSize?: number;
  /** Chất lượng JPEG/WebP từ 0..1. Mặc định 0.82. */
  quality?: number;
  /** MIME đích nếu phải re-encode. Mặc định image/jpeg. */
  type?: "image/jpeg" | "image/webp";
};

const PASSTHROUGH = new Set<string>(["image/svg+xml", "image/gif"]);

function fileToDataUrl(file: File | Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => resolve(String(r.result));
    r.onerror = () => reject(new Error("Đọc tệp thất bại"));
    r.readAsDataURL(file);
  });
}

async function loadBitmap(file: File): Promise<{
  width: number;
  height: number;
  draw: (ctx: CanvasRenderingContext2D, w: number, h: number) => void;
  release: () => void;
}> {
  // Ưu tiên createImageBitmap (xử lý EXIF orientation + nhanh).
  if (typeof createImageBitmap === "function") {
    try {
      const bm = await createImageBitmap(file, {
        imageOrientation: "from-image",
      });
      return {
        width: bm.width,
        height: bm.height,
        draw: (ctx, w, h) => ctx.drawImage(bm, 0, 0, w, h),
        release: () => bm.close?.(),
      };
    } catch {
      // fallback xuống <img>
    }
  }

  const url = URL.createObjectURL(file);
  try {
    const img = await new Promise<HTMLImageElement>((resolve, reject) => {
      const el = new Image();
      el.onload = () => resolve(el);
      el.onerror = () => reject(new Error("Không đọc được ảnh"));
      el.src = url;
    });
    return {
      width: img.naturalWidth,
      height: img.naturalHeight,
      draw: (ctx, w, h) => ctx.drawImage(img, 0, 0, w, h),
      release: () => URL.revokeObjectURL(url),
    };
  } catch (e) {
    URL.revokeObjectURL(url);
    throw e;
  }
}

/**
 * Nén ảnh ngay trên trình duyệt và trả về data URL.
 * - SVG / GIF: pass-through (giữ nguyên).
 * - PNG: giữ PNG nếu ảnh còn nhỏ, hoặc xuất JPEG nếu cần.
 * - Còn lại: re-encode JPEG/WebP với chất lượng `quality`.
 */
export async function compressImage(
  file: File,
  opts: CompressOptions = {}
): Promise<string> {
  const { maxSize = 1280, quality = 0.82, type = "image/jpeg" } = opts;

  if (PASSTHROUGH.has(file.type)) {
    return fileToDataUrl(file);
  }

  const src = await loadBitmap(file);
  try {
    const longest = Math.max(src.width, src.height) || 1;
    const scale = Math.min(1, maxSize / longest);
    const w = Math.max(1, Math.round(src.width * scale));
    const h = Math.max(1, Math.round(src.height * scale));

    const canvas = document.createElement("canvas");
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("Trình duyệt không hỗ trợ canvas");
    // Nền trắng cho JPEG (vì JPEG không có alpha)
    if (type === "image/jpeg") {
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, w, h);
    }
    src.draw(ctx, w, h);

    // PNG nhỏ + có alpha → giữ PNG để không vỡ trong suốt.
    const keepPng =
      file.type === "image/png" && Math.max(w, h) <= 800;
    const outType = keepPng ? "image/png" : type;
    const dataUrl = canvas.toDataURL(outType, quality);
    if (!dataUrl || dataUrl === "data:,") {
      throw new Error("Không xuất được dữ liệu ảnh");
    }
    return dataUrl;
  } finally {
    src.release();
  }
}

export function bytesOfDataUrl(dataUrl: string): number {
  const i = dataUrl.indexOf(",");
  if (i < 0) return 0;
  const b64 = dataUrl.slice(i + 1);
  const padding = b64.endsWith("==") ? 2 : b64.endsWith("=") ? 1 : 0;
  return Math.max(0, Math.floor((b64.length * 3) / 4) - padding);
}

export function formatBytes(n: number): string {
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KB`;
  return `${(n / 1024 / 1024).toFixed(2)} MB`;
}
