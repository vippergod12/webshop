import { randomBytes } from "crypto";
import { mkdir, writeFile } from "fs/promises";
import path from "path";
import { requireAdmin } from "@/lib/server/auth";
import { badRequest, json, serverError } from "@/lib/server/http";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MAX_BYTES = 8 * 1024 * 1024; // 8MB / file
const ALLOWED_MIME = new Set([
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
  "image/avif",
  "image/gif",
  "image/svg+xml",
]);

const EXT_BY_MIME: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/jpg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/avif": "avif",
  "image/gif": "gif",
  "image/svg+xml": "svg",
};

function safeExt(file: File): string {
  const fromMime = EXT_BY_MIME[file.type];
  if (fromMime) return fromMime;
  const fromName = (file.name.split(".").pop() || "").toLowerCase();
  if (fromName && fromName.length <= 5 && /^[a-z0-9]+$/.test(fromName)) {
    return fromName;
  }
  return "bin";
}

export async function POST(req: Request) {
  try {
    const auth = requireAdmin(req);
    if (auth instanceof Response) return auth;

    let form: FormData;
    try {
      form = await req.formData();
    } catch {
      return badRequest("Yêu cầu phải là multipart/form-data");
    }

    const items = form.getAll("files");
    const files: File[] =
      items.length > 0
        ? (items.filter((v) => v instanceof File) as File[])
        : (() => {
            const single = form.get("file");
            return single instanceof File ? [single] : [];
          })();

    if (!files.length) return badRequest("Không có tệp nào được tải lên");

    const uploadsDir = path.join(process.cwd(), "public", "uploads");
    await mkdir(uploadsDir, { recursive: true });

    const urls: string[] = [];
    for (const file of files) {
      if (file.size === 0) continue;
      if (file.size > MAX_BYTES) {
        return badRequest(
          `Tệp "${file.name}" vượt quá giới hạn ${Math.round(MAX_BYTES / 1024 / 1024)}MB`
        );
      }
      if (file.type && !ALLOWED_MIME.has(file.type)) {
        return badRequest(`Định dạng không hỗ trợ: ${file.type}`);
      }

      const ext = safeExt(file);
      const id = randomBytes(8).toString("hex");
      const stamp = Date.now().toString(36);
      const filename = `${stamp}-${id}.${ext}`;
      const fullPath = path.join(uploadsDir, filename);

      const buf = Buffer.from(await file.arrayBuffer());
      await writeFile(fullPath, buf);

      urls.push(`/uploads/${filename}`);
    }

    if (!urls.length) return badRequest("Không có tệp hợp lệ");

    return json({ urls, url: urls[0] }, { status: 201 });
  } catch (err) {
    return serverError(err);
  }
}
