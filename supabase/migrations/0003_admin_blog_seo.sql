-- Part 3 Migration: Admin CMS, Blog, Full SEO

-- 1. AUDIT LOG
CREATE TABLE IF NOT EXISTS audit_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  action text NOT NULL,
  entity_type text NOT NULL,
  entity_id text NOT NULL,
  details jsonb,
  created_at timestamptz DEFAULT now() NOT NULL
);

-- 2. BLOG AUTHORS
CREATE TABLE IF NOT EXISTS authors (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  bio text NOT NULL,
  avatar_url text,
  created_at timestamptz DEFAULT now() NOT NULL
);

-- 3. BLOG CATEGORIES
CREATE TABLE IF NOT EXISTS blog_categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text UNIQUE NOT NULL,
  name text NOT NULL,
  description text,
  created_at timestamptz DEFAULT now() NOT NULL
);

-- 4. BLOG TAGS
CREATE TABLE IF NOT EXISTS blog_tags (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text UNIQUE NOT NULL,
  name text NOT NULL,
  created_at timestamptz DEFAULT now() NOT NULL
);

-- 5. BLOG POSTS
CREATE TABLE IF NOT EXISTS blog_posts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text UNIQUE NOT NULL,
  title text NOT NULL,
  excerpt text NOT NULL,
  content text NOT NULL,
  cover_image_url text NOT NULL,
  cover_alt text NOT NULL,
  author_id uuid REFERENCES authors(id) ON DELETE SET NULL,
  category_id uuid REFERENCES blog_categories(id) ON DELETE SET NULL,
  status text NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'scheduled', 'published')),
  published_at timestamptz,
  reading_time int NOT NULL DEFAULT 1,
  is_featured boolean NOT NULL DEFAULT false,
  meta_title text,
  meta_description text,
  og_image_url text,
  canonical_url text,
  noindex boolean NOT NULL DEFAULT false,
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL
);

-- 6. POST TAGS JUNCTION
CREATE TABLE IF NOT EXISTS post_tags (
  post_id uuid REFERENCES blog_posts(id) ON DELETE CASCADE,
  tag_id uuid REFERENCES blog_tags(id) ON DELETE CASCADE,
  PRIMARY KEY (post_id, tag_id)
);

-- 7. REDIRECTS TABLE
CREATE TABLE IF NOT EXISTS redirects (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  from_path text UNIQUE NOT NULL,
  to_path text NOT NULL,
  status_code int NOT NULL DEFAULT 301 CHECK (status_code IN (301, 302)),
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz DEFAULT now() NOT NULL
);

-- INDEXES
CREATE INDEX IF NOT EXISTS idx_blog_posts_slug ON blog_posts(slug);
CREATE INDEX IF NOT EXISTS idx_blog_posts_status_published ON blog_posts(status, published_at);
CREATE INDEX IF NOT EXISTS idx_redirects_from_path ON redirects(from_path) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_audit_log_created_at ON audit_log(created_at DESC);

-- ENABLE ROW LEVEL SECURITY
ALTER TABLE audit_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE authors ENABLE ROW LEVEL SECURITY;
ALTER TABLE blog_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE blog_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE blog_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE post_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE redirects ENABLE ROW LEVEL SECURITY;

-- PUBLIC READ POLICIES
CREATE POLICY "Public can view authors" ON authors FOR SELECT USING (true);
CREATE POLICY "Public can view blog_categories" ON blog_categories FOR SELECT USING (true);
CREATE POLICY "Public can view blog_tags" ON blog_tags FOR SELECT USING (true);
CREATE POLICY "Public can view published blog_posts" ON blog_posts FOR SELECT 
  USING (status = 'published' AND published_at <= now());
CREATE POLICY "Public can view post_tags" ON post_tags FOR SELECT USING (true);
CREATE POLICY "Public can view active redirects" ON redirects FOR SELECT USING (is_active = true);

-- ADMIN & EDITOR POLICIES (Using current_user_role() function defined in 0002_commerce.sql)
CREATE POLICY "Admin can view audit_log" ON audit_log FOR SELECT
  USING (current_user_role() = 'admin');

CREATE POLICY "Admin and Editor manage authors" ON authors FOR ALL
  USING (current_user_role() IN ('admin', 'editor'));

CREATE POLICY "Admin and Editor manage blog_categories" ON blog_categories FOR ALL
  USING (current_user_role() IN ('admin', 'editor'));

CREATE POLICY "Admin and Editor manage blog_tags" ON blog_tags FOR ALL
  USING (current_user_role() IN ('admin', 'editor'));

CREATE POLICY "Admin and Editor manage blog_posts" ON blog_posts FOR ALL
  USING (current_user_role() IN ('admin', 'editor'));

CREATE POLICY "Admin and Editor manage post_tags" ON post_tags FOR ALL
  USING (current_user_role() IN ('admin', 'editor'));

CREATE POLICY "Admin and Editor manage pages" ON pages FOR ALL
  USING (current_user_role() IN ('admin', 'editor'));

CREATE POLICY "Admin manages redirects" ON redirects FOR ALL
  USING (current_user_role() = 'admin');

-- ADMIN MANAGEMENT FOR COMMERCE TABLES
CREATE POLICY "Admin manages products" ON products FOR ALL
  USING (current_user_role() = 'admin');

CREATE POLICY "Admin manages collections" ON collections FOR ALL
  USING (current_user_role() = 'admin');

CREATE POLICY "Admin manages hero_slides" ON hero_slides FOR ALL
  USING (current_user_role() IN ('admin', 'editor'));

CREATE POLICY "Admin manages testimonials" ON testimonials FOR ALL
  USING (current_user_role() IN ('admin', 'editor'));

CREATE POLICY "Admin manages navigation_items" ON navigation_items FOR ALL
  USING (current_user_role() = 'admin');

CREATE POLICY "Admin manages site_settings" ON site_settings FOR ALL
  USING (current_user_role() = 'admin');

CREATE POLICY "Admin views all orders" ON orders FOR SELECT
  USING (current_user_role() = 'admin');

CREATE POLICY "Admin updates orders" ON orders FOR UPDATE
  USING (current_user_role() = 'admin');

CREATE POLICY "Admin views all order_items" ON order_items FOR SELECT
  USING (current_user_role() = 'admin');

CREATE POLICY "Admin views all order_events" ON order_events FOR SELECT
  USING (current_user_role() = 'admin');

CREATE POLICY "Admin manages contact_messages" ON contact_messages FOR ALL
  USING (current_user_role() IN ('admin', 'editor'));

CREATE POLICY "Admin manages subscribers" ON subscribers FOR ALL
  USING (current_user_role() IN ('admin', 'editor'));

CREATE POLICY "Admin views all profiles" ON profiles FOR SELECT
  USING (current_user_role() = 'admin');
