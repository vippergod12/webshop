const STEPS = [
  {
    n: "01",
    title: "Chọn template",
    desc: "Lướt kho 50+ template, xem demo Vercel trực tiếp.",
  },
  {
    n: "02",
    title: "Thanh toán & nhận source",
    desc: "Liên hệ Zalo, chuyển khoản, nhận source code + hướng dẫn.",
  },
  {
    n: "03",
    title: "Customize",
    desc: "Đổi brand, nội dung, kết nối DB Neon của bạn.",
  },
  {
    n: "04",
    title: "Deploy 1-click Vercel",
    desc: "Push GitHub → Vercel auto build, online trong 90 giây.",
  },
];

export default function Process() {
  return (
    <section className="section">
      <div className="container">
        <header className="section__head">
          <div>
            <span className="section__eyebrow">QUY TRÌNH</span>
            <h2 className="section__title">Từ chọn web đến online — 4 bước</h2>
          </div>
        </header>
        <ol className="process">
          {STEPS.map((s) => (
            <li key={s.n} className="process__step">
              <span className="process__num">{s.n}</span>
              <h3>{s.title}</h3>
              <p>{s.desc}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
