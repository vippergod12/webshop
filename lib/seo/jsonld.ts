import {
  SITE_NAME,
  SITE_URL,
  SITE_DESCRIPTION,
  ZALO_PHONE,
  ADDRESS,
} from "./siteConfig";
import type { Product, Review } from "@/lib/types";

export function organizationLd() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: SITE_NAME,
    url: SITE_URL,
    description: SITE_DESCRIPTION,
    logo: `${SITE_URL}/favicon.svg`,
    contactPoint: ZALO_PHONE
      ? [
          {
            "@type": "ContactPoint",
            telephone: ZALO_PHONE,
            contactType: "customer service",
            areaServed: "VN",
          },
        ]
      : undefined,
    address: ADDRESS
      ? { "@type": "PostalAddress", addressLocality: ADDRESS }
      : undefined,
  };
}

export function productLd(p: Product, reviews: Review[] = []) {
  const url = `${SITE_URL}/san-pham/${p.slug}`;
  const price = p.sale_price ?? p.price;
  const ld: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: p.name,
    description: p.short_description || p.long_description || p.name,
    image: p.images && p.images.length ? p.images : p.thumbnail || undefined,
    sku: `WV-${p.id}`,
    brand: { "@type": "Brand", name: SITE_NAME },
    url,
    offers: {
      "@type": "Offer",
      url,
      priceCurrency: "VND",
      price: String(price),
      availability: "https://schema.org/InStock",
    },
  };

  if (p.review_count && p.avg_rating) {
    ld.aggregateRating = {
      "@type": "AggregateRating",
      ratingValue: p.avg_rating.toFixed(1),
      reviewCount: p.review_count,
    };
  }
  if (reviews.length) {
    ld.review = reviews.slice(0, 5).map((r) => ({
      "@type": "Review",
      reviewRating: {
        "@type": "Rating",
        ratingValue: r.rating,
        bestRating: 5,
      },
      author: { "@type": "Person", name: r.customer_name },
      datePublished: r.created_at,
      reviewBody: r.comment,
      name: r.title || undefined,
    }));
  }
  return ld;
}

export function breadcrumbLd(
  items: Array<{ name: string; url: string }>
) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((it, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: it.name,
      item: it.url,
    })),
  };
}
