export default function ShopLoading() {
  return (
    <div className="route-skeleton">
      <section className="page-hero" aria-hidden>
        <div className="container">
          <div className="skeleton skeleton--eyebrow" />
          <div className="skeleton skeleton--title" />
          <div className="skeleton skeleton--lead" />
          <div className="skeleton skeleton--searchbar" />
        </div>
      </section>

      <section className="container shop">
        <aside className="shop__side" aria-hidden>
          <div className="skeleton skeleton--filter" />
          <div className="skeleton skeleton--filter" />
        </aside>
        <div className="shop__main" aria-hidden>
          <div className="grid grid--cards">
            {Array.from({ length: 12 }).map((_, i) => (
              <div key={i} className="skeleton skeleton--card" />
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
