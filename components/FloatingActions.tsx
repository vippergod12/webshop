import { HOTLINE, SITE_NAME } from "@/lib/seo/siteConfig";
import { buildPhoneHref, buildZaloUrl } from "@/lib/utils/zalo";

export default function FloatingActions() {
  const zaloHref = buildZaloUrl(`Chào ${SITE_NAME}, mình muốn tư vấn website`);
  const phoneHref = HOTLINE ? buildPhoneHref(HOTLINE) : null;

  return (
    <div className="floating">
      {phoneHref ? (
        <a
          className="floating__btn floating__btn--phone"
          href={phoneHref}
          aria-label="Gọi hotline"
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
            <path
              d="M5.5 4.5h3l1.5 4-2 1.5a12 12 0 0 0 6 6l1.5-2 4 1.5v3a2 2 0 0 1-2 2A16 16 0 0 1 3.5 6.5a2 2 0 0 1 2-2Z"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinejoin="round"
            />
          </svg>
        </a>
      ) : null}
      <a
        className="floating__btn floating__btn--zalo"
        href={zaloHref}
        target="_blank"
        rel="noreferrer"
        aria-label="Chat Zalo"
      >
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
          <path
            d="M4 6.5A4.5 4.5 0 0 1 8.5 2h7A4.5 4.5 0 0 1 20 6.5v7a4.5 4.5 0 0 1-4.5 4.5H10l-4 4v-4.4A4.5 4.5 0 0 1 4 13.5v-7Z"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinejoin="round"
          />
        </svg>
      </a>
    </div>
  );
}
