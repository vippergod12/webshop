import type { Metadata } from "next";
import {
  ADDRESS,
  EMAIL,
  HOTLINE,
  SITE_NAME,
} from "@/lib/seo/siteConfig";
import { buildPhoneHref, buildZaloUrl } from "@/lib/utils/zalo";
import ContactForm from "./ContactForm";

export const metadata: Metadata = {
  title: "Liên hệ",
  description: `Liên hệ ${SITE_NAME} qua Zalo, hotline, email. Tư vấn miễn phí 24/7.`,
  alternates: { canonical: "/lien-he" },
};

export default function ContactPage() {
  return (
    <>
      <section className="page-hero">
        <div className="container">
          <span className="page-hero__eyebrow">LIÊN HỆ</span>
          <h1 className="page-hero__title">
            Cần tư vấn? <span className="text-gradient">Inbox liền</span>
          </h1>
          <p className="page-hero__lead">
            Đội ngũ {SITE_NAME} sẵn sàng tư vấn template phù hợp, hỗ trợ deploy và rebrand.
          </p>
        </div>
      </section>

      <section className="container contact-grid">
        <a
          className="contact-card contact-card--zalo"
          target="_blank"
          rel="noreferrer"
          href={buildZaloUrl(`Chào ${SITE_NAME}, mình muốn tư vấn website`)}
        >
          <span className="contact-card__icon">💬</span>
          <h3>Zalo</h3>
          <p>Trả lời nhanh nhất — chat trực tiếp 24/7</p>
          <span className="contact-card__cta">Mở Zalo →</span>
        </a>

        {HOTLINE ? (
          <a className="contact-card" href={buildPhoneHref(HOTLINE)}>
            <span className="contact-card__icon">📞</span>
            <h3>Hotline</h3>
            <p>{HOTLINE}</p>
            <span className="contact-card__cta">Gọi ngay →</span>
          </a>
        ) : null}

        {EMAIL ? (
          <a className="contact-card" href={`mailto:${EMAIL}`}>
            <span className="contact-card__icon">✉</span>
            <h3>Email</h3>
            <p>{EMAIL}</p>
            <span className="contact-card__cta">Gửi email →</span>
          </a>
        ) : null}

        {ADDRESS ? (
          <div className="contact-card">
            <span className="contact-card__icon">📍</span>
            <h3>Địa chỉ</h3>
            <p>{ADDRESS}</p>
          </div>
        ) : null}
      </section>

      <section className="container contact-form-wrap">
        <ContactForm />
      </section>
    </>
  );
}
