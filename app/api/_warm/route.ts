import { sql } from "@/lib/server/db";
import { json, serverError } from "@/lib/server/http";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  try {
    const secret = process.env.WARM_SECRET;
    if (secret) {
      const url = new URL(req.url);
      if (url.searchParams.get("secret") !== secret) {
        return json({ error: "Forbidden" }, { status: 403 });
      }
    }
    await sql`SELECT 1`;
    return json({ ok: true, ts: Date.now() });
  } catch (err) {
    return serverError(err);
  }
}
