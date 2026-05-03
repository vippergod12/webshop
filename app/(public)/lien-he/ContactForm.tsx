"use client";

import { useState } from "react";
import { SITE_NAME } from "@/lib/seo/siteConfig";
import { buildZaloUrl } from "@/lib/utils/zalo";

const TYPES = [
  "Landing page",
  "E-commerce / Shop",
  "Portfolio",
  "SaaS / Dashboard",
  "Doanh nghiệp / Agency",
  "Khác",
];

type SubmitState = "idle" | "submitting" | "success" | "error";

export default function ContactForm() {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [type, setType] = useState(TYPES[0]);
  const [details, setDetails] = useState("");
  const [state, setState] = useState<SubmitState>("idle");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (state === "submitting") return;
    setErrorMsg(null);
    setState("submitting");

    const payload = {
      name: name.trim(),
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
      if (!res.ok) {
        throw new Error(data?.error || `Gửi thất bại (${res.status})`);
      }

      const message = [
        `Chào ${SITE_NAME}, mình muốn được tư vấn:`,
        `- Họ tên: ${payload.name}`,
        `- SĐT: ${payload.phone}`,
        payload.email ? `- Email: ${payload.email}` : null,
        `- Loại website: ${payload.project_type}`,
        payload.message ? `- Mô tả: ${payload.message}` : null,
      ]
        .filter(Boolean)
        .join("\n");
      const url = buildZaloUrl(message);

      setState("success");
      setName("");
      setPhone("");
      setEmail("");
      setType(TYPES[0]);
      setDetails("");

      if (typeof window !== "undefined") {
        window.open(url, "_blank", "noopener,noreferrer");
      }
    } catch (err: any) {
      setState("error");
      setErrorMsg(err?.message || "Gửi yêu cầu thất bại, vui lòng thử lại.");
    }
  }

  return (
    <form className="contact-form" onSubmit={onSubmit}>
      <h2>Form yêu cầu báo giá</h2>
      <p>
        Điền thông tin nhanh, chúng tôi sẽ lưu lại và liên hệ qua Zalo trong vòng 1
        ngày làm việc.
      </p>
      <div className="contact-form__row">
        <label className="field">
          <span>Họ và tên *</span>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            placeholder="Nguyễn Văn A"
            disabled={state === "submitting"}
          />
        </label>
        <label className="field">
          <span>Số điện thoại *</span>
          <input
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            required
            placeholder="0987 xxx xxx"
            pattern="[0-9 +()\-]{8,}"
            disabled={state === "submitting"}
          />
        </label>
      </div>
      <label className="field">
        <span>Email (tuỳ chọn)</span>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="ban@example.com"
          disabled={state === "submitting"}
        />
      </label>
      <label className="field">
        <span>Loại website cần</span>
        <select
          value={type}
          onChange={(e) => setType(e.target.value)}
          disabled={state === "submitting"}
        >
          {TYPES.map((t) => (
            <option key={t}>{t}</option>
          ))}
        </select>
      </label>
      <label className="field">
        <span>Mô tả nhu cầu</span>
        <textarea
          rows={5}
          value={details}
          onChange={(e) => setDetails(e.target.value)}
          placeholder="Mô tả ngắn về website bạn cần, ngân sách, deadline..."
          disabled={state === "submitting"}
        />
      </label>

      {state === "success" ? (
        <div className="form-success" role="status">
          ✓ Đã ghi nhận yêu cầu của bạn. Chúng tôi sẽ liên hệ sớm — Zalo cũng vừa
          được mở ở tab mới để bạn chat trực tiếp nếu cần gấp.
        </div>
      ) : null}
      {state === "error" && errorMsg ? (
        <div className="form-error" role="alert">
          {errorMsg}
        </div>
      ) : null}

      <button
        type="submit"
        className="btn btn--primary btn--lg"
        disabled={state === "submitting"}
      >
        {state === "submitting" ? "Đang gửi…" : "Gửi yêu cầu →"}
      </button>
    </form>
  );
}
