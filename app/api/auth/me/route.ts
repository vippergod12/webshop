import { requireAdmin } from "@/lib/server/auth";
import { json, serverError } from "@/lib/server/http";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  try {
    const auth = requireAdmin(req);
    if (auth instanceof Response) return auth;
    return json({ user: { id: auth.sub, username: auth.username } });
  } catch (err) {
    return serverError(err);
  }
}
