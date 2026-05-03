import Link from "next/link";
import { SITE_NAME } from "@/lib/seo/siteConfig";
import { buildZaloUrl } from "@/lib/utils/zalo";

export default function BigCTA() {
  return (
    <section className="big-cta">
      <div className="container big-cta__inner">
        <div className="big-cta__bg" aria-hidden />
        <div className="big-cta__content">
          <span className="big-cta__eyebrow">SẴN SÀNG ĐI VÀO KINH DOANH</span>
          <h2>
            Bạn cần một website <span className="text-gradient">đẹp</span>{" "}
            và <span className="text-gradient">deploy ngay hôm nay?</span>
          </h2>
          <p>
            Chọn ngay một template từ {SITE_NAME}, hoặc liên hệ Zalo để chúng
            tôi thiết kế riêng theo brand của bạn.
          </p>
          <div className="big-cta__actions">
            <Link href="/san-pham" className="btn btn--primary btn--lg">
              Xem tất cả website mẫu
            </Link>
            <a
              className="btn btn--ghost btn--lg"
              target="_blank"
              rel="noreferrer"
              href={buildZaloUrl(`Chào ${SITE_NAME}, mình muốn đặt thiết kế riêng`)}
            >
              💬 Đặt thiết kế qua Zalo
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
