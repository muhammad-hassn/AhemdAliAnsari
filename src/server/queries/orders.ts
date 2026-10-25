import "server-only";

import { createClient, createServiceClient } from "@/lib/supabase/server";
import { checkRateLimit } from "@/server/rate-limit";
import { getSiteSettings } from "@/server/queries/settings";
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

export async function getPaymentMethods(): Promise<PaymentMethod[]> {
  const settings = await getSiteSettings();
  const bankInstructions = [
    settings.bank_name ? `Bank: ${settings.bank_name}` : "Bank: Meezan Bank Limited",
    settings.bank_account_title ? `Account Title: ${settings.bank_account_title}` : "Account Title: Ahmed Ali Ansari",
    settings.bank_account_number ? `Account Number: ${settings.bank_account_number}` : "Account Number: 0101-0105849301",
    settings.bank_iban ? `IBAN: ${settings.bank_iban}` : "IBAN: PK36MEZN0001010105849301",
    settings.bank_branch ? `Branch: ${settings.bank_branch}` : "",
    settings.bank_transfer_instructions || "Please transfer the payable amount and upload your transaction receipt/reference for verification.",
  ]
    .filter(Boolean)
    .join("\n");

  const fallbackMethods: PaymentMethod[] = [
    {
      id: "pm-bank",
      code: "bank_transfer",
      name: "Direct Bank Transfer",
      instructions: bankInstructions,
      requires_proof: true,
      allowed_countries: ["*"],
      is_active: true,
    },
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
      id: "pm-easypaisa",
      code: "easypaisa",
      name: "Easypaisa / JazzCash",
      instructions: `Account Title: ${settings.bank_account_title || "Ahmed Ali Ansari"}\nNumber: ${settings.contact_phone || "0309-2045906"}\nPlease provide your transaction ID or screenshot proof after payment.`,
      requires_proof: true,
      allowed_countries: ["PK"],
      is_active: true,
    },
  ];

  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("payment_methods")
      .select("*")
      .eq("is_active", true)
      .order("sort_order", { ascending: true });

    if (error || !data || data.length === 0) {
      return fallbackMethods;
    }

    // Enhance database methods with dynamic bank instructions if bank_transfer
    return (data as PaymentMethod[]).map((m) => {
      if (m.code === "bank_transfer") {
        return {
          ...m,
          instructions: m.instructions || bankInstructions,
        };
      }
      return m;
    });
  } catch {
    return fallbackMethods;
  }
}

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

export async function getOrderByNumberAndToken(
  orderNumber: string,
  token?: string | null,
): Promise<Order | null> {
  let userId: string | undefined;

  if (!token) {
    const authClient = await createClient();
    const {
      data: { user },
    } = await authClient.auth.getUser();

    if (!user) return null;
    userId = user.id;
  }

  // Guest orders are not visible through the public RLS policy. Use the
  // service client only after constraining the lookup by the access token.
  const supabase = createServiceClient();

  let query = supabase
    .from("orders")
    .select("*, items:order_items(*), events:order_events(*), proofs:payment_proofs(*)")
    .eq("order_number", orderNumber);

  if (token) {
    query = query.eq("access_token", token);
  } else {
    if (!userId) return null;
    query = query.eq("user_id", userId);
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
