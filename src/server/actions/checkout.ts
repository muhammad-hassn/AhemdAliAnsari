"use server";

import { createClient, createServiceClient } from "@/lib/supabase/server";
import { checkRateLimit } from "@/server/rate-limit";
import { safeAction, actionOk, actionError } from "@/lib/action";
import { checkoutSchema } from "@/lib/validation/checkout";
import { computePricing } from "@/server/pricing";
import {
  sendOrderConfirmationEmail,
  sendAdminOrderNotificationEmail,
} from "@/server/email";
import type { CartItem, Order } from "@/types";

interface PlaceOrderPayload {
  checkout: unknown;
  items: CartItem[];
  shippingRatePkr: number;
}

export async function placeOrderAction(payload: PlaceOrderPayload) {
  if (!payload.items || payload.items.length === 0) {
    return actionError("Your shopping bag is empty.");
  }

  return safeAction(checkoutSchema, payload.checkout, async (validated) => {
    // 1. Rate limiting: max 5 orders per 10 minutes per email
    const allowed = await checkRateLimit(`order:${validated.email}`, 5, 600);
    if (!allowed) {
      return actionError("Too many order attempts. Please contact customer care.");
    }

    // 2. Compute accurate server-side pricing
    const pricing = computePricing({
      items: payload.items.map((i) => ({
        price_pkr: i.price_pkr,
        quantity: i.quantity,
      })),
      shipping_pkr: payload.shippingRatePkr,
      payment_option: validated.payment_option,
    });

    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    // 3. Generate identifiers (Ahmed Ali Ansari prefix AAA)
    const randomHex = Math.random().toString(36).substring(2, 7).toUpperCase();
    const orderNumber = `AAA-${Date.now().toString().slice(-4)}${randomHex}`;
    const accessToken = crypto.randomUUID();

    // 4. Insert order row
    const orderInsert = {
      order_number: orderNumber,
      user_id: user?.id ?? null,
      guest_email: validated.email,
      guest_phone: validated.phone,
      status: "pending" as const,
      shipping_address: validated.shipping_address,
      currency_code: validated.currency_code,
      currency_rate: validated.currency_rate,
      subtotal_pkr: pricing.subtotal_pkr,
      shipping_pkr: pricing.shipping_pkr,
      total_pkr: pricing.total_pkr,
      payment_method_id: validated.payment_method_code,
      payment_option: validated.payment_option,
      deposit_amount_pkr: pricing.amount_due_now_pkr,
      balance_amount_pkr: pricing.amount_balance_pkr,
      amount_paid_pkr: 0,
      payment_status: "pending" as const,
      notes: validated.customer_note ?? null,
      access_token: accessToken,
    };

    const serviceClient = createServiceClient();
    const { data: orderData, error: orderError } = await serviceClient
      .from("orders")
      .insert(orderInsert)
      .select("id")
      .single();

    if (orderError || !orderData) {
      return actionError("Failed to record order. Please try again or reach out to us.");
    }

    const orderId = orderData.id;

    // 5. Insert order items
    const itemsToInsert = payload.items.map((item) => ({
      order_id: orderId,
      product_id: item.productId,
      size: item.size,
      quantity: item.quantity,
      unit_price_pkr: item.price_pkr,
      product_name: item.name,
      product_image_url: item.image,
    }));

    await serviceClient.from("order_items").insert(itemsToInsert);

    // 6. Record order created event
    await serviceClient.from("order_events").insert({
      order_id: orderId,
      status: "pending",
      note: "Order placed by patron. Awaiting payment processing.",
    });

    // 7. Dispatch emails asynchronously without blocking order success
    const fullOrder: Order = {
      ...orderInsert,
      id: orderId,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      tracking_number: null,
      items: itemsToInsert.map((i, idx) => ({ ...i, id: `item-${idx}` })),
    };

    void sendOrderConfirmationEmail(fullOrder);
    void sendAdminOrderNotificationEmail(fullOrder);

    return actionOk({
      orderNumber,
      accessToken,
    });
  });
}
