export const SITE_NAME =
  process.env.NEXT_PUBLIC_SITE_NAME || "RISE";
export const SITE_TAGLINE = "Reliable · Innovative · Scalable · Efficient";
export const SITE_DESCRIPTION =
  "RISE — Marketplace website mẫu Next.js cao cấp: Reliable (đáng tin), Innovative (hiện đại), Scalable (mở rộng tốt), Efficient (hiệu năng cao). Landing page, ecommerce, portfolio, SaaS dashboard, blog — demo Vercel sẵn, code sạch, deploy 1-click.";

export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ||
  "http://localhost:3000";

export const ZALO_PHONE = process.env.NEXT_PUBLIC_ZALO_PHONE || "";
export const ZALO_URL = process.env.NEXT_PUBLIC_ZALO_URL || "";
export const HOTLINE = process.env.NEXT_PUBLIC_HOTLINE || ZALO_PHONE;
export const EMAIL = process.env.NEXT_PUBLIC_EMAIL || "";
export const ADDRESS = process.env.NEXT_PUBLIC_ADDRESS || "";

export const SOCIAL = {
  facebook: "",
  github: "",
  youtube: "",
};
