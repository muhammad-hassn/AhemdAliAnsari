import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";
import { revalidatePath, revalidateTag } from "next/cache";

export const dynamic = "force-dynamic";

const ALLOWED_MIME_TYPES = new Set([
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
  "application/pdf",
]);

const ALLOWED_EXTENSIONS = new Set(["jpg", "jpeg", "png", "webp", "pdf"]);
const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024; // 5MB

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file");
    const orderNumber = formData.get("orderNumber") as string;
    const accessToken = formData.get("accessToken") as string;
    const transactionReference = formData.get("transactionReference") as string | null;
    const notes = formData.get("notes") as string | null;

    if (!orderNumber || !accessToken) {
      return NextResponse.json(
        { success: false, error: "Missing order authentication credentials." },
        { status: 400 },
      );
    }

    const hasFile = file instanceof File;
    if (!hasFile && !transactionReference?.trim()) {
      return NextResponse.json(
        { success: false, error: "Please provide a receipt file or transaction reference." },
        { status: 400 },
      );
    }
    if (file && !hasFile) {
      return NextResponse.json(
        { success: false, error: "Invalid receipt file." },
        { status: 400 },
      );
    }

    // 1. Verify order access by the unguessable order access token.
    const serviceClient = createServiceClient();
    const { data: order, error: orderErr } = await serviceClient
      .from("orders")
      .select("id, status, payment_status, total_pkr, deposit_amount_pkr")
      .eq("order_number", orderNumber)
      .eq("access_token", accessToken)
      .single();

    if (orderErr || !order) {
      return NextResponse.json(
        { success: false, error: "Order not found or invalid access token." },
        { status: 403 },
      );
    }

    let destinationPath: string | null = null;
    if (hasFile) {
      // 2. Validate file type and extension
      const mimeType = file.type.toLowerCase();
      const ext = file.name.split(".").pop()?.toLowerCase() || "";

      if (!ALLOWED_MIME_TYPES.has(mimeType) || !ALLOWED_EXTENSIONS.has(ext)) {
        return NextResponse.json(
          {
            success: false,
            error: "Invalid file format. Only JPG, PNG, WebP image or PDF receipt files are supported.",
          },
          { status: 400 },
        );
      }

      // 3. Validate file size
      if (file.size > MAX_FILE_SIZE_BYTES) {
        return NextResponse.json(
          {
            success: false,
            error: `Receipt file size exceeds the 5MB limit (current: ${(file.size / (1024 * 1024)).toFixed(1)}MB).`,
          },
          { status: 400 },
        );
      }

      // 4. Generate clean, safe unique path
      const randomSuffix = crypto.randomUUID();
      destinationPath = `orders/${order.id}/${Date.now()}-${randomSuffix}.${ext}`;
      const buffer = Buffer.from(await file.arrayBuffer());

      // 5. Upload to private Supabase Storage bucket 'payment-proofs'
      const { error: uploadError } = await serviceClient.storage
        .from("payment-proofs")
        .upload(destinationPath, buffer, {
          contentType: file.type,
          upsert: false,
        });

      if (uploadError) {
        return NextResponse.json(
          { success: false, error: "Failed to upload receipt to secure storage. Please try again." },
          { status: 500 },
        );
      }
    }

    // 6. Record in payment_proofs table
    const { data: proofData, error: proofError } = await serviceClient
      .from("payment_proofs")
      .insert({
        order_id: order.id,
        storage_path: destinationPath,
        file_url: destinationPath,
        transaction_reference: transactionReference?.trim() || null,
        notes: notes?.trim() || null,
        status: "pending",
      })
      .select("id")
      .single();

    if (proofError || !proofData) {
      if (destinationPath) {
        await serviceClient.storage.from("payment-proofs").remove([destinationPath]);
      }
      return NextResponse.json(
        { success: false, error: "Failed to record payment verification. Please try again." },
        { status: 500 },
      );
    }

    // 7. Update order payment_status to 'proof_submitted'
    const { error: updateError } = await serviceClient
      .from("orders")
      .update({
        payment_status: "proof_submitted",
        updated_at: new Date().toISOString(),
      })
      .eq("id", order.id);

    if (updateError) {
      await serviceClient.from("payment_proofs").delete().eq("id", proofData.id);
      if (destinationPath) {
        await serviceClient.storage.from("payment-proofs").remove([destinationPath]);
      }
      return NextResponse.json(
        { success: false, error: "Failed to update order payment status. Please try again." },
        { status: 500 },
      );
    }

    // 8. Add event to timeline
    const refText = transactionReference ? ` (Ref: ${transactionReference.trim()})` : "";
    await serviceClient.from("order_events").insert({
      order_id: order.id,
      status: order.status,
      note: hasFile
        ? `Payment receipt file (${file.name}) and transaction reference${refText} uploaded by patron.`
        : `Payment transaction reference${refText} submitted by patron.`,
    });

    revalidatePath(`/order/${orderNumber}`);
    revalidateTag("orders", "max");

    return NextResponse.json({
      success: true,
      storagePath: destinationPath,
      proofId: proofData?.id,
      message: "Payment receipt uploaded successfully and submitted for administrator verification.",
    });
  } catch (err) {
    return NextResponse.json(
      {
        success: false,
        error: err instanceof Error ? err.message : "Unexpected error uploading receipt.",
      },
      { status: 500 },
    );
  }
}
