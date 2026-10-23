-- =========================================================================
-- 0004_manual_payment_system.sql
-- Manual Bank Transfer, 50% Advance + 50% COD, and Receipt Verification System
-- =========================================================================

-- 1. Ensure Types exist
DO $$ BEGIN
  CREATE TYPE payment_status AS ENUM ('pending', 'proof_submitted', 'deposit_received', 'paid', 'refunded');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE payment_option AS ENUM ('full', 'deposit');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE order_status AS ENUM ('pending', 'confirmed', 'shipped', 'delivered', 'cancelled');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- 2. Ensure Payment Methods Table
CREATE TABLE IF NOT EXISTS payment_methods (
  id                    text PRIMARY KEY DEFAULT gen_random_uuid()::text,
  code                  text UNIQUE NOT NULL,
  name                  text NOT NULL,
  instructions          text NOT NULL,
  requires_proof        boolean NOT NULL DEFAULT false,
  allowed_countries     text[] NOT NULL DEFAULT ARRAY['*'],
  is_active             boolean NOT NULL DEFAULT true,
  sort_order            int NOT NULL DEFAULT 0
);

ALTER TABLE payment_methods ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  CREATE POLICY "payment_methods_public_select" ON payment_methods FOR SELECT USING (is_active = true);
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Upsert payment methods with Ahmed Ali Ansari details
INSERT INTO payment_methods (code, name, instructions, requires_proof, allowed_countries, is_active, sort_order)
VALUES
  ('bank_transfer', 'Direct Bank Transfer', 'Meezan Bank Limited\nAccount Title: Ahmed Ali Ansari\nAccount No: 0101-0105849301\nIBAN: PK36MEZN0001010105849301\nBranch: Main Branch, Lahore\nPlease transfer the payable amount and upload your transaction receipt/reference for verification.', true, ARRAY['*'], true, 1),
  ('cod', 'Cash on Delivery', 'Pay upon physical delivery of your ensemble. Available exclusively for domestic deliveries within Pakistan.', false, ARRAY['PK'], true, 2),
  ('easypaisa', 'Easypaisa / JazzCash', 'Account Title: Ahmed Ali Ansari\nNumber: 0309-2045906\nPlease transfer the amount and submit your transaction ID / screenshot for verification.', true, ARRAY['PK'], true, 3)
ON CONFLICT (code) DO UPDATE SET
  name = EXCLUDED.name,
  instructions = EXCLUDED.instructions,
  requires_proof = EXCLUDED.requires_proof,
  allowed_countries = EXCLUDED.allowed_countries,
  is_active = EXCLUDED.is_active;

-- 3. Ensure Orders Table Columns
CREATE TABLE IF NOT EXISTS orders (
  id                   uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_number         text UNIQUE NOT NULL,
  user_id              uuid REFERENCES profiles(id) ON DELETE SET NULL,
  guest_email          text,
  guest_phone          text,
  status               order_status NOT NULL DEFAULT 'pending',
  payment_status       payment_status NOT NULL DEFAULT 'pending',
  payment_method_id    text NOT NULL,
  payment_option       payment_option NOT NULL DEFAULT 'full',
  currency_code        text NOT NULL DEFAULT 'PKR',
  currency_rate        numeric NOT NULL DEFAULT 1,
  subtotal_pkr         numeric NOT NULL,
  shipping_pkr         numeric NOT NULL DEFAULT 0,
  total_pkr            numeric NOT NULL,
  deposit_amount_pkr   numeric NOT NULL DEFAULT 0,
  balance_amount_pkr   numeric NOT NULL DEFAULT 0,
  amount_paid_pkr      numeric NOT NULL DEFAULT 0,
  shipping_address     jsonb NOT NULL,
  notes                text,
  tracking_number      text,
  access_token         text NOT NULL DEFAULT gen_random_uuid()::text,
  created_at           timestamptz NOT NULL DEFAULT now(),
  updated_at           timestamptz NOT NULL DEFAULT now()
);

-- Ensure newly added columns exist in case table was created earlier
ALTER TABLE orders ADD COLUMN IF NOT EXISTS amount_paid_pkr numeric NOT NULL DEFAULT 0;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS deposit_amount_pkr numeric NOT NULL DEFAULT 0;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS balance_amount_pkr numeric NOT NULL DEFAULT 0;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS payment_option payment_option NOT NULL DEFAULT 'full';
ALTER TABLE orders ADD COLUMN IF NOT EXISTS payment_status payment_status NOT NULL DEFAULT 'pending';
ALTER TABLE orders ADD COLUMN IF NOT EXISTS access_token text DEFAULT gen_random_uuid()::text;

ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  CREATE POLICY "orders_owner_select" ON orders FOR SELECT
    USING (auth.uid() = user_id OR auth.uid() IN (SELECT id FROM profiles WHERE role IN ('admin', 'editor')));
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE POLICY "orders_admin_all" ON orders FOR ALL
    USING (auth.uid() IN (SELECT id FROM profiles WHERE role IN ('admin', 'editor')));
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- 4. Payment Proofs Table
CREATE TABLE IF NOT EXISTS payment_proofs (
  id                    uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id              uuid NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  storage_path          text,
  file_url              text,
  transaction_reference text,
  amount                numeric,
  notes                 text,
  status                text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  rejection_reason      text,
  reviewed_by           uuid REFERENCES profiles(id) ON DELETE SET NULL,
  reviewed_at           timestamptz,
  created_at            timestamptz NOT NULL DEFAULT now(),
  uploaded_at           timestamptz NOT NULL DEFAULT now()
);

-- Ensure columns exist if table was partially created
ALTER TABLE payment_proofs ADD COLUMN IF NOT EXISTS storage_path text;
ALTER TABLE payment_proofs ADD COLUMN IF NOT EXISTS file_url text;
ALTER TABLE payment_proofs ADD COLUMN IF NOT EXISTS transaction_reference text;
ALTER TABLE payment_proofs ADD COLUMN IF NOT EXISTS amount numeric;
ALTER TABLE payment_proofs ADD COLUMN IF NOT EXISTS notes text;
ALTER TABLE payment_proofs ADD COLUMN IF NOT EXISTS status text NOT NULL DEFAULT 'pending';
ALTER TABLE payment_proofs ADD COLUMN IF NOT EXISTS rejection_reason text;
ALTER TABLE payment_proofs ADD COLUMN IF NOT EXISTS reviewed_by uuid REFERENCES profiles(id) ON DELETE SET NULL;
ALTER TABLE payment_proofs ADD COLUMN IF NOT EXISTS reviewed_at timestamptz;
ALTER TABLE payment_proofs ADD COLUMN IF NOT EXISTS created_at timestamptz NOT NULL DEFAULT now();
ALTER TABLE payment_proofs ADD COLUMN IF NOT EXISTS uploaded_at timestamptz NOT NULL DEFAULT now();

ALTER TABLE payment_proofs ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  CREATE POLICY "payment_proofs_admin_all" ON payment_proofs FOR ALL
    USING (auth.uid() IN (SELECT id FROM profiles WHERE role IN ('admin', 'editor')));
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE POLICY "payment_proofs_owner_select" ON payment_proofs FOR SELECT
    USING (EXISTS (SELECT 1 FROM orders o WHERE o.id = payment_proofs.order_id AND (o.user_id = auth.uid() OR auth.uid() IN (SELECT id FROM profiles WHERE role IN ('admin', 'editor')))));
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- 5. Order Events Table
CREATE TABLE IF NOT EXISTS order_events (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id    uuid NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  status      order_status NOT NULL,
  notes       text,
  note        text,
  created_at  timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE order_events ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  CREATE POLICY "order_events_admin_all" ON order_events FOR ALL
    USING (auth.uid() IN (SELECT id FROM profiles WHERE role IN ('admin', 'editor')));
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- 6. Ensure Private Storage Bucket for Payment Proofs
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'payment-proofs',
  'payment-proofs',
  false,
  5242880,
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'application/pdf']
)
ON CONFLICT (id) DO UPDATE SET
  public = false,
  file_size_limit = 5242880,
  allowed_mime_types = ARRAY['image/jpeg', 'image/png', 'image/webp', 'application/pdf'];

-- Storage bucket access policies
DO $$ BEGIN
  CREATE POLICY "payment_proofs_admin_storage" ON storage.objects FOR ALL
    USING (bucket_id = 'payment-proofs' AND auth.uid() IN (SELECT id FROM profiles WHERE role IN ('admin', 'editor')));
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- 7. Seed Configurable Bank Details in Site Settings
INSERT INTO site_settings (key, value) VALUES
  ('bank_name', 'Meezan Bank Limited'),
  ('bank_account_title', 'Ahmed Ali Ansari'),
  ('bank_account_number', '0101-0105849301'),
  ('bank_iban', 'PK36MEZN0001010105849301'),
  ('bank_branch', 'Main Branch, Lahore'),
  ('bank_transfer_instructions', 'Please transfer the payable amount to our official bank account. Submit your transaction reference ID and upload the transfer receipt screenshot to confirm your order.')
ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, updated_at = now();
