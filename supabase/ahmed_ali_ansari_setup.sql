-- =========================================================================
-- AHMED ALI ANSARI — SUPABASE SETUP & SEED SCRIPT
-- =========================================================================

-- 1. Ensure Single Admin Constraint (Only 1 admin allowed across entire platform)
CREATE UNIQUE INDEX IF NOT EXISTS unique_single_admin ON profiles (role) WHERE role = 'admin';

-- 2. Upsert Brand Site Settings
INSERT INTO site_settings (key, value) VALUES
  ('brand_name', 'Ahmed Ali Ansari'),
  ('tagline', 'Premium embroidered fabrics crafted with elegance and delivered with trust.'),
  ('announcement_text', 'Complimentary delivery on orders above PKR 15,000 within Pakistan'),
  ('whatsapp_number', '+923092045906'),
  ('contact_phone', '+92 309 2045906'),
  ('contact_email', 'aahmedaliansariofficial@gmail.com'),
  ('contact_address', 'Lahore, Punjab, Pakistan'),
  ('instagram_url', 'https://instagram.com/ahmedaliansari.official'),
  ('facebook_url', 'https://www.facebook.com/share/1M1kjqDWHj/'),
  ('logo_url', '/images/logo.png')
ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, updated_at = now();

-- 3. Replace Hero Carousel Slides with 5 Premium Concepts
DELETE FROM hero_slides;

INSERT INTO hero_slides (id, desktop_image_url, mobile_image_url, heading, subheading, cta_text, cta_link, sort_order, is_active) VALUES
(
  'e0000001-0000-0000-0000-000000000001',
  '/images/hero/hero-1.jpg',
  '/images/hero/hero-1.jpg',
  'Timeless Elegance, Every Day',
  'Delicate tone-on-tone embroidery crafted on flowing luxury fabrics',
  'Shop Collection',
  '/shop',
  1,
  true
),
(
  'e0000002-0000-0000-0000-000000000002',
  '/images/hero/hero-2.jpg',
  '/images/hero/hero-2.jpg',
  'Crafted in Every Detail',
  'Deep emerald green with intricate thread embroidery and refined finishes',
  'Explore Emerald Luxe',
  '/shop',
  2,
  true
),
(
  'e0000003-0000-0000-0000-000000000003',
  '/images/hero/hero-3.jpg',
  '/images/hero/hero-3.jpg',
  'Your Everyday, Elevated',
  'Fresh dusty-rose and floral prints tailored for graceful contemporary living',
  'Discover Everyday Pret',
  '/shop',
  3,
  true
),
(
  'e0000004-0000-0000-0000-000000000004',
  '/images/hero/hero-4.jpg',
  '/images/hero/hero-4.jpg',
  'Elegance That Stands Apart',
  'Antique-silver embroidery on dramatic midnight black silhouettes',
  'Shop Signature Black',
  '/shop',
  4,
  true
),
(
  'e0000005-0000-0000-0000-000000000005',
  '/images/hero/hero-5.jpg',
  '/images/hero/hero-5.jpg',
  'Make Every Occasion Special',
  'Deep burgundy formal ensembles accented with antique-gold artistry',
  'View Festive Collection',
  '/shop',
  5,
  true
);

-- 4. To set your email as the single Admin, run this after registering:
-- UPDATE profiles
-- SET role = 'admin'
-- WHERE id = (SELECT id FROM auth.users WHERE email = 'aahmedaliansariofficial@gmail.com');
