export default function PublicLoading() {
  return (
    <div className="route-skeleton">
      <div className="container">
        <div className="skeleton skeleton--head" />
        <div className="skeleton skeleton--lead" />
        <div className="grid grid--cards" aria-hidden>
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="skeleton skeleton--card" />
          ))}
        </div>
      </div>
    </div>
  );
}
