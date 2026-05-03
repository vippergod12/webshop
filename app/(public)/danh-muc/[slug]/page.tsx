import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getAllProducts, getCategoryBySlug } from "@/lib/data";
import ProductCard from "@/components/ProductCard";

export const revalidate = 60;

type PageProps = { params: { slug: string } };

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const cat = await getCategoryBySlug(params.slug);
  if (!cat) return { title: "Không tìm thấy danh mục" };
  return {
    title: cat.name,
    description: cat.description || `Tất cả website mẫu thuộc danh mục ${cat.name}.`,
    alternates: { canonical: `/danh-muc/${cat.slug}` },
  };
}

export default async function CategoryPage({ params }: PageProps) {
  const cat = await getCategoryBySlug(params.slug);
  if (!cat) notFound();
  const products = await getAllProducts({ categorySlug: cat.slug });

  return (
    <>
      <section className="page-hero">
        <div className="container">
          <nav className="breadcrumb">
            <Link href="/">Trang chủ</Link>
            <span>/</span>
            <Link href="/san-pham">Sản phẩm</Link>
            <span>/</span>
            <span aria-current="page">{cat.name}</span>
          </nav>
          <span className="page-hero__eyebrow">DANH MỤC</span>
          <h1 className="page-hero__title">{cat.name}</h1>
          {cat.description ? <p className="page-hero__lead">{cat.description}</p> : null}
        </div>
      </section>

      <section className="container">
        {products.length ? (
          <div className="grid grid--cards">
            {products.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        ) : (
          <div className="empty-state empty-state--soft">
            <h3>Chưa có sản phẩm nào trong danh mục này</h3>
            <Link href="/san-pham" className="btn btn--primary">
              Xem tất cả sản phẩm
            </Link>
          </div>
        )}
      </section>
    </>
  );
}
