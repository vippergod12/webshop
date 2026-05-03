const STATS = [
  { value: "100+", label: "Khách đã mua" },
  { value: "50+", label: "Template Next.js" },
  { value: "4.9★", label: "Trung bình review" },
  { value: "95+", label: "Lighthouse score" },
];

export default function Stats() {
  return (
    <section className="stats-strip">
      <div className="container stats-strip__inner">
        {STATS.map((s) => (
          <div key={s.label} className="stats-strip__item">
            <strong>{s.value}</strong>
            <span>{s.label}</span>
          </div>
        ))}
      </div>
    </section>
  );
}
