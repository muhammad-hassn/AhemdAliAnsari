"use server";

import { createClient, createServiceClient } from "@/lib/supabase/server";
import { actionOk, actionError, type ActionResult } from "@/lib/action";
import { revalidatePath, revalidateTag } from "next/cache";

interface SubmitPaymentProofPayload {
  orderNumber: string;
  accessToken: string;
  fileUrl?: string;
  storagePath?: string;
  transactionReference?: string;
  notes?: string;
}

export async function submitPaymentProofAction(payload: SubmitPaymentProofPayload): Promise<ActionResult<{ success: boolean }>> {
  if (!payload.orderNumber || !payload.accessToken) {
    return actionError("Missing order number or access credentials.");
  }

  if (!payload.storagePath && !payload.fileUrl && !payload.transactionReference) {
    return actionError("Please provide a receipt upload or transaction reference.");
  }

  const supabase = await createClient();

  // Validate order access via token
  const { data: order, error: orderError } = await supabase
    .from("orders")
    .select("id, status, payment_status, total_pkr, deposit_amount_pkr")
    .eq("order_number", payload.orderNumber)
    .eq("access_token", payload.accessToken)
    .single();

  if (orderError || !order) {
    return actionError("Order not found or invalid access credentials.");
  }

  // Use service client for atomic insertion into payment_proofs & orders update
  const serviceClient = createServiceClient();

  const proofPayload = {
    order_id: order.id,
    storage_path: payload.storagePath || null,
    file_url: payload.fileUrl || payload.storagePath || "",
    transaction_reference: payload.transactionReference?.trim() || null,
    notes: payload.notes?.trim() || null,
    status: "pending",
  };

  const { error: proofError } = await serviceClient
    .from("payment_proofs")
    .insert(proofPayload);

  if (proofError) {
    return actionError("Failed to record payment verification. Please try again.");
  }

  // Update order payment status to proof_submitted
  await serviceClient
    .from("orders")
    .update({
      payment_status: "proof_submitted",
      updated_at: new Date().toISOString(),
    })
    .eq("id", order.id);

  // Add event
  const refText = payload.transactionReference ? ` (Ref: ${payload.transactionReference})` : "";
  await serviceClient.from("order_events").insert({
    order_id: order.id,
    status: order.status,
    note: `Payment proof and details submitted by patron${refText}. Awaiting administrator verification.`,
  });

  revalidatePath(`/order/${payload.orderNumber}`);
  revalidateTag("orders", "max");

  return actionOk({ success: true });
}

interface GetSignedUrlPayload {
  proofId: string;
  orderNumber?: string;
  accessToken?: string;
}

export async function getReceiptSignedUrlAction(
  payload: GetSignedUrlPayload,
): Promise<ActionResult<{ signedUrl: string }>> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // 1. Fetch user role if authenticated
  let isAdmin = false;
  if (user) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();
    if (profile && ["admin", "editor"].includes(profile.role)) {
      isAdmin = true;
    }
  }

  // 2. Fetch the proof record
  const serviceClient = createServiceClient();
  const { data: proof, error: proofErr } = await serviceClient
    .from("payment_proofs")
    .select("*, order:orders(id, order_number, user_id, access_token)")
    .eq("id", payload.proofId)
    .single();

  if (proofErr || !proof) {
    return actionError("Receipt record not found.");
  }

  // 3. Authorization check: must be admin OR order patron (matching user_id or accessToken)
  const orderData = proof.order as { id: string; order_number: string; user_id?: string; access_token?: string } | null;

  const isOwner = Boolean(user?.id && orderData?.user_id && user.id === orderData.user_id);
  const hasValidToken = Boolean(payload.accessToken && orderData?.access_token && payload.accessToken === orderData.access_token);

  if (!isAdmin && !isOwner && !hasValidToken) {
    return actionError("Forbidden: You do not have permission to access this receipt.");
  }

  const rawPath = proof.storage_path || proof.file_url;
  if (!rawPath) {
    return actionError("No receipt file attached to this submission.");
  }

  // If already an absolute external URL (not in private storage), return directly
  if (rawPath.startsWith("http://") || rawPath.startsWith("https://")) {
    // If it's already a public URL or full URL, return it
    return actionOk({ signedUrl: rawPath });
  }

  // Generate short-lived signed URL (15 minutes = 900 seconds) from payment-proofs private bucket
  const cleanPath = rawPath.replace(/^payment-proofs\//, "");
  const { data: signedData, error: signErr } = await serviceClient.storage
    .from("payment-proofs")
    .createSignedUrl(cleanPath, 900);

  if (signErr || !signedData?.signedUrl) {
    return actionError("Failed to generate secure receipt viewing URL.");
  }

  return actionOk({ signedUrl: signedData.signedUrl });
}
