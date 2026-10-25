// Comprehensive verification script for check_rate_limit RPC & table
import { createClient } from "@supabase/supabase-js";
import { readFileSync } from "fs";

const envContent = readFileSync(".env.local", "utf8");
const envVars = {};
for (const line of envContent.split("\n")) {
  const trimmed = line.trim();
  if (!trimmed || trimmed.startsWith("#")) continue;
  const eqIdx = trimmed.indexOf("=");
  if (eqIdx > 0) envVars[trimmed.slice(0, eqIdx)] = trimmed.slice(eqIdx + 1);
}

const client = createClient(envVars.NEXT_PUBLIC_SUPABASE_URL, envVars.SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false },
});

async function runVerification() {
  console.log("=== SUPABASE RATE LIMIT VERIFICATION ===");
  console.log("Target Project:", envVars.NEXT_PUBLIC_SUPABASE_URL);

  // 1. Check table existence
  console.log("\n1. Checking table 'public.rate_limits'...");
  const { data: tableData, error: tableErr } = await client
    .from("rate_limits")
    .select("*")
    .limit(1);

  if (tableErr) {
    console.error("❌ Table check failed:", tableErr.message, `(${tableErr.code})`);
    return false;
  }
  console.log("✅ Table 'public.rate_limits' is accessible by service role.");

  // 2. Test RPC function: Allow when under limit
  console.log("\n2. Testing check_rate_limit RPC (under limit)...");
  const testKey = `test_rate_limit_${Date.now()}`;
  
  // Call 1: limit 2, window 60s
  const { data: call1, error: err1 } = await client.rpc("check_rate_limit", {
    p_key: testKey,
    p_max: 2,
    p_window_seconds: 60,
  });

  if (err1) {
    console.error("❌ RPC call 1 failed:", err1.message, `(${err1.code})`);
    return false;
  }
  console.log(`Call 1 result (expected true):`, call1);

  // Call 2: limit 2, window 60s
  const { data: call2, error: err2 } = await client.rpc("check_rate_limit", {
    p_key: testKey,
    p_max: 2,
    p_window_seconds: 60,
  });
  console.log(`Call 2 result (expected true):`, call2);

  // Call 3: should exceed limit of 2
  const { data: call3, error: err3 } = await client.rpc("check_rate_limit", {
    p_key: testKey,
    p_max: 2,
    p_window_seconds: 60,
  });
  console.log(`Call 3 result (expected false - blocked):`, call3);

  const passed = call1 === true && call2 === true && call3 === false;
  if (passed) {
    console.log("\n✅ Rate limiting logic is WORKING correctly!");
  } else {
    console.error("\n❌ Rate limiting logic test failed!");
  }

  // 3. Clean up test row
  await client.from("rate_limits").delete().eq("key", testKey);
  console.log("Cleaned up test row.");

  return passed;
}

runVerification().catch(console.error);
