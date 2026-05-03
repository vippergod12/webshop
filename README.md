# WEBVAULT — Marketplace bán website Next.js

Website marketplace để bạn **đăng bán các template/website của mình**, có **module review của khách hàng**, và **admin panel** quản lý đầy đủ thông tin (link Vercel, repo GitHub, tech stack, ảnh, tính năng, giá sale, featured/hero, ...).

- **Frontend**: Next.js 14 (App Router) + TypeScript + ISR 60s
- **Backend**: Next.js Route Handlers `/api/*` (auth + categories + products + reviews)
- **Database**: Neon (Postgres serverless) qua `@neondatabase/serverless`
- **SEO**: SSR/ISR mọi trang public, Metadata API per-page, JSON-LD `Product` + `BreadcrumbList`, sitemap động, robots.txt
- **Theme**: Dark mode + cyan/violet glow, Lighthouse 95+, mobile-first
- **Deploy**: 1-click Vercel
- Không có giỏ hàng / thanh toán. Khách liên hệ qua **Zalo**. Có **một tài khoản admin** để CRUD sản phẩm + duyệt review.

---

## Cấu trúc

```
shop_ban_web/
├── app/
│   ├── layout.tsx                 # Root layout (font, metadata, JSON-LD organization)
│   ├── globals.css                # Theme dark + cyan/violet
│   ├── (public)/
│   │   ├── layout.tsx             # Navbar + Footer + FloatingActions
│   │   ├── page.tsx               # Trang chủ (Server Component, ISR 60s)
│   │   ├── san-pham/              # Tất cả sản phẩm + filter + search
│   │   │   └── [slug]/page.tsx    # Chi tiết sản phẩm + Reviews + Form review
│   │   ├── danh-muc/[slug]/       # Trang danh mục
│   │   ├── ve-chung-toi/          # About
│   │   └── lien-he/               # Form gửi qua Zalo
│   ├── admin/
│   │   ├── layout.tsx             # Sidebar + auth guard (JWT localStorage)
│   │   ├── login/page.tsx
│   │   ├── page.tsx               # Dashboard + KPI + review chờ duyệt
│   │   ├── products/page.tsx      # CRUD sản phẩm (modal form đầy đủ)
│   │   ├── categories/page.tsx    # CRUD danh mục
│   │   └── reviews/page.tsx       # Duyệt / ẩn / xóa review
│   ├── api/
│   │   ├── auth/{login,me}/route.ts
│   │   ├── categories/{,[id]}/route.ts
│   │   ├── products/{,[id],featured,hero}/route.ts
│   │   ├── reviews/{,[id]}/route.ts
│   │   ├── home/route.ts          # Bundle data trang chủ
│   │   └── _warm/route.ts         # Cron giữ Neon warm (10 phút)
│   ├── sitemap.ts
│   └── robots.ts
├── components/
│   ├── Navbar.tsx, Footer.tsx, FloatingActions.tsx
│   ├── ProductCard.tsx, StarRating.tsx
│   ├── ReviewList.tsx, ReviewForm.tsx
│   ├── Modal.tsx, ImagePicker.tsx
│   └── home/                      # Hero, Marquee, Stats, CategoriesBento, FeaturedGrid, Process, Testimonials, BigCTA
├── lib/
│   ├── data.ts                    # Server-side fetcher (đọc thẳng DB, ISR-aware)
│   ├── api-client.ts              # Client-side wrapper (admin)
│   ├── types.ts
│   ├── seo/{siteConfig,jsonld}.ts
│   ├── server/{db,auth,http}.ts   # Neon, JWT, response helpers
│   └── utils/{format,zalo,slug,image}.ts
├── db/schema.sql                  # admins, categories, products, reviews
├── scripts/
│   ├── init-db.mjs
│   └── seed.mjs                   # admin + 8 danh mục + 5 sản phẩm thật + 6 review demo
├── public/favicon.svg
├── next.config.mjs
├── vercel.json                    # cron + sin1 region
└── package.json
```

---

## Yêu cầu

- Node.js >= 18.18
- Tài khoản Neon: <https://console.neon.tech> (miễn phí)

## Cài đặt

```bash
npm install
copy .env.example .env       # Windows
# hoặc: cp .env.example .env  # macOS / Linux
```

Mở `.env` và điền:

| Biến                              | Ý nghĩa                                                                  |
| --------------------------------- | ------------------------------------------------------------------------ |
| `DATABASE_URL`                    | Connection string Neon (chọn _Pooled connection_, có `?sslmode=require`) |
| `JWT_SECRET`                      | Chuỗi ngẫu nhiên >= 32 ký tự để ký token admin                           |
| `ADMIN_USERNAME` / `ADMIN_PASSWORD` | Tài khoản admin sẽ được seed vào DB                                    |
| `NEXT_PUBLIC_SITE_URL`            | Domain production (vd `https://webvault.vn`). Quan trọng cho SEO/sitemap |
| `NEXT_PUBLIC_SITE_NAME`           | Tên brand (mặc định `WEBVAULT`)                                          |
| `NEXT_PUBLIC_ZALO_PHONE`          | SĐT Zalo của shop (vd `0987654321`)                                      |
| `NEXT_PUBLIC_ZALO_URL`            | (Tuỳ chọn) Link Zalo OA đầy đủ                                           |
| `NEXT_PUBLIC_HOTLINE`             | (Tuỳ chọn) Hotline. Mặc định = ZALO_PHONE                                |
| `NEXT_PUBLIC_EMAIL`               | (Tuỳ chọn) Email liên hệ                                                 |
| `NEXT_PUBLIC_ADDRESS`             | (Tuỳ chọn) Địa chỉ văn phòng hiển thị footer                             |
| `WARM_SECRET`                     | (Tuỳ chọn) Secret bảo vệ endpoint `/api/_warm` cho cron                  |

## Khởi tạo database

```bash
npm run db:init     # tạo bảng (admins, categories, products, reviews)
npm run db:seed     # seed admin + 8 danh mục + 5 sản phẩm thật + 6 review demo
```

> `db:init` chạy lại bao nhiêu lần cũng được (dùng `IF NOT EXISTS`).
> `db:seed` sẽ **xoá toàn bộ `reviews` + `products` cũ** rồi seed lại 5 sản phẩm mới (admin + categories được giữ qua `ON CONFLICT DO UPDATE`). An toàn để chạy lại bất kỳ lúc nào.

## Chạy local

```bash
npm run dev
```

- Frontend + API: <http://localhost:3000>
- Admin: <http://localhost:3000/admin/login> — đăng nhập bằng `ADMIN_USERNAME` / `ADMIN_PASSWORD` trong `.env`

---

## Deploy lên Vercel

1. Đẩy code lên GitHub.
2. Vào <https://vercel.com> → **Add New Project** → import repo.
3. Vercel tự nhận diện Next.js (Build Command: `next build`).
4. **Settings → Environment Variables** thêm:
   - `DATABASE_URL`
   - `JWT_SECRET`
   - `NEXT_PUBLIC_SITE_URL` (vd `https://webvault.vn`)
   - `NEXT_PUBLIC_ZALO_PHONE` (hoặc `NEXT_PUBLIC_ZALO_URL`)
   - `ADMIN_USERNAME`, `ADMIN_PASSWORD`
5. Bấm **Deploy**.

Sau khi deploy lần đầu, từ máy local chạy `npm run db:init && npm run db:seed` để khởi tạo dữ liệu lên Neon production.

---

## Sản phẩm thật trong seed (5 repo của [@vippergod12](https://github.com/vippergod12))

Marketplace seed sẵn 8 danh mục + **5 sản phẩm là 5 repo thật** đã deploy trên Vercel:

| # | Sản phẩm                               | Danh mục         | Repo                                                 | Demo                                              |
| - | -------------------------------------- | ---------------- | ---------------------------------------------------- | ------------------------------------------------- |
| 1 | **AURA — Studio thiết kế nội thất** ★  | Doanh nghiệp     | [vippergod12/aura](https://github.com/vippergod12/aura) | <https://aura-pearl-ten.vercel.app>            |
| 2 | **PURE — Shop trang sức đá quý**       | E-commerce       | [vippergod12/pure](https://github.com/vippergod12/pure) | <https://pure-snowy.vercel.app>                |
| 3 | **MINT — Shop túi vải không dệt**      | E-commerce       | [vippergod12/MINT](https://github.com/vippergod12/MINT) | <https://mint-one-pi.vercel.app>               |
| 4 | **TriShop — Boilerplate shop CRUD**    | E-commerce       | [vippergod12/trishop](https://github.com/vippergod12/trishop) | <https://trishop-sooty.vercel.app>       |
| 5 | **My Portfolio — React + Vite + TW**   | Portfolio cá nhân| [vippergod12/my-portfolio](https://github.com/vippergod12/my-portfolio) | <https://my-portfolio-blond-chi-74.vercel.app> |

★ = sản phẩm hero (xuất hiện ở banner trang chủ).

3 danh mục còn lại (Landing Page, SaaS / Dashboard, Blog / Magazine, Nhà hàng / Café, Bất động sản) hiện chưa có sản phẩm — bạn thêm dần qua admin panel khi có template mới.

> Muốn đổi giá / mô tả / ảnh / hero / featured: sửa thẳng `scripts/seed.mjs` rồi chạy lại `npm run db:seed`. Hoặc chỉnh online qua `/admin`.

---

## API Endpoints

| Method | Path                                  | Auth  | Mô tả                                                        |
| ------ | ------------------------------------- | ----- | ------------------------------------------------------------ |
| POST   | `/api/auth/login`                     | —     | Đăng nhập admin, trả về JWT                                  |
| GET    | `/api/auth/me`                        | Admin | Trả về thông tin admin từ token                              |
| GET    | `/api/categories`                     | —     | Danh sách danh mục (kèm `product_count`)                     |
| POST   | `/api/categories`                     | Admin | Tạo danh mục                                                 |
| GET    | `/api/categories/:id`                 | —     | Lấy 1 danh mục (id hoặc slug)                                |
| PUT    | `/api/categories/:id`                 | Admin | Cập nhật danh mục                                            |
| DELETE | `/api/categories/:id`                 | Admin | Xoá danh mục                                                 |
| GET    | `/api/products?category=&q=&sort=`    | —     | Danh sách sản phẩm. `category` nhận id hoặc slug, `q` search |
| POST   | `/api/products`                       | Admin | Tạo sản phẩm                                                 |
| GET    | `/api/products/:id`                   | —     | Lấy 1 sản phẩm                                               |
| PUT    | `/api/products/:id`                   | Admin | Cập nhật sản phẩm                                            |
| DELETE | `/api/products/:id`                   | Admin | Xoá sản phẩm                                                 |
| GET    | `/api/products/featured`              | —     | Sản phẩm được admin gắn nổi bật                              |
| GET    | `/api/products/hero`                  | —     | Sản phẩm hero của trang chủ                                  |
| GET    | `/api/reviews?product_id=`            | —     | Reviews đã duyệt của 1 sản phẩm                              |
| GET    | `/api/reviews?all=1`                  | Admin | Tất cả reviews (kèm chờ duyệt)                               |
| POST   | `/api/reviews`                        | —     | Khách gửi review (mặc định `is_approved=false`)              |
| PUT    | `/api/reviews/:id`                    | Admin | Duyệt / ẩn / sửa review                                      |
| DELETE | `/api/reviews/:id`                    | Admin | Xoá review                                                   |
| GET    | `/api/home`                           | —     | Bundle dữ liệu trang chủ                                     |
| GET    | `/api/_warm`                          | —     | Cron warm Neon DB (Vercel cron 10 phút)                      |

Auth: gửi header `Authorization: Bearer <token>`. Frontend tự lưu token trong `localStorage`.

---

## Module Reviews — flow

1. Khách vào trang `/san-pham/[slug]` → cuộn xuống section **Đánh giá** → điền form (sao, tên, email, tiêu đề, nội dung).
2. Review gửi vào DB với `is_approved = FALSE` (chưa hiển thị công khai).
3. Admin vào `/admin/reviews` → tab **Chờ duyệt** → nhấn **✓ Duyệt** → review hiển thị trên trang sản phẩm + cập nhật `avg_rating` + `review_count`.
4. Top reviews mới nhất xuất hiện trong section **Khách hàng nói gì** ở trang chủ.

JSON-LD `Product` tự động bao gồm `aggregateRating` + 5 `review` mới nhất → giúp Google hiển thị **rich snippet sao** trong SERP.

---

## Tuỳ biến

- **Đổi tên thương hiệu**: chỉnh `lib/seo/siteConfig.ts` (`SITE_NAME`, `SITE_TAGLINE`, `SITE_DESCRIPTION`) hoặc đặt biến môi trường `NEXT_PUBLIC_SITE_NAME`. Logo trong `components/Navbar.tsx`, `components/Footer.tsx`.
- **Đổi màu chủ đạo**: chỉnh các CSS variables `--cyan`, `--violet`, `--grad` ở đầu `app/globals.css`.
- **Thêm trường vào sản phẩm**: chỉnh `db/schema.sql` (thêm cột) → cập nhật type ở `lib/types.ts` → form admin ở `app/admin/products/page.tsx` → API routes trong `app/api/products/**.ts`.
- **Đổi tần suất ISR**: đổi `export const revalidate = 60` ở mỗi `app/(public)/.../page.tsx`.
- **Thêm admin khác**: chạy SQL trên Neon `INSERT INTO admins (username, password_hash) VALUES ('alice', '<bcrypt hash>')`. Tạo hash bằng:

```bash
node -e "console.log(require('bcryptjs').hashSync(process.argv[1], 10))" 'mật_khẩu'
```

---

## Bản quyền

Dự án nội bộ. Tự do sử dụng & chỉnh sửa cho mục đích kinh doanh.
