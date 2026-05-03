export type Category = {
  id: number;
  slug: string;
  name: string;
  description: string | null;
  image_url: string | null;
  icon: string | null;
  sort_order: number;
  product_count?: number;
  created_at?: string;
  updated_at?: string;
};

export type Product = {
  id: number;
  category_id: number | null;
  category_slug?: string | null;
  category_name?: string | null;
  slug: string;
  name: string;
  short_description: string | null;
  long_description: string | null;
  price: number;
  sale_price: number | null;
  demo_url: string | null;
  repo_url: string | null;
  thumbnail: string | null;
  images: string[];
  tech_stack: string[];
  features: string[];
  tags: string[];
  is_featured: boolean;
  is_hero: boolean;
  is_published: boolean;
  sort_order: number;
  view_count: number;
  avg_rating?: number;
  review_count?: number;
  created_at?: string;
  updated_at?: string;
};

export type Review = {
  id: number;
  product_id: number;
  product_slug?: string;
  product_name?: string;
  customer_name: string;
  customer_email: string | null;
  rating: number;
  title: string | null;
  comment: string;
  is_approved: boolean;
  created_at: string;
};

export type AdminUser = {
  id: number;
  username: string;
};

export type ContactStatus = "new" | "contacted" | "done" | "spam";

export type Contact = {
  id: number;
  name: string;
  phone: string;
  email: string | null;
  project_type: string | null;
  message: string | null;
  status: ContactStatus;
  note: string | null;
  ip: string | null;
  user_agent: string | null;
  created_at: string;
  updated_at: string;
};

export type HomeBundle = {
  categories: Category[];
  hero: Product | null;
  featured: Product[];
  latest: Product[];
  topRated: Product[];
};
