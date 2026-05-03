import { neon } from "@neondatabase/serverless";
import bcrypt from "bcryptjs";

const url = process.env.DATABASE_URL;
if (!url) {
  console.error("[seed] Missing DATABASE_URL in .env");
  process.exit(1);
}

const ADMIN_USERNAME = process.env.ADMIN_USERNAME || "admin";
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "admin123";

const sql = neon(url);

// ---------- ADMIN ----------
const passwordHash = await bcrypt.hash(ADMIN_PASSWORD, 10);
await sql`
  INSERT INTO admins (username, password_hash)
  VALUES (${ADMIN_USERNAME}, ${passwordHash})
  ON CONFLICT (username) DO UPDATE SET password_hash = EXCLUDED.password_hash
`;
console.log(`[admin] seeded user "${ADMIN_USERNAME}"`);

// ---------- WIPE EXISTING CONTENT (admins preserved) ----------
// Cho phép chạy lại seed nhiều lần mà không bị tích tụ dữ liệu cũ
// (ví dụ: 14 sản phẩm fictitious của lần seed trước).
console.log("[wipe] xóa reviews + products cũ trước khi seed lại...");
await sql`DELETE FROM reviews`;
await sql`DELETE FROM products`;

// ---------- CATEGORIES ----------
const categories = [
  {
    slug: "ecommerce",
    name: "E-commerce / Shop",
    description: "Website bán hàng hoàn chỉnh: shop trang sức, túi, mỹ phẩm, thời trang.",
    icon: "shopping-bag",
    image_url:
      "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=1600&q=80",
    sort_order: 1,
  },
  {
    slug: "doanh-nghiep",
    name: "Doanh nghiệp / Studio",
    description: "Website công ty, agency, studio thiết kế chuyên nghiệp.",
    icon: "building",
    image_url:
      "https://images.unsplash.com/photo-1505691938895-1758d7feb511?w=1600&q=80",
    sort_order: 2,
  },
  {
    slug: "portfolio",
    name: "Portfolio cá nhân",
    description: "Trang giới thiệu bản thân: developer, designer, freelancer.",
    icon: "user",
    image_url:
      "https://images.unsplash.com/photo-1517292987719-0369a794ec0f?w=1600&q=80",
    sort_order: 3,
  },
  {
    slug: "landing-page",
    name: "Landing Page",
    description: "Trang đích bán hàng, ra mắt sản phẩm, chiến dịch marketing.",
    icon: "rocket",
    image_url:
      "https://images.unsplash.com/photo-1559136555-9303baea8ebd?w=1600&q=80",
    sort_order: 4,
  },
  {
    slug: "saas-dashboard",
    name: "SaaS / Dashboard",
    description: "Giao diện admin, dashboard, app SaaS đa tính năng.",
    icon: "layout-dashboard",
    image_url:
      "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=1600&q=80",
    sort_order: 5,
  },
  {
    slug: "blog-magazine",
    name: "Blog / Magazine",
    description: "Blog cá nhân, tạp chí số, content site SEO chuẩn.",
    icon: "book-open",
    image_url:
      "https://images.unsplash.com/photo-1499750310107-5fef28a66643?w=1600&q=80",
    sort_order: 6,
  },
  {
    slug: "nha-hang-cafe",
    name: "Nhà hàng / Café",
    description: "Menu online, đặt bàn, giới thiệu không gian.",
    icon: "coffee",
    image_url:
      "https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=1600&q=80",
    sort_order: 7,
  },
  {
    slug: "bat-dong-san",
    name: "Bất động sản",
    description: "Listing dự án, căn hộ, trang môi giới chuyên nghiệp.",
    icon: "home",
    image_url:
      "https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=1600&q=80",
    sort_order: 8,
  },
];

const catMap = new Map();
for (const c of categories) {
  const rows = await sql`
    INSERT INTO categories (slug, name, description, icon, image_url, sort_order)
    VALUES (${c.slug}, ${c.name}, ${c.description}, ${c.icon}, ${c.image_url}, ${c.sort_order})
    ON CONFLICT (slug) DO UPDATE
      SET name = EXCLUDED.name,
          description = EXCLUDED.description,
          icon = EXCLUDED.icon,
          image_url = EXCLUDED.image_url,
          sort_order = EXCLUDED.sort_order,
          updated_at = NOW()
    RETURNING id, slug
  `;
  catMap.set(rows[0].slug, rows[0].id);
  console.log(`[cat] ${c.slug}`);
}

// ---------- PRODUCTS — 5 dự án thật của vippergod12 ----------
const products = [
  // 1. AURA — corporate / interior studio (HERO)
  {
    slug: "aura-interior-studio",
    name: "AURA — Studio thiết kế nội thất",
    cat: "doanh-nghiep",
    short:
      "Website studio thiết kế nội thất cao cấp với theme cream + champagne luxury, admin CRUD dự án đầy đủ.",
    long:
      "Website giới thiệu studio thiết kế & thi công nội thất cao cấp với SEO tối đa.\n\nGồm trang chủ (Hero, Marquee, Services, Categories Bento, Featured Projects, Process, Story, Testimonials, BigCTA), trang tất cả dự án có lọc & search, trang chi tiết dự án với JSON-LD InteriorDesignBusiness + Zalo CTA, trang dịch vụ trọn gói, giới thiệu, và liên hệ.\n\nAdmin panel CRUD dự án (JWT lưu localStorage), seed sẵn 8 danh mục + 23 dự án mẫu (toàn TP.HCM, tên hư cấu để tránh bản quyền). Bảng màu luxury (cream + champagne + ink).",
    price: 1990000,
    sale_price: 1490000,
    demo_url: "https://aura-pearl-ten.vercel.app",
    repo_url: "https://github.com/vippergod12/aura",
    thumbnail:
      "https://images.unsplash.com/photo-1505691938895-1758d7feb511?w=1600&q=80",
    images: [
      "https://images.unsplash.com/photo-1505691938895-1758d7feb511?w=1600&q=80",
      "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=1600&q=80",
      "https://images.unsplash.com/photo-1513694203232-719a280e022f?w=1600&q=80",
    ],
    tech: [
      "Next.js 14",
      "App Router",
      "TypeScript",
      "Neon Postgres",
      "JWT auth",
      "ISR 60s",
    ],
    features: [
      "8 danh mục + 23 dự án seed (TP.HCM)",
      "Admin CRUD dự án + ảnh + JSON-LD",
      "Trang chủ Bento + Featured + Story + Testimonials",
      "JSON-LD InteriorDesignBusiness + sitemap động",
      "Liên hệ qua Zalo + form + hotline + email",
      "SEO Lighthouse 95+, ISR 60s",
    ],
    tags: ["interior", "luxury", "corporate", "admin", "next.js"],
    is_featured: true,
    is_hero: true,
  },
  // 2. PURE — ecommerce trang sức
  {
    slug: "pure-jewelry-shop",
    name: "PURE — Shop trang sức đá quý",
    cat: "ecommerce",
    short:
      "Shop trang sức đá quý cao cấp (ngọc lục bảo, ruby, sapphire, kim cương). Admin CRUD, JWT, Neon DB.",
    long:
      "P.U.R.E (Precious, Unique, Rare, Eternal) — Website bán trang sức đá quý cao cấp.\n\n7 danh mục: nhẫn, vòng cổ, mặt dây chuyền, hoa tai, vòng tay, bộ trang sức cô dâu, charm & phụ kiện. 22 sản phẩm mẫu được seed sẵn (ngọc trai Akoya/Tahiti, ruby Myanmar, sapphire halo, kim cương tennis...).\n\nTrang chủ: Hero, Marquee, HotBento, TrendingGrid, Story, BigCTA. Admin panel CRUD đầy đủ (JWT). Bundle data trang chủ qua /api/home (1 request). Có /api/_warm để cron giữ Neon DB warm. Theme emerald + champagne.",
    price: 1890000,
    sale_price: null,
    demo_url: "https://pure-snowy.vercel.app",
    repo_url: "https://github.com/vippergod12/pure",
    thumbnail:
      "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=1600&q=80",
    images: [
      "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=1600&q=80",
      "https://images.unsplash.com/photo-1611591437281-460bfbe1220a?w=1600&q=80",
      "https://images.unsplash.com/photo-1599643477877-530eb83abc8e?w=1600&q=80",
    ],
    tech: [
      "Next.js 14",
      "App Router",
      "TypeScript",
      "Neon Postgres",
      "JWT auth",
      "ISR 60s",
    ],
    features: [
      "7 danh mục + 22 sản phẩm trang sức seed",
      "Admin CRUD sản phẩm + danh mục",
      "Bundle data API /api/home (1 request)",
      "Cron warm Neon qua /api/_warm",
      "JSON-LD Product + sitemap động",
      "Theme emerald + champagne sang trọng",
    ],
    tags: ["ecommerce", "jewelry", "luxury", "admin", "next.js"],
    is_featured: true,
    is_hero: false,
  },
  // 3. MINT — ecommerce túi vải
  {
    slug: "mint-tote-bag-shop",
    name: "MINT — Shop túi vải không dệt",
    cat: "ecommerce",
    short:
      "Website bán & nhận in túi vải không dệt cao cấp. Theme mint + cream tươi mát, eco-friendly.",
    long:
      "Shop chuyên túi vải không dệt + nhận in logo theo yêu cầu.\n\n8 danh mục: túi quai xách (Classic 30x40, Mini, Lớn 40x50), túi dây rút, túi hộp đáy vuông, túi in logo (in lụa / offset CMYK / in nhiệt), túi hội nghị & sự kiện, túi siêu thị, túi tote thời trang (MINT Eco Canvas-look, Quote tiếng Anh, Kawaii), túi quà tặng (Tết, cưới hỏi, Noel).\n\n22 sản phẩm mẫu. Admin panel CRUD đầy đủ. Theme mint + cream tươi mát phù hợp brand thân thiện môi trường.",
    price: 1690000,
    sale_price: 1290000,
    demo_url: "https://mint-one-pi.vercel.app",
    repo_url: "https://github.com/vippergod12/MINT",
    thumbnail:
      "https://images.unsplash.com/photo-1597481499750-3e6b22637e12?w=1600&q=80",
    images: [
      "https://images.unsplash.com/photo-1597481499750-3e6b22637e12?w=1600&q=80",
      "https://images.unsplash.com/photo-1591561954557-26941169b49e?w=1600&q=80",
      "https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=1600&q=80",
    ],
    tech: [
      "Next.js 14",
      "App Router",
      "TypeScript",
      "Neon Postgres",
      "JWT auth",
    ],
    features: [
      "8 danh mục + 22 sản phẩm túi vải seed",
      "Admin CRUD sản phẩm",
      "Trang danh mục động + ISR 60s",
      "JSON-LD Product + sitemap động",
      "Theme mint + cream eco-friendly",
      "Zalo CTA + hotline + email",
    ],
    tags: ["ecommerce", "bag", "eco", "admin", "next.js"],
    is_featured: true,
    is_hero: false,
  },
  // 4. TriShop — ecommerce boilerplate (pattern API folder)
  {
    slug: "trishop-boilerplate",
    name: "TriShop — Boilerplate shop CRUD",
    cat: "ecommerce",
    short:
      "Boilerplate Next.js + Vercel Functions + Neon. Pattern api/ folder thay vì App Router — dễ migrate từ Express.",
    long:
      "Template gốc cho mọi shop nhỏ. Pattern dùng Vercel Serverless Functions trong thư mục api/ riêng (giữ pattern Express cũ, dễ migrate).\n\nFrontend Next.js 14 App Router + TypeScript + ISR 60s. Backend Vercel Functions ở thư mục api/ với _lib/ chia sẻ db + auth + http helpers. AuthContext client-side. ProductDetailCta (chọn màu + Zalo) tách riêng client.\n\n3 danh mục + 6 sản phẩm seed mẫu. Code sạch, comment tiếng Việt rõ ràng. Easy rebrand cho thời trang, mỹ phẩm, đồ gia dụng.",
    price: 990000,
    sale_price: 690000,
    demo_url: "https://trishop-sooty.vercel.app",
    repo_url: "https://github.com/vippergod12/trishop",
    thumbnail:
      "https://images.unsplash.com/photo-1483985988355-763728e1935b?w=1600&q=80",
    images: [
      "https://images.unsplash.com/photo-1483985988355-763728e1935b?w=1600&q=80",
      "https://images.unsplash.com/photo-1556905055-8f358a7a47b2?w=1600&q=80",
    ],
    tech: [
      "Next.js 14",
      "App Router (pages)",
      "Vercel Functions (api/)",
      "TypeScript",
      "Neon Postgres",
      "AuthContext",
    ],
    features: [
      "Boilerplate đa năng",
      "Pattern api/ folder cổ điển (dễ migrate Express)",
      "AuthContext + ProductDetailCta client",
      "Code sạch, comment tiếng Việt",
      "Easy rebrand cho mọi ngành",
      "ISR 60s + sitemap động",
    ],
    tags: ["ecommerce", "boilerplate", "starter", "next.js"],
    is_featured: false,
    is_hero: false,
  },
  // 5. my-portfolio — Vite + React + Tailwind
  {
    slug: "my-portfolio-vite-react",
    name: "My Portfolio — React + Vite + Tailwind",
    cat: "portfolio",
    short:
      "Portfolio cá nhân React 18 + TypeScript + Vite + Tailwind. Setup tối giản với HMR siêu nhanh + ESLint.",
    long:
      "Template portfolio cho dev / designer / freelancer.\n\nStack hiện đại: React 18 + TypeScript + Vite (HMR siêu nhanh, build dưới 5s) + TailwindCSS. ESLint config sẵn. tsconfig.app.json + tsconfig.node.json tách rõ. Phù hợp làm CV trực tuyến, showcase project cá nhân, blog mini.\n\nDeploy 1-click lên Vercel. Khác biệt với các portfolio template khác: dùng Vite (không phải Next.js) → SPA siêu nhẹ, không cần SSR cho trang cá nhân.",
    price: 690000,
    sale_price: 490000,
    demo_url: "https://my-portfolio-blond-chi-74.vercel.app",
    repo_url: "https://github.com/vippergod12/my-portfolio",
    thumbnail:
      "https://images.unsplash.com/photo-1517292987719-0369a794ec0f?w=1600&q=80",
    images: [
      "https://images.unsplash.com/photo-1517292987719-0369a794ec0f?w=1600&q=80",
      "https://images.unsplash.com/photo-1542744173-8e7e53415bb0?w=1600&q=80",
    ],
    tech: [
      "React 18",
      "TypeScript",
      "Vite",
      "TailwindCSS",
      "ESLint flat config",
    ],
    features: [
      "Stack hiện đại Vite + React + TS (không SSR)",
      "TailwindCSS configured sẵn",
      "HMR siêu nhanh, build < 5s",
      "ESLint flat config + tsconfig sạch",
      "Deploy 1-click Vercel",
      "Phù hợp CV / showcase cá nhân",
    ],
    tags: ["portfolio", "react", "vite", "personal", "spa"],
    is_featured: true,
    is_hero: false,
  },
];

for (const p of products) {
  const catId = catMap.get(p.cat) || null;
  await sql`
    INSERT INTO products (
      category_id, slug, name, short_description, long_description,
      price, sale_price, demo_url, repo_url, thumbnail, images,
      tech_stack, features, tags, is_featured, is_hero, is_published
    ) VALUES (
      ${catId}, ${p.slug}, ${p.name}, ${p.short}, ${p.long},
      ${p.price}, ${p.sale_price ?? null}, ${p.demo_url}, ${p.repo_url}, ${p.thumbnail}, ${p.images},
      ${p.tech}, ${p.features}, ${p.tags}, ${p.is_featured ?? false}, ${p.is_hero ?? false}, TRUE
    )
    ON CONFLICT (slug) DO UPDATE SET
      category_id = EXCLUDED.category_id,
      name = EXCLUDED.name,
      short_description = EXCLUDED.short_description,
      long_description = EXCLUDED.long_description,
      price = EXCLUDED.price,
      sale_price = EXCLUDED.sale_price,
      demo_url = EXCLUDED.demo_url,
      repo_url = EXCLUDED.repo_url,
      thumbnail = EXCLUDED.thumbnail,
      images = EXCLUDED.images,
      tech_stack = EXCLUDED.tech_stack,
      features = EXCLUDED.features,
      tags = EXCLUDED.tags,
      is_featured = EXCLUDED.is_featured,
      is_hero = EXCLUDED.is_hero,
      is_published = EXCLUDED.is_published,
      updated_at = NOW()
  `;
  console.log(`[product] ${p.slug}`);
}

// ---------- DEMO REVIEWS ----------
const demoReviews = [
  {
    slug: "aura-interior-studio",
    name: "Studio AURA",
    email: "studio@aura.example",
    rating: 5,
    title: "Layout luxury đúng gu nội thất",
    comment:
      "Bố cục luxury, tone cream + champagne rất hợp ngành nội thất cao cấp. Admin CRUD dự án trực quan, thêm ảnh + meta SEO trong 1 màn. Demo Vercel mượt, Lighthouse 95+.",
  },
  {
    slug: "aura-interior-studio",
    name: "Lê Hồng Anh",
    email: "leanh@example.com",
    rating: 5,
    title: "Đáng tiền, deploy nhanh",
    comment:
      "Push GitHub → Vercel → online sau 2 phút. Seed sẵn 23 dự án phong phú để học cấu trúc DB. JSON-LD InteriorDesignBusiness chuẩn — Google index nhanh.",
  },
  {
    slug: "pure-jewelry-shop",
    name: "Nguyễn Tuấn",
    email: "tuannguyen@example.com",
    rating: 5,
    title: "Admin CRUD ngon, theme sang",
    comment:
      "Trang admin mượt, thêm sản phẩm trang sức nhanh (upload nhiều ảnh + tag đá quý). Theme emerald + champagne phù hợp shop đá quý cao cấp. Cron warm DB là điểm cộng.",
  },
  {
    slug: "mint-tote-bag-shop",
    name: "Đỗ Mai",
    email: "domai@example.com",
    rating: 5,
    title: "Theme tươi mát đúng gu eco",
    comment:
      "Mint + cream tươi mắt, hợp brand thân thiện môi trường. Admin upload ảnh tiện. Khách inbox Zalo nhiều hơn hẳn từ khi switch sang template này.",
  },
  {
    slug: "trishop-boilerplate",
    name: "Phạm Khoa",
    email: "khoa.dev@example.com",
    rating: 4,
    title: "Boilerplate dễ rebrand",
    comment:
      "Pattern api/ folder cổ điển hợp với team đã quen Express. Comment tiếng Việt rõ ràng, mất 1 buổi để rebrand sang shop của mình. Trừ 1 sao vì boilerplate hơi tối giản, cần tự thêm tính năng.",
  },
  {
    slug: "my-portfolio-vite-react",
    name: "Trần Vinh",
    email: "vinh.tran@example.com",
    rating: 5,
    title: "Vite siêu nhanh, dev sướng tay",
    comment:
      "HMR nhanh khủng khiếp, dev sướng tay. Tailwind setup sẵn, lên CV trực tuyến trong 1 buổi. Vercel deploy auto pre-render — load tức thì.",
  },
];

for (const r of demoReviews) {
  await sql`
    INSERT INTO reviews (product_id, customer_name, customer_email, rating, title, comment, is_approved)
    SELECT p.id, ${r.name}, ${r.email}, ${r.rating}, ${r.title}, ${r.comment}, TRUE
    FROM products p
    WHERE p.slug = ${r.slug}
      AND NOT EXISTS (
        SELECT 1 FROM reviews x
        WHERE x.product_id = p.id AND x.customer_name = ${r.name}
      )
  `;
}
console.log(`[reviews] seeded ${demoReviews.length} demo reviews`);

console.log("\n✓ Seed completed.");
console.log(
  `  → ${products.length} sản phẩm thật từ vippergod12 + ${categories.length} danh mục + ${demoReviews.length} reviews`
);
