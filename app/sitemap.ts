import type { MetadataRoute } from "next";
import { getAllCategories, getAllProductSlugs } from "@/lib/data";
import { SITE_URL } from "@/lib/seo/siteConfig";

export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = SITE_URL.replace(/\/$/, "");
  const now = new Date();

  const staticUrls: MetadataRoute.Sitemap = [
    { path: "", priority: 1 },
    { path: "/san-pham", priority: 0.9 },
    { path: "/ve-chung-toi", priority: 0.6 },
    { path: "/lien-he", priority: 0.6 },
  ].map(({ path, priority }) => ({
    url: `${base}${path}`,
    lastModified: now,
    changeFrequency: "weekly" as const,
    priority,
  }));

  const [cats, products] = await Promise.all([
    getAllCategories().catch(() => []),
    getAllProductSlugs().catch(() => []),
  ]);

  const catUrls: MetadataRoute.Sitemap = cats.map((c) => ({
    url: `${base}/danh-muc/${c.slug}`,
    lastModified: now,
    changeFrequency: "weekly",
    priority: 0.6,
  }));

  const productUrls: MetadataRoute.Sitemap = products.map((p) => ({
    url: `${base}/san-pham/${p.slug}`,
    lastModified: p.updated_at ? new Date(p.updated_at) : now,
    changeFrequency: "weekly",
    priority: 0.8,
  }));

  return [...staticUrls, ...catUrls, ...productUrls];
}
