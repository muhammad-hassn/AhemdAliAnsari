"use server";

import { createClient } from "@/lib/supabase/server";
import { actionOk, actionError } from "@/lib/action";
import { revalidatePath } from "next/cache";

interface SubmitPaymentProofPayload {
  orderNumber: string;
  accessToken: string;
  fileUrl: string;
  notes?: string;
}

export async function submitPaymentProofAction(payload: SubmitPaymentProofPayload) {
  const supabase = await createClient();

  // Validate order access via token
  const { data: order, error: orderError } = await supabase
    .from("orders")
    .select("id, status")
    .eq("order_number", payload.orderNumber)
    .eq("access_token", payload.accessToken)
    .single();

  if (orderError || !order) {
    return actionError("Order not found or invalid access credentials.");
  }

  // Insert payment proof record
  const { error: proofError } = await supabase.from("payment_proofs").insert({
    order_id: order.id,
    file_url: payload.fileUrl,
    notes: payload.notes ?? null,
    status: "pending",
  });

  if (proofError) {
    return actionError("Failed to record payment verification. Please try again.");
  }

  // Update order payment status
  await supabase
    .from("orders")
    .update({ payment_status: "proof_submitted" })
    .eq("id", order.id);

  // Add event
  await supabase.from("order_events").insert({
    order_id: order.id,
    status: order.status,
    note: "Payment proof uploaded by customer",
  });

  revalidatePath(`/order/${payload.orderNumber}`);
  return actionOk({ success: true });
}
