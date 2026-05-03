"use client";

import { forwardRef } from "react";
import { EMAIL, HOTLINE, SITE_NAME } from "@/lib/seo/siteConfig";
import { buildPhoneHref, buildZaloUrl } from "@/lib/utils/zalo";

function ZaloIcon({ size = 22 }: { size?: number }) {
  return (
    <svg viewBox="0 0 64 64" width={size} height={size} aria-hidden focusable="false">
      <path
        fill="currentColor"
        d="M32 6C16.5 6 4 16.7 4 30c0 7 3.5 13.3 9.2 17.6-.5 2.5-1.7 5.7-4 8 .3.4.8.6 1.4.5 4.3-.5 8.5-2.2 11.5-3.7 3.2.9 6.5 1.4 9.9 1.4 15.5 0 28-10.7 28-24S47.5 6 32 6zm-9.6 28.7h-6.7c-.6 0-1-.4-1-1v-9.5c0-.6.4-1 1-1s1 .4 1 1v8.5h5.7c.6 0 1 .4 1 1s-.4 1-1 1zm5-1c0 .6-.4 1-1 1s-1-.4-1-1v-9.5c0-.6.4-1 1-1s1 .4 1 1v9.5zm9.4 0c0 .6-.4 1-1 1-.3 0-.6-.2-.8-.4l-5-6.6v6c0 .6-.4 1-1 1s-1-.4-1-1v-9.5c0-.6.4-1 1-1 .3 0 .6.2.8.4l5 6.6v-6c0-.6.4-1 1-1s1 .4 1 1v9.5zm10.6 0c0 .3-.2.6-.4.8-.2.2-.4.3-.6.3h-6c-.6 0-1-.4-1-1v-9.5c0-.6.4-1 1-1s1 .4 1 1v8.5h5c.6 0 1 .4 1 .9z"
      />
    </svg>
  );
}

type Props = { onClose: () => void };

const FloatingZaloCard = forwardRef<HTMLDivElement, Props>(function FloatingZaloCard(
  { onClose },
  ref,
) {
  const zaloHref = buildZaloUrl(`Xin chào ${SITE_NAME}, mình muốn tư vấn website mẫu.`);
  const phoneHref = buildPhoneHref(HOTLINE || "");

  return (
    <div
      ref={ref}
      className="zpop"
      role="dialog"
      aria-modal="false"
      aria-label={`Chat Zalo với ${SITE_NAME}`}
    >
      <div className="zpop__head">
        <div className="zpop__avatar" aria-hidden>
          <span>⚡</span>
          <i className="zpop__online" />
        </div>
        <div className="zpop__head-text">
          <strong className="zpop__name">{SITE_NAME}</strong>
          <span className="zpop__status">
            <i /> Đang online · phản hồi &lt; 5 phút
          </span>
        </div>
        <button
          type="button"
          className="zpop__close"
          aria-label="Đóng popup"
          onClick={onClose}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
            <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" />
          </svg>
        </button>
      </div>

      <div className="zpop__body">
        <div className="zpop__bubble">
          <p>
            Xin chào 👋 Mình là <strong>{SITE_NAME}</strong>.
          </p>
          <p>
            Bạn cần tư vấn website mẫu, custom domain hay deploy lên Vercel?
            Nhắn mình qua Zalo nhé — phản hồi nhanh, miễn phí.
          </p>
        </div>

        <ul className="zpop__perks">
          <li>
            <span className="zpop__perk-dot" />
            Tư vấn 1:1 chọn template hợp ngành
          </li>
          <li>
            <span className="zpop__perk-dot" />
            Hỗ trợ deploy &amp; custom domain
          </li>
          <li>
            <span className="zpop__perk-dot" />
            Bảo hành codebase trọn đời
          </li>
        </ul>
      </div>

      <div className="zpop__foot">
        <a
          className="zpop__cta"
          href={zaloHref}
          target="_blank"
          rel="noreferrer"
          onClick={onClose}
        >
          <ZaloIcon size={20} />
          <span>Chat ngay qua Zalo</span>
        </a>
        <div className="zpop__alt">
          {HOTLINE && (
            <a className="zpop__alt-link" href={phoneHref}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                <path
                  d="M5 4h3l2 5-2.5 1.5a11 11 0 0 0 6 6L15 14l5 2v3a2 2 0 0 1-2 2A15 15 0 0 1 3 6a2 2 0 0 1 2-2Z"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinejoin="round"
                />
              </svg>
              {HOTLINE}
            </a>
          )}
          {EMAIL && (
            <a className="zpop__alt-link" href={`mailto:${EMAIL}`}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                <path
                  d="M4 6h16v12H4zM4 7l8 6 8-6"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinejoin="round"
                />
              </svg>
              Email
            </a>
          )}
        </div>
      </div>
    </div>
  );
});

export default FloatingZaloCard;
