import "server-only";
import { createClient } from "@supabase/supabase-js";
import { env } from "@/lib/env";
import { reportError } from "@/lib/report-error";

function getServiceClient() {
  const key = env.SUPABASE_SERVICE_ROLE_KEY;
  if (!key) return null;
  return createClient(env.NEXT_PUBLIC_SUPABASE_URL, key, {
    auth: { persistSession: false },
  });
}

export async function checkRateLimit(
  key: string,
  maxCount: number,
  windowSeconds: number,
): Promise<boolean> {
  const client = getServiceClient();
  if (!client) return true;
  try {
    const { data, error } = await client.rpc("check_rate_limit", {
      p_key: key,
      p_max: maxCount,
      p_window_seconds: windowSeconds,
    });
    if (error) throw error;
    return Boolean(data);
  } catch (err) {
    reportError(err, "checkRateLimit");
    return true;
  }
}
