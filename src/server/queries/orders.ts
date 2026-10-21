import "server-only";

import { createClient } from "@/lib/supabase/server";
import { checkRateLimit } from "@/server/rate-limit";
import type { ShippingRate, PaymentMethod, Order } from "@/types";

const FALLBACK_SHIPPING_RATES: ShippingRate[] = [
  {
    id: "sr-pk",
    country_code: "PK",
    region_name: "Domestic (Pakistan)",
    rate_pkr: 0,
    estimated_days: "3-5 business days",
    is_active: true,
  },
  {
    id: "sr-intl",
    country_code: "INTL",
    region_name: "International Express (Worldwide)",
    rate_pkr: 7500,
    estimated_days: "7-10 business days",
    is_active: true,
  },
];

const FALLBACK_PAYMENT_METHODS: PaymentMethod[] = [
  {
    id: "pm-cod",
    code: "cod",
    name: "Cash on Delivery",
    instructions: "Pay upon physical delivery of your ensemble. Available exclusively for domestic deliveries within Pakistan.",
    requires_proof: false,
    allowed_countries: ["PK"],
    is_active: true,
  },
  {
    id: "pm-bank",
    code: "bank_transfer",
    name: "Direct Bank Transfer",
    instructions: "Habib Bank Limited (HBL)\nAccount Title: Zahra Luxe Couture\nIBAN: PK36HABB0001234567890123\nPlease upload your wire transfer receipt after completing payment.",
    requires_proof: true,
    allowed_countries: ["*"],
    is_active: true,
  },
  {
    id: "pm-easypaisa",
    code: "easypaisa",
    name: "Easypaisa / JazzCash",
    instructions: "Account Title: Zahra Luxe\nNumber: 0300-1234567\nPlease provide your transaction ID or screenshot proof after payment.",
    requires_proof: true,
    allowed_countries: ["PK"],
    is_active: true,
  },
];

export async function getShippingRates(): Promise<ShippingRate[]> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("shipping_rates")
      .select("*")
      .eq("is_active", true);

    if (error || !data || data.length === 0) {
      return FALLBACK_SHIPPING_RATES;
    }
    return data as ShippingRate[];
  } catch {
    return FALLBACK_SHIPPING_RATES;
  }
}

export async function getPaymentMethods(): Promise<PaymentMethod[]> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("payment_methods")
      .select("*")
      .eq("is_active", true);

    if (error || !data || data.length === 0) {
      return FALLBACK_PAYMENT_METHODS;
    }
    return data as PaymentMethod[];
  } catch {
    return FALLBACK_PAYMENT_METHODS;
  }
}

export async function getOrderByNumberAndToken(
  orderNumber: string,
  token?: string | null,
): Promise<Order | null> {
  const supabase = await createClient();

  let query = supabase
    .from("orders")
    .select("*, items:order_items(*), events:order_events(*)")
    .eq("order_number", orderNumber);

  if (token) {
    query = query.eq("access_token", token);
  } else {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return null;
    query = query.eq("user_id", user.id);
  }

  const { data, error } = await query.maybeSingle();

  if (error || !data) return null;
  return data as Order;
}

export async function trackOrder(
  orderNumber: string,
  email: string,
  ip = "anonymous",
): Promise<{ ok: boolean; order?: Order; error?: string }> {
  // Rate limit tracking requests: 10 attempts per minute
  const allowed = await checkRateLimit(`track:${ip}`, 10, 60);
  if (!allowed) {
    return { ok: false, error: "Too many tracking lookups. Please try again shortly." };
  }

  const supabase = await createClient();
  const cleanNumber = orderNumber.trim().replace(/^#/, "");
  const cleanEmail = email.trim().toLowerCase();

  const { data, error } = await supabase
    .from("orders")
    .select("*, items:order_items(*), events:order_events(*)")
    .eq("order_number", cleanNumber)
    .maybeSingle();

  if (error || !data) {
    return { ok: false, error: "No matching order found with the provided details." };
  }

  const matchesGuest = data.guest_email?.toLowerCase() === cleanEmail;
  const matchesAddress = data.shipping_address?.email?.toLowerCase() === cleanEmail;

  if (!matchesGuest && !matchesAddress) {
    return { ok: false, error: "No matching order found with the provided details." };
  }

  return { ok: true, order: data as Order };
}
