export default function CategoryLoading() {
  return (
    <div className="route-skeleton">
      <section className="page-hero" aria-hidden>
        <div className="container">
          <div className="skeleton skeleton--breadcrumb" />
          <div className="skeleton skeleton--eyebrow" />
          <div className="skeleton skeleton--title" />
          <div className="skeleton skeleton--lead" />
        </div>
      </section>
      <section className="container">
        <div className="grid grid--cards" aria-hidden>
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="skeleton skeleton--card" />
          ))}
        </div>
      </section>
    </div>
  );
}
