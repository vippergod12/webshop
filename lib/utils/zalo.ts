import { ZALO_PHONE, ZALO_URL } from "@/lib/seo/siteConfig";

function normalizePhone(phone: string): string {
  const digits = phone.replace(/\D/g, "");
  if (digits.startsWith("0")) return "84" + digits.slice(1);
  if (digits.startsWith("84")) return digits;
  return digits;
}

export function buildZaloUrl(message?: string): string {
  if (ZALO_URL) return ZALO_URL;
  const phone = normalizePhone(ZALO_PHONE || "");
  if (!phone) return "#";
  const base = `https://zalo.me/${phone}`;
  if (!message) return base;
  return `${base}?body=${encodeURIComponent(message)}`;
}

export function buildPhoneHref(phone: string = ZALO_PHONE || ""): string {
  const digits = phone.replace(/\D/g, "");
  return digits ? `tel:${digits}` : "#";
}
