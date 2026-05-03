import Link from "next/link";
import {
  ADDRESS,
  EMAIL,
  HOTLINE,
  SITE_NAME,
  SITE_TAGLINE,
} from "@/lib/seo/siteConfig";
import { buildPhoneHref, buildZaloUrl } from "@/lib/utils/zalo";
import { getAllCategories } from "@/lib/data";

export const revalidate = 300;

export default async function Footer() {
  let cats: Awaited<ReturnType<typeof getAllCategories>> = [];
  try {
    cats = await getAllCategories();
  } catch {
    cats = [];
  }

  return (
    <footer className="footer">
      <div className="container footer__grid">
        <div className="footer__col footer__col--brand">
          <Link href="/" className="footer__brand">
            <span className="footer__logo">⚡</span>
            <span className="footer__name">{SITE_NAME}</span>
          </Link>
          <p className="footer__tagline">{SITE_TAGLINE}</p>
          <p className="footer__addr">{ADDRESS}</p>
        </div>

        <div className="footer__col">
          <h4>Khám phá</h4>
          <ul>
            <li><Link href="/san-pham">Tất cả sản phẩm</Link></li>
            <li><Link href="/san-pham?sort=rating">Top đánh giá</Link></li>
            <li><Link href="/san-pham?sort=popular">Phổ biến nhất</Link></li>
            <li><Link href="/ve-chung-toi">Về chúng tôi</Link></li>
            <li><Link href="/lien-he">Liên hệ</Link></li>
          </ul>
        </div>

        <div className="footer__col">
          <h4>Danh mục</h4>
          <ul>
            {cats.slice(0, 8).map((c) => (
              <li key={c.id}>
                <Link href={`/danh-muc/${c.slug}`}>{c.name}</Link>
              </li>
            ))}
          </ul>
        </div>

        <div className="footer__col">
          <h4>Hỗ trợ</h4>
          <ul>
            {HOTLINE ? (
              <li>
                <a href={buildPhoneHref(HOTLINE)}>📞 {HOTLINE}</a>
              </li>
            ) : null}
            <li>
              <a
                href={buildZaloUrl(`Xin chào ${SITE_NAME}, mình muốn tư vấn`)}
                target="_blank"
                rel="noreferrer"
              >
                💬 Chat Zalo
              </a>
            </li>
            {EMAIL ? (
              <li>
                <a href={`mailto:${EMAIL}`}>✉ {EMAIL}</a>
              </li>
            ) : null}
          </ul>
        </div>
      </div>

      <div className="footer__bottom">
        <div className="container footer__bottom-inner">
          <span>© {new Date().getFullYear()} {SITE_NAME}. All rights reserved.</span>
          <span>Built with Next.js · Hosted on Vercel</span>
        </div>
      </div>
    </footer>
  );
}
