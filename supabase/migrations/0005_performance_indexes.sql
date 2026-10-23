-- =========================================================================
-- 0005_performance_indexes.sql
-- Resilient & Safe Performance Optimization Migration
-- Checks for table existence before creating indexes, preventing 42P01 errors.
-- Creates product_stock table if it hasn't been created yet.
-- =========================================================================

DO $$
BEGIN
  -- 1. Product Queries & Catalog Filtering
  IF to_regclass('public.products') IS NOT NULL THEN
    CREATE INDEX IF NOT EXISTS idx_products_active_featured
      ON public.products (is_active, is_featured)
      WHERE is_active = true;

    CREATE INDEX IF NOT EXISTS idx_products_collection_active
      ON public.products (collection_id, is_active);

    CREATE INDEX IF NOT EXISTS idx_products_active_created
      ON public.products (is_active, created_at DESC);

    CREATE INDEX IF NOT EXISTS idx_products_active_price
      ON public.products (is_active, price_pkr);
  END IF;

  -- 2. Product Stock: Ensure Table Exists + Create Index
  IF to_regclass('public.products') IS NOT NULL THEN
    CREATE TABLE IF NOT EXISTS public.product_stock (
      product_id uuid NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
      size       text NOT NULL,
      quantity   int NOT NULL DEFAULT 0 CHECK (quantity >= 0),
      PRIMARY KEY (product_id, size)
    );

    ALTER TABLE public.product_stock ENABLE ROW LEVEL SECURITY;

    IF NOT EXISTS (
      SELECT 1 FROM pg_policies
      WHERE schemaname = 'public'
        AND tablename = 'product_stock'
        AND policyname = 'product_stock_public_select'
    ) THEN
      CREATE POLICY "product_stock_public_select"
        ON public.product_stock FOR SELECT USING (true);
    END IF;
  END IF;

  IF to_regclass('public.product_stock') IS NOT NULL THEN
    CREATE INDEX IF NOT EXISTS idx_product_stock_product_id
      ON public.product_stock (product_id);
  END IF;

  -- 3. Orders & Checkout Lookups
  IF to_regclass('public.orders') IS NOT NULL THEN
    CREATE INDEX IF NOT EXISTS idx_orders_user_id
      ON public.orders (user_id);

    CREATE INDEX IF NOT EXISTS idx_orders_order_number
      ON public.orders (order_number);

    CREATE INDEX IF NOT EXISTS idx_orders_access_token
      ON public.orders (access_token);

    CREATE INDEX IF NOT EXISTS idx_orders_created_at_desc
      ON public.orders (created_at DESC);

    CREATE INDEX IF NOT EXISTS idx_orders_status
      ON public.orders (status);

    CREATE INDEX IF NOT EXISTS idx_orders_payment_status
      ON public.orders (payment_status);
  END IF;

  -- 4. Order Items (Parent-Child joins & RLS subqueries)
  IF to_regclass('public.order_items') IS NOT NULL THEN
    CREATE INDEX IF NOT EXISTS idx_order_items_order_id
      ON public.order_items (order_id);

    CREATE INDEX IF NOT EXISTS idx_order_items_product_id
      ON public.order_items (product_id);
  END IF;

  -- 5. Order Events & Payment Proofs
  IF to_regclass('public.order_events') IS NOT NULL THEN
    CREATE INDEX IF NOT EXISTS idx_order_events_order_id_created
      ON public.order_events (order_id, created_at ASC);
  END IF;

  IF to_regclass('public.payment_proofs') IS NOT NULL THEN
    CREATE INDEX IF NOT EXISTS idx_payment_proofs_order_id
      ON public.payment_proofs (order_id);
  END IF;

  -- 6. Navigation Items & Hero Slides (Storefront Above-the-fold)
  IF to_regclass('public.navigation_items') IS NOT NULL THEN
    CREATE INDEX IF NOT EXISTS idx_navigation_items_location_active_sort
      ON public.navigation_items (location, is_active, sort_order);
  END IF;

  IF to_regclass('public.hero_slides') IS NOT NULL THEN
    CREATE INDEX IF NOT EXISTS idx_hero_slides_active_sort
      ON public.hero_slides (is_active, sort_order)
      WHERE is_active = true;
  END IF;
END $$;
