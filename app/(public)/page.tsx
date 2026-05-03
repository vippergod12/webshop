import { Suspense } from "react";
import dynamic from "next/dynamic";
import {
  getFeaturedProducts,
  getHeroProduct,
  getLatestProducts,
  getPublishedProductCount,
  getRecentApprovedReviews,
  getAllCategories,
} from "@/lib/data";
import Hero from "@/components/home/Hero";
import Marquee from "@/components/home/Marquee";
import Stats from "@/components/home/Stats";
import FeaturedGrid from "@/components/home/FeaturedGrid";

const CategoriesBento = dynamic(() => import("@/components/home/CategoriesBento"));
const Process = dynamic(() => import("@/components/home/Process"));
const Testimonials = dynamic(() => import("@/components/home/Testimonials"));
const BigCTA = dynamic(() => import("@/components/home/BigCTA"));

export const revalidate = 60;

function SectionSkeleton() {
  return (
    <section className="section">
      <div className="container">
        <div className="skeleton skeleton--head" />
        <div className="grid grid--cards">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="skeleton skeleton--card" />
          ))}
        </div>
      </div>
    </section>
  );
}

async function HeroBlock() {
  const [hero, totalCount] = await Promise.all([
    getHeroProduct().catch(() => null),
    getPublishedProductCount().catch(() => 0),
  ]);
  return <Hero hero={hero} productCount={totalCount} />;
}

async function CategoriesBlock() {
  const categories = await getAllCategories().catch(() => []);
  return <CategoriesBento categories={categories} />;
}

async function FeaturedBlock() {
  const products = await getFeaturedProducts(8).catch(() => []);
  if (!products.length) return null;
  return (
    <FeaturedGrid
      eyebrow="NỔI BẬT"
      title="Website mẫu được yêu thích nhất"
      products={products}
      more={{ href: "/san-pham", label: "Xem tất cả" }}
    />
  );
}

async function LatestBlock() {
  const products = await getLatestProducts(8).catch(() => []);
  if (!products.length) return null;
  return (
    <FeaturedGrid
      eyebrow="MỚI NHẤT"
      title="Cập nhật mới nhất từ WEBVAULT"
      products={products}
      more={{ href: "/san-pham?sort=newest", label: "Xem thêm" }}
    />
  );
}

async function TestimonialsBlock() {
  const reviews = await getRecentApprovedReviews(6).catch(() => []);
  return <Testimonials reviews={reviews} />;
}

export default function HomePage() {
  return (
    <>
      <Suspense fallback={<div className="hero hero--skeleton" />}>
        <HeroBlock />
      </Suspense>

      <Marquee />
      <Stats />

      <Suspense fallback={<SectionSkeleton />}>
        <CategoriesBlock />
      </Suspense>

      <Suspense fallback={<SectionSkeleton />}>
        <FeaturedBlock />
      </Suspense>

      <Suspense fallback={<SectionSkeleton />}>
        <LatestBlock />
      </Suspense>

      <Process />

      <Suspense fallback={<SectionSkeleton />}>
        <TestimonialsBlock />
      </Suspense>

      <BigCTA />
    </>
  );
}
