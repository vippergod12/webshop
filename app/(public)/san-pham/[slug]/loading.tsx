export default function ProductDetailLoading() {
  return (
    <div className="route-skeleton">
      <div className="container product-detail" aria-hidden>
        <div className="skeleton skeleton--gallery" />
        <div className="product-detail__info">
          <div className="skeleton skeleton--badge" />
          <div className="skeleton skeleton--title" />
          <div className="skeleton skeleton--lead" />
          <div className="skeleton skeleton--price" />
          <div className="skeleton skeleton--actions" />
          <div className="skeleton skeleton--features" />
        </div>
      </div>
    </div>
  );
}
