import type { Metadata } from "next";
import {
  EMAIL,
  HOTLINE,
  SITE_NAME,
} from "@/lib/seo/siteConfig";
import { buildPhoneHref, buildZaloUrl } from "@/lib/utils/zalo";
import ContactForm from "./ContactForm";

export const metadata: Metadata = {
  title: "Liên hệ & nhận tư vấn",
  description: `Để lại thông tin — đội ngũ ${SITE_NAME} sẽ tư vấn template phù hợp, hỗ trợ deploy và rebrand trong vòng 1 giờ làm việc.`,
  alternates: { canonical: "/lien-he" },
  openGraph: {
    title: `Tư vấn website mẫu — ${SITE_NAME}`,
    description: `Báo giá miễn phí trong 1 giờ cùng chuyên viên ${SITE_NAME}.`,
    url: "/lien-he",
    type: "website",
  },
};

const PERKS = [
  {
    title: "Tư vấn miễn phí, không ràng buộc",
    desc: "Bạn không cần mua ngay sau khi nhận tư vấn — đội ngũ luôn lắng nghe nhu cầu thật.",
  },
  {
    title: "Phản hồi trong 1 giờ giờ hành chính",
    desc: "Chuyên viên gọi lại / inbox Zalo trong vòng 60 phút (T2–T7, 9:00–18:00).",
  },
  {
    title: "Bảo mật tuyệt đối",
    desc: "Số điện thoại + email chỉ dùng cho mục đích tư vấn, không chia sẻ bên thứ ba.",
  },
];

export default function ContactPage() {
  const zaloUrl = buildZaloUrl(`Chào ${SITE_NAME}, mình muốn tư vấn website`);

  return (
    <section className="consult-section">
      <div className="container consult-grid">
        <div className="consult-intro">
          <span className="consult-eyebrow">— Tư vấn &amp; báo giá 1:1 —</span>
          <h1 className="consult-title">
            Để chúng tôi <em>chọn template</em> phù hợp nhất cho bạn
          </h1>
          <p className="consult-lead">
            Mỗi dự án có mục tiêu riêng — landing page, ecommerce, portfolio hay
            dashboard SaaS. Để lại thông tin, chuyên viên {SITE_NAME} sẽ liên hệ
            trong vòng <strong>1 giờ</strong> (giờ hành chính) để gợi ý template
            phù hợp ngân sách và hỗ trợ deploy / rebrand.
          </p>

          <ul className="consult-perks">
            {PERKS.map((p) => (
              <li key={p.title}>
                <span className="consult-perk-mark" aria-hidden>
                  {"◆\uFE0E"}
                </span>
                <div>
                  <strong>{p.title}</strong>
                  <span>{p.desc}</span>
                </div>
              </li>
            ))}
          </ul>

          <div className="consult-direct">
            <span className="consult-direct__label">
              Hoặc liên hệ trực tiếp
            </span>
            <div className="consult-direct__list">
              <a
                className="consult-direct__item consult-direct__item--zalo"
                href={zaloUrl}
                target="_blank"
                rel="noreferrer"
              >
                <span aria-hidden>💬</span>
                <span>Chat Zalo</span>
              </a>
              {HOTLINE ? (
                <a
                  className="consult-direct__item"
                  href={buildPhoneHref(HOTLINE)}
                >
                  <span aria-hidden>📞</span>
                  <span>{HOTLINE}</span>
                </a>
              ) : null}
              {EMAIL ? (
                <a className="consult-direct__item" href={`mailto:${EMAIL}`}>
                  <span aria-hidden>✉</span>
                  <span>{EMAIL}</span>
                </a>
              ) : null}
            </div>
            <span className="consult-direct__hours">
              Giờ làm việc: <strong>T2 — T7 · 09:00 → 18:00</strong>
            </span>
          </div>
        </div>

        <div className="consult-form-wrap">
          <ContactForm />
        </div>
      </div>
    </section>
  );
}
