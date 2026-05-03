import {
  getHomeBundle,
  getPublishedProductCount,
  getRecentApprovedReviews,
} from "@/lib/data";
import Hero from "@/components/home/Hero";
import Marquee from "@/components/home/Marquee";
import CategoriesBento from "@/components/home/CategoriesBento";
import FeaturedGrid from "@/components/home/FeaturedGrid";
import Stats from "@/components/home/Stats";
import Process from "@/components/home/Process";
import Testimonials from "@/components/home/Testimonials";
import BigCTA from "@/components/home/BigCTA";

export const revalidate = 60;

export default async function HomePage() {
  const [bundleResult, reviews, totalCount] = await Promise.all([
    getHomeBundle().catch((err) => {
      console.error("[home] failed to load bundle", err);
      return null;
    }),
    getRecentApprovedReviews(6),
    getPublishedProductCount(),
  ]);

  if (!bundleResult) {
    return (
      <section className="container empty-state">
        <h1>WEBVAULT</h1>
        <p>
          Database chưa được khởi tạo. Hãy chạy{" "}
          <code>npm run db:init && npm run db:seed</code> rồi reload trang.
        </p>
      </section>
    );
  }

  return (
    <>
      <Hero hero={bundleResult.hero} productCount={totalCount} />
      <Marquee />
      <Stats />
      <CategoriesBento categories={bundleResult.categories} />
      <FeaturedGrid
        eyebrow="NỔI BẬT"
        title="Website mẫu được yêu thích nhất"
        products={bundleResult.featured}
        more={{ href: "/san-pham", label: "Xem tất cả" }}
      />
      <FeaturedGrid
        eyebrow="MỚI NHẤT"
        title="Cập nhật mới nhất từ WEBVAULT"
        products={bundleResult.latest}
        more={{ href: "/san-pham?sort=newest", label: "Xem thêm" }}
      />
      <Process />
      <Testimonials reviews={reviews} />
      <BigCTA />
    </>
  );
}
