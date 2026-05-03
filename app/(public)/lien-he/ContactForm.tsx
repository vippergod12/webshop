"use client";

import { FormEvent, useState } from "react";
import { SITE_NAME } from "@/lib/seo/siteConfig";
import { buildZaloUrl } from "@/lib/utils/zalo";

type Status = "idle" | "submitting" | "success" | "error";

const TYPES = [
  "Landing page",
  "E-commerce / Shop",
  "Portfolio cá nhân",
  "SaaS / Dashboard",
  "Doanh nghiệp / Agency",
  "Khác",
];

function validatePhone(phone: string): string | null {
  const trimmed = phone.trim();
  if (!trimmed) return "Vui lòng nhập số điện thoại";
  const digits = trimmed.replace(/[^\d]/g, "");
  if (digits.length < 8)
    return "Số điện thoại quá ngắn (tối thiểu 8 chữ số)";
  if (digits.length > 15) return "Số điện thoại quá dài (tối đa 15 chữ số)";
  return null;
}

export default function ContactForm() {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [type, setType] = useState(TYPES[0]);
  const [details, setDetails] = useState("");

  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState<string | null>(null);
  const [phoneTouched, setPhoneTouched] = useState(false);

  const phoneError = phoneTouched ? validatePhone(phone) : null;
  const isSubmitting = status === "submitting";

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setPhoneTouched(true);
    const err = validatePhone(phone);
    if (err) {
      setError(err);
      setStatus("error");
      return;
    }

    setStatus("submitting");
    setError(null);

    const payload = {
      name: name.trim() || "Khách",
      phone: phone.trim(),
      email: email.trim() || null,
      project_type: type,
      message: details.trim() || null,
    };

    try {
      const res = await fetch("/api/contacts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.error || `Gửi thất bại (${res.status})`);

      setStatus("success");
      setName("");
      setPhone("");
      setEmail("");
      setType(TYPES[0]);
      setDetails("");
      setPhoneTouched(false);
    } catch (err: any) {
      setStatus("error");
      setError(err?.message || "Có lỗi xảy ra, vui lòng thử lại.");
    }
  }

  function openZaloFallback() {
    const message = `Chào ${SITE_NAME}, mình muốn được tư vấn template website.`;
    if (typeof window !== "undefined") {
      window.open(buildZaloUrl(message), "_blank", "noopener,noreferrer");
    }
  }

  if (status === "success") {
    return (
      <div className="consult-form-card consult-success" role="status">
        <div className="consult-success-mark" aria-hidden>
          {"✓\uFE0E"}
        </div>
        <h2>Cảm ơn bạn!</h2>
        <p>
          {SITE_NAME} đã nhận được yêu cầu của bạn. Chuyên viên sẽ liên hệ trong
          vòng <strong>1 giờ</strong> (giờ hành chính, 9:00–18:00) để gợi ý
          template phù hợp và gửi báo giá chi tiết.
        </p>
        <div className="consult-success__actions">
          <button
            type="button"
            className="consult-submit consult-submit--ghost"
            onClick={() => setStatus("idle")}
          >
            Gửi yêu cầu khác
          </button>
          <button
            type="button"
            className="consult-submit"
            onClick={openZaloFallback}
          >
            Mở Zalo chat ngay →
          </button>
        </div>
      </div>
    );
  }

  return (
    <form className="consult-form-card" onSubmit={onSubmit} noValidate>
      <header className="consult-form-head">
        <h2 className="consult-form-title">Nhận tư vấn miễn phí</h2>
        <p className="consult-form-sub">
          Điền thông tin — {SITE_NAME} sẽ liên hệ trong 1 giờ.
        </p>
      </header>

      <div className="consult-field">
        <label htmlFor="cf-name">Họ và tên / Tên công ty</label>
        <input
          id="cf-name"
          type="text"
          autoComplete="name"
          maxLength={120}
          placeholder="Nguyễn Văn A / Công ty XYZ"
          value={name}
          onChange={(e) => setName(e.target.value)}
          disabled={isSubmitting}
        />
      </div>

      <div className="consult-field-row">
        <div className="consult-field">
          <label htmlFor="cf-phone">
            Số điện thoại{" "}
            <span className="consult-required" aria-hidden>
              *
            </span>
            <span className="visually-hidden"> (bắt buộc)</span>
          </label>
          <input
            id="cf-phone"
            type="tel"
            inputMode="tel"
            autoComplete="tel"
            required
            maxLength={30}
            placeholder="0901 234 567"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            onBlur={() => setPhoneTouched(true)}
            disabled={isSubmitting}
            aria-invalid={!!phoneError}
            aria-describedby={phoneError ? "cf-phone-err" : undefined}
            className={phoneError ? "has-error" : ""}
          />
          {phoneError ? (
            <span id="cf-phone-err" className="consult-field-error">
              {phoneError}
            </span>
          ) : null}
        </div>
        <div className="consult-field">
          <label htmlFor="cf-email">Email (tuỳ chọn)</label>
          <input
            id="cf-email"
            type="email"
            autoComplete="email"
            maxLength={160}
            placeholder="ban@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={isSubmitting}
          />
        </div>
      </div>

      <div className="consult-field">
        <label htmlFor="cf-type">Loại website cần tư vấn</label>
        <select
          id="cf-type"
          value={type}
          onChange={(e) => setType(e.target.value)}
          disabled={isSubmitting}
        >
          {TYPES.map((t) => (
            <option key={t}>{t}</option>
          ))}
        </select>
      </div>

      <div className="consult-field">
        <label htmlFor="cf-note">Mô tả nhu cầu (không bắt buộc)</label>
        <textarea
          id="cf-note"
          rows={3}
          maxLength={1000}
          placeholder="VD: Cần landing page bán khoá học, ngân sách 5tr, deadline 1 tuần..."
          value={details}
          onChange={(e) => setDetails(e.target.value)}
          disabled={isSubmitting}
        />
      </div>

      {status === "error" && error ? (
        <div className="consult-form-error" role="alert">
          {error}
        </div>
      ) : null}

      <button
        type="submit"
        className="consult-submit"
        disabled={isSubmitting}
      >
        {isSubmitting ? "Đang gửi…" : "Gửi yêu cầu tư vấn →"}
      </button>

      <p className="consult-form-note">
        Bằng việc gửi form, bạn đồng ý cho {SITE_NAME} liên hệ qua số điện thoại
        đã cung cấp để tư vấn template phù hợp.
      </p>
    </form>
  );
}
