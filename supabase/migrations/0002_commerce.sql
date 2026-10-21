-- ============================================================
-- Part 2: Commerce & Content
-- ============================================================

-- Enums
CREATE TYPE user_role AS ENUM ('customer', 'editor', 'admin');
CREATE TYPE order_status AS ENUM ('pending', 'confirmed', 'shipped', 'delivered', 'cancelled');
CREATE TYPE payment_status AS ENUM ('pending', 'proof_submitted', 'deposit_received', 'paid', 'refunded');
CREATE TYPE payment_option AS ENUM ('full', 'deposit');

-- Profiles
CREATE TABLE profiles (
  id          uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name   text NOT NULL DEFAULT '',
  phone       text,
  role        user_role NOT NULL DEFAULT 'customer',
  created_at  timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "profiles_owner_select" ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "profiles_owner_update" ON profiles FOR UPDATE USING (auth.uid() = id);

CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO profiles(id, full_name)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'full_name', ''));
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

CREATE OR REPLACE FUNCTION current_user_role()
RETURNS user_role LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT role FROM profiles WHERE id = auth.uid();
$$;

-- Addresses
CREATE TABLE addresses (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  label        text NOT NULL DEFAULT 'Home',
  full_name    text NOT NULL,
  phone        text NOT NULL,
  line1        text NOT NULL,
  line2        text,
  city         text NOT NULL,
  state        text NOT NULL,
  postal_code  text NOT NULL,
  country_code text NOT NULL DEFAULT 'PK',
  is_default   boolean NOT NULL DEFAULT false
);

ALTER TABLE addresses ENABLE ROW LEVEL SECURITY;
CREATE POLICY "addresses_owner_all" ON addresses USING (auth.uid() = user_id);

-- Wishlist Items
CREATE TABLE wishlist_items (
  user_id    uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  product_id uuid NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, product_id)
);

ALTER TABLE wishlist_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "wishlist_owner_all" ON wishlist_items USING (auth.uid() = user_id);

-- Product Stock
CREATE TABLE product_stock (
  product_id uuid NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  size       text NOT NULL,
  quantity   int NOT NULL DEFAULT 0 CHECK (quantity >= 0),
  PRIMARY KEY (product_id, size)
);

ALTER TABLE product_stock ENABLE ROW LEVEL SECURITY;
CREATE POLICY "product_stock_public_select" ON product_stock FOR SELECT USING (true);

CREATE OR REPLACE FUNCTION sync_product_in_stock()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  UPDATE products
  SET in_stock = (
    SELECT COALESCE(SUM(quantity), 0) > 0
    FROM product_stock
    WHERE product_id = COALESCE(NEW.product_id, OLD.product_id)
  )
  WHERE id = COALESCE(NEW.product_id, OLD.product_id);
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_sync_in_stock
  AFTER INSERT OR UPDATE OR DELETE ON product_stock
  FOR EACH ROW EXECUTE FUNCTION sync_product_in_stock();

INSERT INTO product_stock (product_id, size, quantity)
SELECT
  p.id,
  unnest(p.sizes) AS size,
  CASE WHEN p.in_stock THEN 10 ELSE 0 END
FROM products p
ON CONFLICT (product_id, size) DO NOTHING;

-- Shipping Rates
CREATE TABLE shipping_rates (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  zone_name     text NOT NULL,
  country_codes text[] NOT NULL DEFAULT '{}',
  price_pkr     numeric NOT NULL,
  free_over_pkr numeric,
  est_days_min  int NOT NULL,
  est_days_max  int NOT NULL,
  is_active     boolean NOT NULL DEFAULT true
);

ALTER TABLE shipping_rates ENABLE ROW LEVEL SECURITY;
CREATE POLICY "shipping_rates_public_select" ON shipping_rates FOR SELECT USING (is_active = true);

INSERT INTO shipping_rates (zone_name, country_codes, price_pkr, free_over_pkr, est_days_min, est_days_max) VALUES
  ('Pakistan', ARRAY['PK'], 250, 15000, 2, 5),
  ('International', ARRAY[]::text[], 4500, NULL, 10, 21);

-- Payment Methods
CREATE TABLE payment_methods (
  code                  text PRIMARY KEY,
  label                 text NOT NULL,
  instructions          text NOT NULL,
  details               jsonb NOT NULL DEFAULT '{}',
  allowed_country_codes text[],
  requires_proof        boolean NOT NULL DEFAULT false,
  is_active             boolean NOT NULL DEFAULT true,
  sort_order            int NOT NULL DEFAULT 0
);

ALTER TABLE payment_methods ENABLE ROW LEVEL SECURITY;
CREATE POLICY "payment_methods_public_select" ON payment_methods FOR SELECT USING (is_active = true);

INSERT INTO payment_methods (code, label, instructions, details, allowed_country_codes, requires_proof, sort_order) VALUES
  ('cod', 'Cash on Delivery', 'Pay in cash when your order is delivered.', '{}', ARRAY['PK'], false, 1),
  ('bank_transfer', 'Bank Transfer', 'Transfer the amount to the bank account below, then upload your payment proof.', '{"bank": "Meezan Bank", "account_title": "Zahra Luxe (Demo)", "account_number": "0000-0000000-000", "iban": "PK00MEZN0000000000000000"}', NULL, true, 2),
  ('easypaisa', 'Easypaisa', 'Send the amount to the Easypaisa account below, then upload your payment proof.', '{"account_title": "Zahra Luxe (Demo)", "mobile_number": "0300-0000000"}', NULL, true, 3),
  ('jazzcash', 'JazzCash', 'Send the amount to the JazzCash account below, then upload your payment proof.', '{"account_title": "Zahra Luxe (Demo)", "mobile_number": "0311-0000000"}', NULL, true, 4);

-- Order Number Sequence
CREATE SEQUENCE order_number_seq START 1000;

-- Orders
CREATE TABLE orders (
  id                   uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_number         text UNIQUE NOT NULL DEFAULT 'ORD-' || LPAD(nextval('order_number_seq')::text, 6, '0'),
  user_id              uuid REFERENCES profiles(id) ON DELETE SET NULL,
  access_token         uuid NOT NULL DEFAULT gen_random_uuid(),
  email                text NOT NULL,
  phone                text NOT NULL,
  status               order_status NOT NULL DEFAULT 'pending',
  payment_status       payment_status NOT NULL DEFAULT 'pending',
  payment_method_code  text NOT NULL REFERENCES payment_methods(code),
  payment_option       payment_option NOT NULL DEFAULT 'full',
  currency_code        text NOT NULL DEFAULT 'PKR',
  currency_rate        numeric NOT NULL DEFAULT 1,
  subtotal_pkr         numeric NOT NULL,
  shipping_pkr         numeric NOT NULL DEFAULT 0,
  total_pkr            numeric NOT NULL,
  amount_due_now_pkr   numeric NOT NULL,
  amount_balance_pkr   numeric NOT NULL DEFAULT 0,
  shipping_address     jsonb NOT NULL,
  customer_note        text,
  tracking_number      text,
  courier              text,
  internal_notes       text,
  created_at           timestamptz NOT NULL DEFAULT now(),
  updated_at           timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
CREATE POLICY "orders_owner_select" ON orders FOR SELECT
  USING (auth.uid() = user_id);

-- Order Items
CREATE TABLE order_items (
  id             uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id       uuid NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  product_id     uuid NOT NULL REFERENCES products(id),
  name           text NOT NULL,
  size           text NOT NULL,
  quantity       int NOT NULL CHECK (quantity > 0),
  unit_price_pkr numeric NOT NULL,
  image_url      text NOT NULL
);

ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "order_items_via_orders" ON order_items FOR SELECT
  USING (EXISTS (SELECT 1 FROM orders o WHERE o.id = order_id AND o.user_id = auth.uid()));

-- Order Events
CREATE TABLE order_events (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id    uuid NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  type        text NOT NULL,
  from_status text,
  to_status   text,
  note        text,
  created_at  timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE order_events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "order_events_via_orders" ON order_events FOR SELECT
  USING (EXISTS (SELECT 1 FROM orders o WHERE o.id = order_id AND o.user_id = auth.uid()));

-- Payment Proofs
CREATE TABLE payment_proofs (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id     uuid NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  storage_path text NOT NULL,
  uploaded_at  timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE payment_proofs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "payment_proofs_via_orders" ON payment_proofs FOR SELECT
  USING (EXISTS (SELECT 1 FROM orders o WHERE o.id = order_id AND o.user_id = auth.uid()));

-- Contact Messages
CREATE TABLE contact_messages (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name       text NOT NULL,
  email      text NOT NULL,
  phone      text,
  message    text NOT NULL,
  is_read    boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE contact_messages ENABLE ROW LEVEL SECURITY;

-- Subscribers
CREATE TABLE subscribers (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email           text UNIQUE NOT NULL,
  is_active       boolean NOT NULL DEFAULT true,
  created_at      timestamptz NOT NULL DEFAULT now(),
  unsubscribed_at timestamptz
);

ALTER TABLE subscribers ENABLE ROW LEVEL SECURITY;

-- Rate Limits
CREATE TABLE rate_limits (
  key          text PRIMARY KEY,
  window_start timestamptz NOT NULL DEFAULT now(),
  count        int NOT NULL DEFAULT 0
);

ALTER TABLE rate_limits ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION check_rate_limit(p_key text, p_max int, p_window_seconds int)
RETURNS boolean LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  v_now timestamptz := now();
  v_window_start timestamptz := v_now - (p_window_seconds || ' seconds')::interval;
  v_count int;
BEGIN
  INSERT INTO rate_limits(key, window_start, count)
  VALUES (p_key, v_now, 1)
  ON CONFLICT (key) DO UPDATE
    SET
      window_start = CASE WHEN rate_limits.window_start < v_window_start THEN v_now ELSE rate_limits.window_start END,
      count = CASE WHEN rate_limits.window_start < v_window_start THEN 1 ELSE rate_limits.count + 1 END;
  SELECT count INTO v_count FROM rate_limits WHERE key = p_key;
  RETURN v_count <= p_max;
END;
$$;

CREATE OR REPLACE FUNCTION create_order(payload jsonb)
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  v_order_id      uuid;
  v_order_number  text;
  v_access_token  uuid;
  v_item          jsonb;
  v_product       RECORD;
  v_stock_qty     int;
  v_subtotal      numeric := 0;
  v_shipping      numeric := 0;
  v_total         numeric;
  v_due_now       numeric;
  v_balance       numeric;
  v_user_id       uuid := auth.uid();
  v_payment_opt   payment_option;
  v_shipping_rate RECORD;
  v_country_code  text;
BEGIN
  v_country_code := payload->'shipping_address'->>'country_code';
  v_payment_opt  := (payload->>'payment_option')::payment_option;

  FOR v_item IN SELECT * FROM jsonb_array_elements(payload->'items') LOOP
    SELECT p.id, p.price_pkr, p.name, p.images[1] AS image_url
    INTO v_product
    FROM products p
    WHERE p.id = (v_item->>'product_id')::uuid AND p.is_active = true
    FOR UPDATE;

    IF NOT FOUND THEN
      RAISE EXCEPTION 'Product not found or inactive: %', v_item->>'product_id';
    END IF;

    SELECT quantity INTO v_stock_qty
    FROM product_stock
    WHERE product_id = (v_item->>'product_id')::uuid AND size = v_item->>'size'
    FOR UPDATE;

    IF v_stock_qty IS NULL OR v_stock_qty < (v_item->>'quantity')::int THEN
      RAISE EXCEPTION 'Insufficient stock for product % size %', v_product.name, v_item->>'size';
    END IF;

    v_subtotal := v_subtotal + v_product.price_pkr * (v_item->>'quantity')::int;
  END LOOP;

  SELECT * INTO v_shipping_rate
  FROM shipping_rates
  WHERE is_active = true
    AND (country_codes = '{}' OR v_country_code = ANY(country_codes))
  ORDER BY (country_codes != '{}') DESC
  LIMIT 1;

  IF FOUND THEN
    v_shipping := CASE
      WHEN v_shipping_rate.free_over_pkr IS NOT NULL AND v_subtotal >= v_shipping_rate.free_over_pkr THEN 0
      ELSE v_shipping_rate.price_pkr
    END;
  END IF;

  v_total   := v_subtotal + v_shipping;
  v_due_now := CASE WHEN v_payment_opt = 'deposit' THEN CEIL(v_total * 0.5) ELSE v_total END;
  v_balance := v_total - v_due_now;

  INSERT INTO orders (
    user_id, email, phone,
    payment_method_code, payment_option,
    currency_code, currency_rate,
    subtotal_pkr, shipping_pkr, total_pkr,
    amount_due_now_pkr, amount_balance_pkr,
    shipping_address, customer_note
  ) VALUES (
    v_user_id,
    payload->>'email',
    payload->>'phone',
    payload->>'payment_method_code',
    v_payment_opt,
    COALESCE(payload->>'currency_code', 'PKR'),
    COALESCE((payload->>'currency_rate')::numeric, 1),
    v_subtotal, v_shipping, v_total,
    v_due_now, v_balance,
    payload->'shipping_address',
    payload->>'customer_note'
  )
  RETURNING id, order_number, access_token INTO v_order_id, v_order_number, v_access_token;

  FOR v_item IN SELECT * FROM jsonb_array_elements(payload->'items') LOOP
    SELECT p.price_pkr, p.name, p.images[1] AS image_url
    INTO v_product
    FROM products p WHERE p.id = (v_item->>'product_id')::uuid;

    INSERT INTO order_items (order_id, product_id, name, size, quantity, unit_price_pkr, image_url)
    VALUES (
      v_order_id,
      (v_item->>'product_id')::uuid,
      v_product.name,
      v_item->>'size',
      (v_item->>'quantity')::int,
      v_product.price_pkr,
      v_product.image_url
    );

    UPDATE product_stock
    SET quantity = quantity - (v_item->>'quantity')::int
    WHERE product_id = (v_item->>'product_id')::uuid AND size = v_item->>'size';
  END LOOP;

  INSERT INTO order_events (order_id, type, to_status)
  VALUES (v_order_id, 'created', 'pending');

  RETURN jsonb_build_object('order_number', v_order_number, 'access_token', v_access_token);
END;
$$;

CREATE OR REPLACE FUNCTION set_order_status(p_order_id uuid, p_new_status order_status, p_note text DEFAULT NULL)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  v_current order_status;
BEGIN
  SELECT status INTO v_current FROM orders WHERE id = p_order_id FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Order not found: %', p_order_id;
  END IF;

  IF v_current = 'cancelled' THEN
    RAISE EXCEPTION 'Cannot change status of a cancelled order';
  END IF;

  IF p_new_status = 'cancelled' AND v_current IN ('shipped', 'delivered') THEN
    RAISE EXCEPTION 'Cannot cancel a shipped or delivered order';
  END IF;

  IF p_new_status = 'cancelled' THEN
    UPDATE product_stock ps
    SET quantity = quantity + oi.quantity
    FROM order_items oi
    WHERE oi.order_id = p_order_id AND ps.product_id = oi.product_id AND ps.size = oi.size;
  END IF;

  UPDATE orders SET status = p_new_status, updated_at = now() WHERE id = p_order_id;

  INSERT INTO order_events (order_id, type, from_status, to_status, note)
  VALUES (p_order_id, 'status_change', v_current::text, p_new_status::text, p_note);
END;
$$;

ALTER TABLE pages ADD COLUMN IF NOT EXISTS hero_image_url text;

INSERT INTO storage.buckets (id, name, public)
VALUES ('payment-proofs', 'payment-proofs', false)
ON CONFLICT (id) DO NOTHING;
