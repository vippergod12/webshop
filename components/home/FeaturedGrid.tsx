import Link from "next/link";
import type { Product } from "@/lib/types";
import ProductCard from "../ProductCard";

type Props = {
  title: string;
  eyebrow?: string;
  products: Product[];
  more?: { href: string; label: string };
};

export default function FeaturedGrid({ title, eyebrow, products, more }: Props) {
  if (!products?.length) return null;
  return (
    <section className="section">
      <div className="container">
        <header className="section__head">
          <div>
            {eyebrow ? <span className="section__eyebrow">{eyebrow}</span> : null}
            <h2 className="section__title">{title}</h2>
          </div>
          {more ? (
            <Link href={more.href} className="section__link">
              {more.label} →
            </Link>
          ) : null}
        </header>
        <div className="grid grid--cards">
          {products.map((p, i) => (
            <ProductCard key={p.id} product={p} priority={i < 2} />
          ))}
        </div>
      </div>
    </section>
  );
}
