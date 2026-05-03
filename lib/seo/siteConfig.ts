export const SITE_NAME =
  process.env.NEXT_PUBLIC_SITE_NAME || "WEBVAULT";
export const SITE_TAGLINE = "Marketplace website mẫu Next.js cao cấp";
export const SITE_DESCRIPTION =
  "WEBVAULT — Mua website mẫu Next.js / Tailwind chất lượng cao: landing page, ecommerce, portfolio, SaaS dashboard, blog. Demo Vercel sẵn, code sạch, deploy 1-click.";

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
