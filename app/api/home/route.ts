import { json, serverError } from "@/lib/server/http";
import { getHomeBundle } from "@/lib/data";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const bundle = await getHomeBundle();
    return json(bundle);
  } catch (err) {
    return serverError(err);
  }
}
