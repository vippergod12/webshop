const ITEMS = [
  "Next.js 14 App Router",
  "TypeScript strict",
  "TailwindCSS",
  "Neon Postgres",
  "Vercel 1-click",
  "ISR 60s",
  "JSON-LD SEO",
  "Sitemap động",
  "Mobile-first",
  "Lighthouse 95+",
  "Framer Motion",
  "MDX ready",
];

export default function Marquee() {
  return (
    <div className="marquee" aria-hidden>
      <div className="marquee__track">
        {[...ITEMS, ...ITEMS].map((t, i) => (
          <span key={i} className="marquee__item">
            <span className="marquee__dot" />
            {t}
          </span>
        ))}
      </div>
    </div>
  );
}
