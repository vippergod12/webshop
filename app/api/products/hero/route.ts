import { json, serverError } from "@/lib/server/http";
import { getHeroProduct } from "@/lib/data";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const product = await getHeroProduct();
    return json({ product });
  } catch (err) {
    return serverError(err);
  }
}
