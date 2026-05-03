import { sql } from "@/lib/server/db";
import { requireAdmin } from "@/lib/server/auth";
import { badRequest, json, serverError } from "@/lib/server/http";
import { clientIp, rateLimit } from "@/lib/server/rate-limit";
import { getAllReviews, getApprovedReviews } from "@/lib/data";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const NAME_MAX = 120;
const EMAIL_MAX = 160;
const TITLE_MAX = 200;
const COMMENT_MAX = 2000;
const COMMENT_MIN = 10;
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function clip(value: string, max: number) {
  return value.length > max ? value.slice(0, max) : value;
}

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const productId = url.searchParams.get("product_id");
    const all = url.searchParams.get("all") === "1";

    if (productId) {
      const reviews = await getApprovedReviews(Number(productId));
      return json({ reviews });
    }
    if (all) {
      const auth = requireAdmin(req);
      if (auth instanceof Response) return auth;
      const reviews = await getAllReviews({ approvedOnly: false });
      return json({ reviews });
    }
    const reviews = await getAllReviews({ approvedOnly: true });
    return json({ reviews });
  } catch (err) {
    return serverError(err);
  }
}

export async function POST(req: Request) {
  try {
    // Rate-limit: max 3 reviews / 5 minutes per IP.
    const limit = rateLimit(`review:${clientIp(req)}`, {
      windowMs: 5 * 60_000,
      max: 3,
    });
    if (!limit.ok) {
      return json(
        {
          error:
            "Bạn đã gửi quá nhiều đánh giá. Vui lòng thử lại sau ít phút.",
        },
        {
          status: 429,
          headers: {
            "Retry-After": String(
              Math.max(1, Math.ceil((limit.resetAt - Date.now()) / 1000))
            ),
          },
        }
      );
    }

    const body = await req.json().catch(() => ({}));

    const product_id = Number(body.product_id);
    const customer_name = clip(String(body.customer_name || "").trim(), NAME_MAX);
    const customer_email_raw = body.customer_email
      ? String(body.customer_email).trim()
      : "";
    const rating = Math.max(1, Math.min(5, Number(body.rating || 0)));
    const title = body.title
      ? clip(String(body.title).trim(), TITLE_MAX)
      : null;
    const comment = clip(String(body.comment || "").trim(), COMMENT_MAX);

    if (!product_id || Number.isNaN(product_id)) {
      return badRequest("Thiếu product_id hợp lệ");
    }
    if (!customer_name) return badRequest("Vui lòng nhập họ tên");
    if (!rating) return badRequest("Vui lòng chọn số sao đánh giá");
    if (!comment) return badRequest("Vui lòng nhập nội dung đánh giá");
    if (comment.length < COMMENT_MIN) {
      return badRequest(
        `Nội dung đánh giá phải dài tối thiểu ${COMMENT_MIN} ký tự`
      );
    }

    let customer_email: string | null = null;
    if (customer_email_raw) {
      const email = clip(customer_email_raw.toLowerCase(), EMAIL_MAX);
      if (!EMAIL_REGEX.test(email)) {
        return badRequest("Email không hợp lệ");
      }
      customer_email = email;
    }

    const exists = (await sql`
      SELECT id FROM products WHERE id = ${product_id} AND is_published = TRUE LIMIT 1
    `) as any[];
    if (!exists.length) return badRequest("Sản phẩm không tồn tại");

    const rows = (await sql`
      INSERT INTO reviews (product_id, customer_name, customer_email, rating, title, comment, is_approved)
      VALUES (${product_id}, ${customer_name}, ${customer_email}, ${rating}, ${title}, ${comment}, FALSE)
      RETURNING id, created_at
    `) as any[];

    return json({ ok: true, id: rows[0].id }, { status: 201 });
  } catch (err) {
    return serverError(err);
  }
}
