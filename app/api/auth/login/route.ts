import { authenticateAdmin, signToken } from "@/lib/server/auth";
import { badRequest, json, serverError } from "@/lib/server/http";
import { clientIp, rateLimit } from "@/lib/server/rate-limit";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    // Brute-force guard: 8 login attempts / 5 minutes per IP.
    const limit = rateLimit(`login:${clientIp(req)}`, {
      windowMs: 5 * 60_000,
      max: 8,
    });
    if (!limit.ok) {
      return json(
        { error: "Quá nhiều lần thử. Vui lòng đợi vài phút." },
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
    const username = String(body.username || "").trim();
    const password = String(body.password || "");
    if (!username || !password) {
      return badRequest("Thiếu username hoặc password");
    }
    const user = await authenticateAdmin(username, password);
    if (!user) {
      return json({ error: "Sai tài khoản hoặc mật khẩu" }, { status: 401 });
    }
    const token = signToken(user);
    return json({ token, user });
  } catch (err) {
    return serverError(err);
  }
}
