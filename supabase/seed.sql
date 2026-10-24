-- Seed Data for Part 1

-- 1. Collections
insert into public.collections (id, slug, name, description, image_url, sort_order)
values
  ('11111111-1111-1111-1111-111111111111', 'bridal', 'Bridal Couture', 'Heirloom bridal ensembles meticulously hand-embellished with zardozi, dabka, and micro-pearls.', '/images/collections/bridal.jpg', 1),
  ('22222222-2222-2222-2222-222222222222', 'formals', 'Luxury Formals', 'Opulent evening wear crafted from gossamer organzas, tissue, and pure raw silks with intricate threadwork.', '/images/collections/formals.jpg', 2),
  ('33333333-3333-3333-3333-333333333333', 'pret', 'Festive Pret', 'Contemporary luxury silhouettes cut from airy chiffons and hand-loomed brocades for intimate celebrations.', '/images/collections/pret.jpg', 3)
on conflict (id) do update set
  slug = excluded.slug,
  name = excluded.name,
  description = excluded.description,
  image_url = excluded.image_url,
  sort_order = excluded.sort_order;

-- 2. Products (12 items)
insert into public.products (
  id, slug, name, collection_id, price_pkr, compare_at_price_pkr,
  description, details, sizes, images, is_active, is_featured, in_stock
) values
  (
    'a0000001-0000-0000-0000-000000000001',
    'zoya-embroidered-chiffon',
    'Zoya Embroidered Chiffon Peshwas',
    '11111111-1111-1111-1111-111111111111',
    185000,
    null,
    'A regal floor-length ivory peshwas rendered on pure banarsi chiffon. Adorned with heritage marori, resham threadwork, and shimmering sequin embellishments along the flared panels.',
    '{"fabric": "Pure Banarsi Chiffon & Silk Tissue", "trouser": "Raw Silk Choori Pajama", "dupatta": "Heavily Embroidered Organza Dupatta"}'::jsonb,
    array['XXS', 'XS', 'S', 'M', 'ML', 'L', 'XL', 'XXL'],
    array['/images/products/zoya-1.jpg', '/images/products/zoya-2.jpg', '/images/products/zoya-3.jpg'],
    true, true, true
  ),
  (
    'a0000002-0000-0000-0000-000000000002',
    'meera-velvet-anarkali',
    'Meera Deep Burgundy Velvet Anarkali',
    '11111111-1111-1111-1111-111111111111',
    245000,
    275000,
    'Micro-velvet kalidaar anarkali in rich imperial burgundy. Sculpted with antique gold zardozi neckline, kora work, and geometric borders inspired by Mughal frescoes.',
    '{"fabric": "Imperial Micro Velvet", "trouser": "Brocade Straight Trousers", "dupatta": "Zardozi Bordered Silk Net Dupatta"}'::jsonb,
    array['XS', 'S', 'M', 'ML', 'L', 'XL'],
    array['/images/products/meera-1.jpg', '/images/products/meera-2.jpg', '/images/products/meera-3.jpg'],
    true, true, true
  ),
  (
    'a0000003-0000-0000-0000-000000000003',
    'nilofer-hand-worked-peshwas',
    'Nilofer Sage Zari Tissue Peshwas',
    '11111111-1111-1111-1111-111111111111',
    310000,
    null,
    'Ethereal sage green tissue bridal ensemble layered with resham tilla, cut-dana, and hand-strung seed pearls. The flared skirt cascades into a dramatic border.',
    '{"fabric": "Pure Zari Metallic Tissue", "trouser": "Silk Tissue Lehenga Inner", "dupatta": "Hand-worked Chiffon Dupatta with Kiran"}'::jsonb,
    array['XXS', 'XS', 'S', 'M', 'L', 'XL'],
    array['/images/products/nilofer-1.jpg', '/images/products/nilofer-2.jpg', '/images/products/nilofer-3.jpg'],
    true, true, true
  ),
  (
    'a0000004-0000-0000-0000-000000000004',
    'shehnai-crimson-bridal-lehenga',
    'Shehnai Traditional Crimson Bridal Lehenga',
    '11111111-1111-1111-1111-111111111111',
    420000,
    null,
    'Timeless bridal red lehenga choli embellished with classic nakshi, dabka, and glistening Swarovski accents. Designed as a treasured family heirloom for generations.',
    '{"fabric": "Pure Rangkat Raw Silk & Velvet", "trouser": "Multi-paneled Hand-worked Lehenga", "dupatta": "Dual Dupatta: Velvet Shawl & Organza Veil"}'::jsonb,
    array['XS', 'S', 'M', 'ML', 'L'],
    array['/images/products/shehnai-1.jpg', '/images/products/shehnai-2.jpg', '/images/products/shehnai-3.jpg'],
    true, false, false
  ),
  (
    'b0000001-0000-0000-0000-000000000001',
    'ayla-silk-gharara',
    'Ayla Antique Gold Silk Gharara Set',
    '22222222-2222-2222-2222-222222222222',
    135000,
    155000,
    'Short kurti in dull gold raw silk accented with French knots and gota patti, paired with a ruched banarsi gharara trimmed with delicate scaloped lace.',
    '{"fabric": "Raw Silk & Banarsi Weave", "trouser": "Two-tier Flared Gharara", "dupatta": "Crinkle Chiffon with Gota Work"}'::jsonb,
    array['XXS', 'XS', 'S', 'M', 'ML', 'L', 'XL'],
    array['/images/products/ayla-1.jpg', '/images/products/ayla-2.jpg'],
    true, true, true
  ),
  (
    'b0000002-0000-0000-0000-000000000002',
    'roshni-crystal-embroidered-kaftan',
    'Roshni Champagne Crystal Kaftan',
    '22222222-2222-2222-2222-222222222222',
    98000,
    null,
    'Fluid modern kaftan silhouette in champagne georgette adorned with light-catching crystal florets, sequin linear work, and pearl tassels at the side seams.',
    '{"fabric": "Crêpe Georgette", "trouser": "Matching Cigarette Pants", "dupatta": "Built-in Drape"}'::jsonb,
    array['XS', 'S', 'M', 'L', 'XL', 'XXL'],
    array['/images/products/roshni-1.jpg', '/images/products/roshni-2.jpg'],
    true, true, true
  ),
  (
    'b0000003-0000-0000-0000-000000000003',
    'suraiya-tilla-organza-angrakha',
    'Suraiya Rust Organza Angrakha',
    '22222222-2222-2222-2222-222222222222',
    115000,
    null,
    'Overlapping angrakha silhouette in burnt rust organza with hand-finished tilla cords, floral medallions, and jewel-toned potli button accents.',
    '{"fabric": "Pure Organza & Silk Lining", "trouser": "Embroidered Culottes", "dupatta": "Monochrome Shaded Organza Dupatta"}'::jsonb,
    array['XXS', 'XS', 'S', 'M', 'ML', 'L', 'XL'],
    array['/images/products/suraiya-1.jpg', '/images/products/suraiya-2.jpg'],
    true, false, true
  ),
  (
    'b0000004-0000-0000-0000-000000000004',
    'nazia-emerald-jacket-set',
    'Nazia Emerald Embroidered Jacket Ensemble',
    '22222222-2222-2222-2222-222222222222',
    145000,
    168000,
    'A tailored front-open jacket in deep emerald raw silk layered with intricate Kashmiri thread motifs, worn over an understated inner slip and wide-leg palazzo.',
    '{"fabric": "Pure Raw Silk 80g", "trouser": "Palazzo with Thread Work Cuff", "dupatta": "Tissue Silk Wrap"}'::jsonb,
    array['S', 'M', 'L', 'XL'],
    array['/images/products/nazia-1.jpg', '/images/products/nazia-2.jpg'],
    true, false, true
  ),
  (
    'c0000001-0000-0000-0000-000000000001',
    'noor-tissue-pishwas',
    'Noor Powder Blush Cotton-Silk Kurta',
    '33333333-3333-3333-3333-333333333333',
    68000,
    78000,
    'Airy straight-cut kurta in soft blush pink cotton-silk, featuring subtle resham aari embroidery on sleeves and daman with mother-of-pearl buttons.',
    '{"fabric": "Cotton-Silk Blend", "trouser": "Straight Trousers with Lace Inserts", "dupatta": "Printed Silk Dupatta"}'::jsonb,
    array['XXS', 'XS', 'S', 'M', 'ML', 'L', 'XL', 'XXL'],
    array['/images/products/noor-1.jpg', '/images/products/noor-2.jpg'],
    true, true, true
  ),
  (
    'c0000002-0000-0000-0000-000000000002',
    'yasmin-chikankari-straight-set',
    'Yasmin Ivory Chikankari Three-Piece',
    '33333333-3333-3333-3333-333333333333',
    74000,
    null,
    'Exquisite Lucknowi chikankari needlework on pristine ivory lawn, complemented by shadow work and crochet lace borders for timeless grace.',
    '{"fabric": "Hand-spun Lawn & Malmal", "trouser": "Chikankari Cuffed Pants", "dupatta": "Chiffon Dupatta with Mukesh Spray"}'::jsonb,
    array['XS', 'S', 'M', 'ML', 'L', 'XL'],
    array['/images/products/yasmin-1.jpg', '/images/products/yasmin-2.jpg'],
    true, true, true
  ),
  (
    'c0000003-0000-0000-0000-000000000003',
    'fiza-ochre-block-print-kurta',
    'Fiza Ochre Hand-Block Printed Tunic',
    '33333333-3333-3333-3333-333333333333',
    52000,
    null,
    'Warm ochre pure linen kurta created with artisanal wooden block prints, detailed with delicate mirror embellishments on the split neckline.',
    '{"fabric": "Pure Breathable Linen", "trouser": "Cropped Linen Pants", "dupatta": "Kota Doria Dupatta"}'::jsonb,
    array['XXS', 'XS', 'S', 'M', 'L', 'XL'],
    array['/images/products/fiza-1.jpg', '/images/products/fiza-2.jpg'],
    true, false, true
  ),
  (
    'c0000004-0000-0000-0000-000000000004',
    'hira-lilac-pleated-shirt',
    'Hira Lilac Pleated Chiffon Set',
    '33333333-3333-3333-3333-333333333333',
    62000,
    null,
    'Contemporary high-low shirt with micro-knife pleating across the yoke and soft floral thread embroidery on translucent chiffon cuffs.',
    '{"fabric": "Poly-Chiffon with Viscose Lining", "trouser": "Pleated Flared Trousers", "dupatta": "Lightweight Chiffon Wrap"}'::jsonb,
    array['XS', 'S', 'M', 'ML', 'L'],
    array['/images/products/hira-1.jpg', '/images/products/hira-2.jpg'],
    true, false, true
  )
on conflict (id) do update set
  slug = excluded.slug,
  name = excluded.name,
  collection_id = excluded.collection_id,
  price_pkr = excluded.price_pkr,
  compare_at_price_pkr = excluded.compare_at_price_pkr,
  description = excluded.description,
  details = excluded.details,
  sizes = excluded.sizes,
  images = excluded.images,
  is_active = excluded.is_active,
  is_featured = excluded.is_featured,
  in_stock = excluded.in_stock;

-- 3. Currency Rates (Base: PKR)
insert into public.currency_rates (code, rate_from_pkr, symbol, updated_at)
values
  ('PKR', 1.0, 'Rs.', now()),
  ('USD', 0.0036, '$', now()),
  ('GBP', 0.0028, '£', now()),
  ('EUR', 0.0033, '€', now()),
  ('AED', 0.0132, 'AED', now()),
  ('SAR', 0.0135, 'SAR', now()),
  ('CAD', 0.0049, 'CA$', now())
on conflict (code) do update set
  rate_from_pkr = excluded.rate_from_pkr,
  symbol = excluded.symbol,
  updated_at = excluded.updated_at;

-- 4. Testimonials (4 items)
insert into public.testimonials (id, name, text, rating, is_active)
values
  (
    'd0000001-0000-0000-0000-000000000001',
    'Fatima Al-Rashid',
    'The craftsmanship of the Zoya peshwas surpassed all expectations. The zardozi details are sublime, and having it delivered in Dubai within 10 days was immaculate service.',
    5,
    true
  ),
  (
    'd0000002-0000-0000-0000-000000000002',
    'Mahnoor Tariq',
    'Ordered the Meera Velvet anarkali for my brother’s reception. The velvet weight, rich burgundy hue, and custom sizing fit like second skin. Truly regal couture.',
    5,
    true
  ),
  (
    'd0000003-0000-0000-0000-000000000003',
    'Ayesha Siddiqui',
    'Ali Ahmed Ansari brings old-world Lahore grandeur with modern finesse. The fabric quality is exceptional — pure silk and delicate marori work that pictures don’t do justice.',
    5,
    true
  ),
  (
    'd0000004-0000-0000-0000-000000000004',
    'Dr. Shireen Khan',
    'I purchased the Ayla Gharara from London. The packaging was bridal-grade, delivery seamless, and the embroidery was genuine hand-done artisan work. Outstanding!',
    5,
    true
  )
on conflict (id) do update set
  name = excluded.name,
  text = excluded.text,
  rating = excluded.rating,
  is_active = excluded.is_active;

-- 5. Site Settings
insert into public.site_settings (key, value, updated_at)
values
  ('brand_name', 'Ali Ahmed Ansari', now()),
  ('tagline', 'Embroidered Formal Wear', now()),
  ('announcement_text', 'Complimentary delivery on orders above PKR 15,000 within Pakistan', now()),
  ('whatsapp_number', '+923001234567', now()),
  ('contact_email', 'hello@ahmedaliansari.com', now()),
  ('contact_phone', '+92 300 123 4567', now()),
  ('contact_address', '26-B, Gulberg III, Lahore, Punjab, Pakistan', now()),
  ('instagram_url', 'https://instagram.com/aliahmedansari', now()),
  ('facebook_url', 'https://facebook.com/aliahmedansari', now())
on conflict (key) do update set
  value = excluded.value,
  updated_at = excluded.updated_at;

-- 6. Hero Slides (3 items)
insert into public.hero_slides (
  id, desktop_image_url, mobile_image_url, heading, subheading, cta_text, cta_link, sort_order, is_active
) values
  (
    'e0000001-0000-0000-0000-000000000001',
    '/images/hero/hero-1.jpg',
    '/images/hero/hero-1-mobile.jpg',
    'Heirloom Bridal Ensembles',
    'Handcrafted by generations of master karigars in the heart of Lahore',
    'Explore Bridal',
    '/shop?collection=bridal',
    1,
    true
  ),
  (
    'e0000002-0000-0000-0000-000000000002',
    '/images/hero/hero-2.jpg',
    '/images/hero/hero-2-mobile.jpg',
    'Imperial Velvet & Silks',
    'Sumptuous textures embellished with antique gold tilla and zardozi needlework',
    'Discover Formals',
    '/shop?collection=formals',
    2,
    true
  ),
  (
    'e0000003-0000-0000-0000-000000000003',
    '/images/hero/hero-3.jpg',
    '/images/hero/hero-3-mobile.jpg',
    'Festive Pret & Chiffons',
    'Effortless poise for intimate soirees and festive celebrations',
    'Shop Festive Pret',
    '/shop?collection=pret',
    3,
    true
  )
on conflict (id) do update set
  desktop_image_url = excluded.desktop_image_url,
  mobile_image_url = excluded.mobile_image_url,
  heading = excluded.heading,
  subheading = excluded.subheading,
  cta_text = excluded.cta_text,
  cta_link = excluded.cta_link,
  sort_order = excluded.sort_order,
  is_active = excluded.is_active;

-- 7. Navigation Items
insert into public.navigation_items (id, location, label, href, sort_order, is_active)
values
  ('f0000001-0000-0000-0000-000000000001', 'header', 'Home', '/', 1, true),
  ('f0000002-0000-0000-0000-000000000002', 'header', 'Shop', '/shop', 2, true),
  ('f0000003-0000-0000-0000-000000000003', 'header', 'About', '/about', 3, true),
  ('f0000004-0000-0000-0000-000000000004', 'header', 'Contact', '/contact', 4, true),
  ('f0000005-0000-0000-0000-000000000005', 'footer', 'Privacy Policy', '/privacy', 1, true),
  ('f0000006-0000-0000-0000-000000000006', 'footer', 'Refund Policy', '/refund', 2, true),
  ('f0000007-0000-0000-0000-000000000007', 'footer', 'Terms of Service', '/terms', 3, true),
  ('f0000008-0000-0000-0000-000000000008', 'footer', 'Shipping Policy', '/shipping', 4, true)
on conflict (id) do update set
  location = excluded.location,
  label = excluded.label,
  href = excluded.href,
  sort_order = excluded.sort_order,
  is_active = excluded.is_active;

-- 8. Pages (Part 1 seed)
insert into public.pages (id, key, title, content, meta_title, meta_description, updated_at)
values
  (
    'fa000001-0000-0000-0000-000000000001',
    'about',
    'Our Heritage & Craftsmanship',
    '<h2>The House of Ali Ahmed Ansari</h2><p>Born in the storied atelier alleys of Lahore, Ali Ahmed Ansari stands as a testament to the preservation and celebration of South Asian haute couture. Each stitch honours the time-honoured techniques passed down through lineages of master artisans.</p>',
    'About Ali Ahmed Ansari | Heritage Eastern Couture',
    'Discover the legacy of master craftsmanship and artisanal embroideries behind Ali Ahmed Ansari.',
    now()
  ),
  (
    'fa000002-0000-0000-0000-000000000002',
    'privacy',
    'Privacy Policy',
    '<h2>Privacy & Data Protection</h2><p>Your privacy is of supreme importance to us. Ali Ahmed Ansari collects and processes personal information solely to fulfill orders, provide concierge customer care, and communicate exclusive previews.</p>',
    'Privacy Policy | Ali Ahmed Ansari',
    'Learn how Ali Ahmed Ansari safeguards your personal data and privacy.',
    now()
  ),
  (
    'fa000003-0000-0000-0000-000000000003',
    'refund',
    'Refund & Exchange Policy',
    '<h2>Bespoke Orders & Exchanges</h2><p>Due to the customized nature and artisanal hand-work of each ensemble, all bridal and made-to-order couture items are final sale. We offer complimentary fitting alterations on all bridal wear.</p>',
    'Refund Policy | Ali Ahmed Ansari',
    'Our policy regarding bespoke couture, exchanges, and tailoring alterations.',
    now()
  ),
  (
    'fa000004-0000-0000-0000-000000000004',
    'terms',
    'Terms of Service',
    '<h2>Terms & Conditions</h2><p>By engaging with Ali Ahmed Ansari online or at our Lahore atelier, you agree to these terms governing custom orders, delivery schedules, and intellectual property.</p>',
    'Terms of Service | Ali Ahmed Ansari',
    'Terms and conditions of ordering and using the Ali Ahmed Ansari boutique.',
    now()
  ),
  (
    'fa000005-0000-0000-0000-000000000005',
    'shipping',
    'Shipping & Delivery',
    '<h2>Worldwide White-Glove Delivery</h2><p>We deliver globally with tracked express courier partners. Domestic orders in Pakistan arrive within 3-5 business days of completion. International orders arrive within 7-10 business days.</p>',
    'Shipping & Delivery | Ali Ahmed Ansari',
    'Global shipping timelines, white-glove packaging, and delivery policies.',
    now()
  )
on conflict (id) do update set
  key = excluded.key,
  title = excluded.title,
  content = excluded.content,
  meta_title = excluded.meta_title,
  meta_description = excluded.meta_description,
  updated_at = excluded.updated_at;
