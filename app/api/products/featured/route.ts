import { json, serverError } from "@/lib/server/http";
import { getFeaturedProducts } from "@/lib/data";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const products = await getFeaturedProducts(8);
    return json({ products });
  } catch (err) {
    return serverError(err);
  }
}
