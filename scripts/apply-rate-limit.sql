-- From existing migration 0002_commerce.sql (lines 251-276)
-- Creates the missing rate_limits table and check_rate_limit function

CREATE TABLE IF NOT EXISTS rate_limits (
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
