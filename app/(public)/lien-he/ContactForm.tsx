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

export default function ContactForm() {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [type, setType] = useState(TYPES[0]);
  const [details, setDetails] = useState("");

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const message = [
      `Chào ${SITE_NAME}, mình muốn được tư vấn:`,
      `- Họ tên: ${name}`,
      `- SĐT: ${phone}`,
      `- Loại website: ${type}`,
      details ? `- Mô tả: ${details}` : null,
    ]
      .filter(Boolean)
      .join("\n");
    const url = buildZaloUrl(message);
    if (typeof window !== "undefined") {
      window.open(url, "_blank", "noopener,noreferrer");
    }
  }

  return (
    <form className="contact-form" onSubmit={onSubmit}>
      <h2>Form yêu cầu báo giá</h2>
      <p>Điền thông tin nhanh, chúng tôi sẽ liên hệ qua Zalo.</p>
      <div className="contact-form__row">
        <label className="field">
          <span>Họ và tên *</span>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            placeholder="Nguyễn Văn A"
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
          />
        </label>
      </div>
      <label className="field">
        <span>Loại website cần</span>
        <select value={type} onChange={(e) => setType(e.target.value)}>
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
        />
      </label>
      <button type="submit" className="btn btn--primary btn--lg">
        Gửi qua Zalo →
      </button>
    </form>
  );
}
