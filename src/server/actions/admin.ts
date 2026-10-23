"use server";

import { revalidateTag, revalidatePath } from "next/cache";
import { createClient, createServiceClient } from "@/lib/supabase/server";
import {
  ProductSchema,
  CollectionSchema,
  BlogPostSchema,
  PageSchema,
  RedirectSchema,
  type ProductInput,
  type CollectionInput,
  type BlogPostInput,
  type PageInput,
  type RedirectInput,
} from "@/lib/validation/admin";
import { actionOk, actionError, type ActionResult } from "@/lib/action";
import type { OrderStatus } from "@/types";

async function requireRole(allowedRoles: ("admin" | "editor")[]) {
  const supabase = await createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    throw new Error("Unauthorized: Please sign in");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (!profile || !allowedRoles.includes(profile.role)) {
    throw new Error("Forbidden: You do not have permission for this action");
  }

  const serviceClient = createServiceClient();
  return { supabase: serviceClient, user, role: profile.role };
}

async function recordAudit(
  supabase: Awaited<ReturnType<typeof createClient>>,
  userId: string,
  action: string,
  entityType: string,
  entityId: string,
  details?: Record<string, unknown>,
) {
  try {
    await supabase.from("audit_log").insert({
      user_id: userId,
      action,
      entity_type: entityType,
      entity_id: entityId,
      details: details || null,
    });
  } catch {
    // Non-blocking audit failure
  }
}

// 1. PRODUCTS
export async function saveProductAction(
  rawInput: ProductInput,
): Promise<ActionResult<{ id: string }>> {
  try {
    const { supabase, user } = await requireRole(["admin"]);
    const parsed = ProductSchema.safeParse(rawInput);
    if (!parsed.success) {
      return actionError(parsed.error.issues[0]?.message || "Invalid input");
    }
    const data = parsed.data;

    const productPayload = {
      name: data.name,
      slug: data.slug,
      collection_id: data.collection_id || null,
      price_pkr: data.price_pkr,
      compare_at_price_pkr: data.compare_at_price_pkr || null,
      description: data.description,
      details: {
        fabric: data.fabric,
        trouser: data.trouser || "",
        dupatta: data.dupatta || "",
      },
      sizes: data.sizes,
      images: data.images,
      is_active: data.is_active,
      is_featured: data.is_featured,
      in_stock: Object.values(data.stock).some((qty) => qty > 0),
    };

    let productId = data.id;

    if (productId) {
      const { error } = await supabase
        .from("products")
        .update(productPayload)
        .eq("id", productId);
      if (error) return actionError(error.message);
      await recordAudit(supabase, user.id, "update", "product", productId, productPayload);
    } else {
      const { data: inserted, error } = await supabase
        .from("products")
        .insert(productPayload)
        .select("id")
        .single();
      if (error || !inserted) return actionError(error?.message || "Failed to create product");
      productId = inserted.id;
      await recordAudit(supabase, user.id, "create", "product", inserted.id, productPayload);
    }

    if (!productId) {
      return actionError("Failed to resolve product ID");
    }

    // Upsert stock entries
    for (const [size, quantity] of Object.entries(data.stock)) {
      await supabase
        .from("product_stock")
        .upsert(
          {
            product_id: productId,
            size,
            quantity,
          },
          { onConflict: "product_id,size" },
        );
    }

    revalidateTag("products", "max");
    revalidateTag(`product-${data.slug}`, "max");

    return actionOk({ id: productId });
  } catch (err) {
    return actionError(err instanceof Error ? err.message : "Error saving product");
  }
}

export async function deleteProductAction(id: string): Promise<ActionResult> {
  try {
    const { supabase, user } = await requireRole(["admin", "editor"]);
    const { error } = await supabase.from("products").delete().eq("id", id);
    if (error) return actionError(error.message);

    await recordAudit(supabase, user.id, "delete", "product", id);
    revalidatePath("/admin/products");
    revalidatePath("/shop");
    revalidatePath("/");
    revalidateTag("products", "max");
    return actionOk(undefined);
  } catch (err) {
    return actionError(err instanceof Error ? err.message : "Error deleting product");
  }
}

export async function duplicateProductAction(id: string): Promise<ActionResult<{ id: string }>> {
  try {
    const { supabase, user } = await requireRole(["admin"]);
    const { data: original, error: fetchErr } = await supabase
      .from("products")
      .select("*")
      .eq("id", id)
      .single();

    if (fetchErr || !original) {
      return actionError("Product not found");
    }

    const newSlug = `${original.slug}-copy-${Date.now().toString().slice(-4)}`;
    const newName = `${original.name} (Copy)`;

    const { data: inserted, error: insertErr } = await supabase
      .from("products")
      .insert({
        ...original,
        id: undefined,
        name: newName,
        slug: newSlug,
        is_active: false,
        created_at: new Date().toISOString(),
      })
      .select("id")
      .single();

    if (insertErr || !inserted) {
      return actionError(insertErr?.message || "Failed to duplicate product");
    }

    // Duplicate stock
    const { data: stockItems } = await supabase
      .from("product_stock")
      .select("size, quantity")
      .eq("product_id", id);

    if (stockItems && stockItems.length > 0) {
      await supabase.from("product_stock").insert(
        stockItems.map((item) => ({
          product_id: inserted.id,
          size: item.size,
          quantity: item.quantity,
        })),
      );
    }

    await recordAudit(supabase, user.id, "duplicate", "product", inserted.id, { originalId: id });
    revalidateTag("products", "max");

    return actionOk({ id: inserted.id });
  } catch (err) {
    return actionError(err instanceof Error ? err.message : "Error duplicating product");
  }
}

// 2. COLLECTIONS
export async function saveCollectionAction(
  rawInput: CollectionInput,
): Promise<ActionResult<{ id: string }>> {
  try {
    const { supabase, user } = await requireRole(["admin"]);
    const parsed = CollectionSchema.safeParse(rawInput);
    if (!parsed.success) {
      return actionError(parsed.error.issues[0]?.message || "Invalid input");
    }
    const data = parsed.data;

    let collectionId = data.id;

    if (collectionId) {
      const { error } = await supabase
        .from("collections")
        .update({
          name: data.name,
          slug: data.slug,
          description: data.description,
          image_url: data.image_url,
          sort_order: data.sort_order,
        })
        .eq("id", collectionId);

      if (error) return actionError(error.message);
      await recordAudit(supabase, user.id, "update", "collection", collectionId, data);
    } else {
      const { data: inserted, error } = await supabase
        .from("collections")
        .insert({
          name: data.name,
          slug: data.slug,
          description: data.description,
          image_url: data.image_url,
          sort_order: data.sort_order,
        })
        .select("id")
        .single();

      if (error || !inserted) return actionError(error?.message || "Failed to create collection");
      collectionId = inserted.id;
      await recordAudit(supabase, user.id, "create", "collection", inserted.id, data);
    }

    if (!collectionId) {
      return actionError("Failed to resolve collection id");
    }

    revalidateTag("collections", "max");
    return actionOk({ id: collectionId });
  } catch (err) {
    return actionError(err instanceof Error ? err.message : "Error saving collection");
  }
}

export async function deleteCollectionAction(id: string): Promise<ActionResult> {
  try {
    const { supabase, user } = await requireRole(["admin", "editor"]);

    // Disassociate any products from this collection so they become standalone garments
    await supabase.from("products").update({ collection_id: null }).eq("collection_id", id);

    const { error } = await supabase.from("collections").delete().eq("id", id);
    if (error) return actionError(error.message);

    await recordAudit(supabase, user.id, "delete", "collection", id);
    revalidatePath("/admin/collections");
    revalidatePath("/shop");
    revalidatePath("/");
    revalidateTag("collections", "max");
    return actionOk(undefined);
  } catch (err) {
    return actionError(err instanceof Error ? err.message : "Error deleting collection");
  }
}

// 3. ORDERS
export async function updateOrderStatusAction(
  orderId: string,
  newStatus: OrderStatus,
  note?: string,
): Promise<ActionResult> {
  try {
    const { supabase, user } = await requireRole(["admin"]);

    // Try set_order_status DB function
    const { error: fnErr } = await supabase.rpc("set_order_status", {
      order_id: orderId,
      new_status: newStatus,
      note: note || `Status updated to ${newStatus} by admin`,
    });

    if (fnErr) {
      // Direct update fallback if RPC errors
      const { error: updErr } = await supabase
        .from("orders")
        .update({ status: newStatus, updated_at: new Date().toISOString() })
        .eq("id", orderId);

      if (updErr) return actionError(updErr.message);

      await supabase.from("order_events").insert({
        order_id: orderId,
        status: newStatus,
        notes: note || `Status updated to ${newStatus}`,
      });
    }

    await recordAudit(supabase, user.id, "update_status", "order", orderId, {
      status: newStatus,
      note,
    });

    revalidateTag("orders", "max");
    return actionOk(undefined);
  } catch (err) {
    return actionError(err instanceof Error ? err.message : "Error updating order");
  }
}

export async function updateOrderTrackingAction(
  orderId: string,
  trackingNumber: string,
): Promise<ActionResult> {
  try {
    const { supabase, user } = await requireRole(["admin"]);
    const { error } = await supabase
      .from("orders")
      .update({
        tracking_number: trackingNumber,
        updated_at: new Date().toISOString(),
      })
      .eq("id", orderId);

    if (error) return actionError(error.message);

    await supabase.from("order_events").insert({
      order_id: orderId,
      status: "shipped",
      notes: `Tracking number added: ${trackingNumber}`,
    });

    await recordAudit(supabase, user.id, "update_tracking", "order", orderId, {
      trackingNumber,
    });

    revalidateTag("orders", "max");
    return actionOk(undefined);
  } catch (err) {
    return actionError(err instanceof Error ? err.message : "Error updating tracking");
  }
}

export async function updateOrderNotesAction(
  orderId: string,
  notes: string,
): Promise<ActionResult> {
  try {
    const { supabase, user } = await requireRole(["admin"]);
    const { error } = await supabase
      .from("orders")
      .update({ notes, updated_at: new Date().toISOString() })
      .eq("id", orderId);

    if (error) return actionError(error.message);

    await recordAudit(supabase, user.id, "update_notes", "order", orderId, { notes });
    revalidateTag("orders", "max");
    return actionOk(undefined);
  } catch (err) {
    return actionError(err instanceof Error ? err.message : "Error updating notes");
  }
}

export async function approvePaymentProofAction(
  orderId: string,
  proofId?: string,
): Promise<ActionResult> {
  try {
    const { supabase, user } = await requireRole(["admin"]);
    const serviceClient = createServiceClient();

    // Fetch order details
    const { data: order, error: orderErr } = await serviceClient
      .from("orders")
      .select("*")
      .eq("id", orderId)
      .single();

    if (orderErr || !order) {
      return actionError("Order not found.");
    }

    if (order.payment_status === "paid") {
      return actionError("Order payment is already marked as paid.");
    }

    const isDeposit = order.payment_option === "deposit";
    const depositAmount = Number(order.deposit_amount_pkr || Math.ceil(order.total_pkr * 0.5));
    const totalAmount = Number(order.total_pkr);
    const balanceAmount = isDeposit ? totalAmount - depositAmount : 0;

    const newPaymentStatus = isDeposit ? "deposit_received" : "paid";
    const newAmountPaid = isDeposit ? depositAmount : totalAmount;

    // 1. Update payment proof status if proof provided
    if (proofId) {
      await serviceClient
        .from("payment_proofs")
        .update({
          status: "approved",
          rejection_reason: null,
          reviewed_by: user.id,
          reviewed_at: new Date().toISOString(),
        })
        .eq("id", proofId);
    } else {
      // If no specific proof ID provided, approve any pending proofs for this order
      await serviceClient
        .from("payment_proofs")
        .update({
          status: "approved",
          rejection_reason: null,
          reviewed_by: user.id,
          reviewed_at: new Date().toISOString(),
        })
        .eq("order_id", orderId)
        .eq("status", "pending");
    }

    // 2. Update order financial and payment status
    const updatePayload: Record<string, unknown> = {
      payment_status: newPaymentStatus,
      amount_paid_pkr: newAmountPaid,
      balance_amount_pkr: balanceAmount,
      updated_at: new Date().toISOString(),
    };

    // If order was pending, automatically confirm it since payment / deposit is verified
    if (order.status === "pending") {
      updatePayload.status = "confirmed";
    }

    const { error: updErr } = await serviceClient
      .from("orders")
      .update(updatePayload)
      .eq("id", orderId);

    if (updErr) {
      return actionError(`Failed to update order payment: ${updErr.message}`);
    }

    // 3. Record order event
    const eventNote = isDeposit
      ? `Advance bank transfer of Rs. ${depositAmount.toLocaleString()} verified by admin. Outstanding COD balance: Rs. ${balanceAmount.toLocaleString()}. Order moved to Confirmed.`
      : `Full bank transfer payment of Rs. ${totalAmount.toLocaleString()} verified by admin. Order is now fully PAID and Confirmed.`;

    await serviceClient.from("order_events").insert({
      order_id: orderId,
      status: (updatePayload.status as OrderStatus) || order.status,
      note: eventNote,
    });

    // 4. Record audit log
    await recordAudit(supabase, user.id, "approve_payment", "order", orderId, {
      proofId,
      isDeposit,
      amountPaid: newAmountPaid,
      balanceAmount,
      paymentStatus: newPaymentStatus,
    });

    revalidateTag("orders", "max");
    return actionOk(undefined);
  } catch (err) {
    return actionError(err instanceof Error ? err.message : "Error approving payment");
  }
}

export async function rejectPaymentProofAction(
  orderId: string,
  proofId: string,
  reason: string,
): Promise<ActionResult> {
  try {
    const { supabase, user } = await requireRole(["admin"]);
    const serviceClient = createServiceClient();

    if (!reason || !reason.trim()) {
      return actionError("Please specify a rejection reason for the client.");
    }

    // 1. Update payment proof status
    if (proofId) {
      const { error: proofErr } = await serviceClient
        .from("payment_proofs")
        .update({
          status: "rejected",
          rejection_reason: reason.trim(),
          reviewed_by: user.id,
          reviewed_at: new Date().toISOString(),
        })
        .eq("id", proofId);

      if (proofErr) {
        return actionError(`Failed to update proof: ${proofErr.message}`);
      }
    }

    // 2. Reset order payment status to pending
    const { error: orderErr } = await serviceClient
      .from("orders")
      .update({
        payment_status: "pending",
        updated_at: new Date().toISOString(),
      })
      .eq("id", orderId);

    if (orderErr) {
      return actionError(`Failed to reset order payment status: ${orderErr.message}`);
    }

    // 3. Record order event
    await serviceClient.from("order_events").insert({
      order_id: orderId,
      status: "pending",
      note: `Payment proof submission rejected by admin. Reason: ${reason.trim()}. Awaiting new client submission.`,
    });

    // 4. Record audit log
    await recordAudit(supabase, user.id, "reject_payment", "order", orderId, {
      proofId,
      reason: reason.trim(),
    });

    revalidateTag("orders", "max");
    return actionOk(undefined);
  } catch (err) {
    return actionError(err instanceof Error ? err.message : "Error rejecting payment");
  }
}

export async function markCodCollectedAction(orderId: string): Promise<ActionResult> {
  try {
    const { supabase, user } = await requireRole(["admin"]);
    const serviceClient = createServiceClient();

    // Fetch order
    const { data: order, error: orderErr } = await serviceClient
      .from("orders")
      .select("*")
      .eq("id", orderId)
      .single();

    if (orderErr || !order) {
      return actionError("Order not found.");
    }

    if (order.payment_status === "paid") {
      return actionError("This order is already marked as fully paid.");
    }

    const totalAmount = Number(order.total_pkr);
    const balanceAmount = Number(order.balance_amount_pkr || 0);

    // Update order
    const { error: updErr } = await serviceClient
      .from("orders")
      .update({
        amount_paid_pkr: totalAmount,
        balance_amount_pkr: 0,
        payment_status: "paid",
        updated_at: new Date().toISOString(),
      })
      .eq("id", orderId);

    if (updErr) {
      return actionError(`Failed to update COD collection: ${updErr.message}`);
    }

    // Record order event
    await serviceClient.from("order_events").insert({
      order_id: orderId,
      status: order.status,
      note: `Outstanding COD balance of Rs. ${balanceAmount.toLocaleString()} collected upon delivery. Order marked as fully PAID.`,
    });

    // Record audit log
    await recordAudit(supabase, user.id, "collect_cod", "order", orderId, {
      totalAmount,
      balanceCollected: balanceAmount,
    });

    revalidateTag("orders", "max");
    return actionOk(undefined);
  } catch (err) {
    return actionError(err instanceof Error ? err.message : "Error updating COD collection");
  }
}

// 4. BLOG POSTS
export async function saveBlogPostAction(
  rawInput: BlogPostInput,
): Promise<ActionResult<{ id: string }>> {
  try {
    const { supabase, user } = await requireRole(["admin", "editor"]);
    const parsed = BlogPostSchema.safeParse(rawInput);
    if (!parsed.success) {
      return actionError(parsed.error.issues[0]?.message || "Invalid input");
    }
    const data = parsed.data;

    // Calculate reading time (approx 200 words per minute)
    const wordCount = data.content.replace(/<[^>]*>/g, " ").trim().split(/\s+/).length;
    const readingTime = Math.max(1, Math.ceil(wordCount / 200));

    const postPayload = {
      title: data.title,
      slug: data.slug,
      excerpt: data.excerpt,
      content: data.content,
      cover_image_url: data.cover_image_url,
      cover_alt: data.cover_alt,
      author_id: data.author_id || null,
      category_id: data.category_id || null,
      status: data.status,
      published_at:
        data.status === "published"
          ? data.published_at || new Date().toISOString()
          : data.published_at || null,
      reading_time: readingTime,
      is_featured: data.is_featured,
      meta_title: data.meta_title || null,
      meta_description: data.meta_description || null,
      og_image_url: data.og_image_url || null,
      canonical_url: data.canonical_url || null,
      noindex: data.noindex,
      updated_at: new Date().toISOString(),
    };

    let postId = data.id;

    if (postId) {
      const { error } = await supabase
        .from("blog_posts")
        .update(postPayload)
        .eq("id", postId);
      if (error) return actionError(error.message);
      await recordAudit(supabase, user.id, "update", "blog_post", postId, postPayload);
    } else {
      const { data: inserted, error } = await supabase
        .from("blog_posts")
        .insert(postPayload)
        .select("id")
        .single();
      if (error || !inserted) return actionError(error?.message || "Failed to create post");
      postId = inserted.id;
      await recordAudit(supabase, user.id, "create", "blog_post", inserted.id, postPayload);
    }

    if (!postId) {
      return actionError("Failed to resolve post id");
    }

    // Sync tags
    await supabase.from("post_tags").delete().eq("post_id", postId);
    if (data.tag_ids && data.tag_ids.length > 0) {
      const tagRows = data.tag_ids.map((tag_id) => ({
        post_id: postId,
        tag_id,
      }));
      await supabase.from("post_tags").insert(tagRows);
    }

    revalidateTag("blog", "max");
    revalidateTag(`blog-${data.slug}`, "max");

    return actionOk({ id: postId });
  } catch (err) {
    return actionError(err instanceof Error ? err.message : "Error saving blog post");
  }
}

export async function deleteBlogPostAction(id: string): Promise<ActionResult> {
  try {
    const { supabase, user } = await requireRole(["admin", "editor"]);
    const { error } = await supabase.from("blog_posts").delete().eq("id", id);
    if (error) return actionError(error.message);

    await recordAudit(supabase, user.id, "delete", "blog_post", id);
    revalidateTag("blog", "max");
    return actionOk(undefined);
  } catch (err) {
    return actionError(err instanceof Error ? err.message : "Error deleting post");
  }
}

// 5. PAGES
export async function savePageAction(
  rawInput: PageInput,
): Promise<ActionResult> {
  try {
    const { supabase, user } = await requireRole(["admin", "editor"]);
    const parsed = PageSchema.safeParse(rawInput);
    if (!parsed.success) {
      return actionError(parsed.error.issues[0]?.message || "Invalid input");
    }
    const data = parsed.data;

    const { error } = await supabase
      .from("pages")
      .upsert(
        {
          key: data.key,
          title: data.title,
          content: data.content,
          meta_title: data.meta_title || null,
          meta_description: data.meta_description || null,
          hero_image_url: data.hero_image_url || null,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "key" },
      );

    if (error) return actionError(error.message);

    await recordAudit(supabase, user.id, "update", "page", data.key, data);
    revalidateTag("pages", "max");
    revalidateTag(`page-${data.key}`, "max");

    return actionOk(undefined);
  } catch (err) {
    return actionError(err instanceof Error ? err.message : "Error saving page");
  }
}

// 6. REDIRECTS
export async function saveRedirectAction(
  rawInput: RedirectInput,
): Promise<ActionResult<{ id: string }>> {
  try {
    const { supabase, user } = await requireRole(["admin"]);
    const parsed = RedirectSchema.safeParse(rawInput);
    if (!parsed.success) {
      return actionError(parsed.error.issues[0]?.message || "Invalid input");
    }
    const data = parsed.data;

    let redirectId = data.id;

    if (redirectId) {
      const { error } = await supabase
        .from("redirects")
        .update({
          from_path: data.from_path,
          to_path: data.to_path,
          status_code: data.status_code,
          is_active: data.is_active,
        })
        .eq("id", redirectId);
      if (error) return actionError(error.message);
      await recordAudit(supabase, user.id, "update", "redirect", redirectId, data);
    } else {
      const { data: inserted, error } = await supabase
        .from("redirects")
        .insert({
          from_path: data.from_path,
          to_path: data.to_path,
          status_code: data.status_code,
          is_active: data.is_active,
        })
        .select("id")
        .single();
      if (error || !inserted) return actionError(error?.message || "Failed to create redirect");
      redirectId = inserted.id;
      await recordAudit(supabase, user.id, "create", "redirect", inserted.id, data);
    }

    if (!redirectId) {
      return actionError("Failed to resolve redirect id");
    }

    revalidateTag("redirects", "max");
    return actionOk({ id: redirectId });
  } catch (err) {
    return actionError(err instanceof Error ? err.message : "Error saving redirect");
  }
}

export async function deleteRedirectAction(id: string): Promise<ActionResult> {
  try {
    const { supabase, user } = await requireRole(["admin"]);
    const { error } = await supabase.from("redirects").delete().eq("id", id);
    if (error) return actionError(error.message);

    await recordAudit(supabase, user.id, "delete", "redirect", id);
    revalidateTag("redirects", "max");
    return actionOk(undefined);
  } catch (err) {
    return actionError(err instanceof Error ? err.message : "Error deleting redirect");
  }
}

// 7. SITE SETTINGS
export async function saveSiteSettingsAction(
  settings: Record<string, string>,
): Promise<ActionResult> {
  try {
    const { supabase, user } = await requireRole(["admin"]);

    // Batch all settings into a single upsert instead of sequential round-trips
    const now = new Date().toISOString();
    const rows = Object.entries(settings).map(([key, value]) => ({
      key,
      value,
      updated_at: now,
    }));

    const { error } = await supabase.from("site_settings").upsert(rows);
    if (error) return actionError(error.message);

    await recordAudit(supabase, user.id, "update", "site_settings", "bulk", settings);
    revalidateTag("settings", "max");
    return actionOk(undefined);
  } catch (err) {
    return actionError(err instanceof Error ? err.message : "Error saving settings");
  }
}

// 8. CONTACT MESSAGES & SUBSCRIBERS
export async function markContactMessageReadAction(id: string): Promise<ActionResult> {
  try {
    const { supabase, user } = await requireRole(["admin", "editor"]);
    const { error } = await supabase
      .from("contact_messages")
      .update({ is_read: true })
      .eq("id", id);

    if (error) return actionError(error.message);
    await recordAudit(supabase, user.id, "mark_read", "contact_message", id);
    return actionOk(undefined);
  } catch (err) {
    return actionError(err instanceof Error ? err.message : "Error updating message");
  }
}

export async function deleteContactMessageAction(id: string): Promise<ActionResult> {
  try {
    const { supabase, user } = await requireRole(["admin", "editor"]);
    const { error } = await supabase.from("contact_messages").delete().eq("id", id);
    if (error) return actionError(error.message);

    await recordAudit(supabase, user.id, "delete", "contact_message", id);
    return actionOk(undefined);
  } catch (err) {
    return actionError(err instanceof Error ? err.message : "Error deleting message");
  }
}

// 9. HERO SLIDES
export async function saveHeroSlideAction(
  slide: Partial<import("@/types").HeroSlide> & { heading: string; desktop_image_url: string; cta_text: string; cta_link: string },
): Promise<ActionResult<{ id: string }>> {
  try {
    const { supabase, user } = await requireRole(["admin"]);
    let slideId = slide.id;

    if (slideId) {
      const { error } = await supabase
        .from("hero_slides")
        .update({
          heading: slide.heading,
          subheading: slide.subheading || null,
          desktop_image_url: slide.desktop_image_url,
          mobile_image_url: slide.mobile_image_url || null,
          cta_text: slide.cta_text,
          cta_link: slide.cta_link,
          sort_order: slide.sort_order ?? 0,
          is_active: slide.is_active ?? true,
        })
        .eq("id", slideId);

      if (error) return actionError(error.message);
      await recordAudit(supabase, user.id, "update", "hero_slide", slideId, slide);
    } else {
      const { data: inserted, error } = await supabase
        .from("hero_slides")
        .insert({
          heading: slide.heading,
          subheading: slide.subheading || null,
          desktop_image_url: slide.desktop_image_url,
          mobile_image_url: slide.mobile_image_url || null,
          cta_text: slide.cta_text,
          cta_link: slide.cta_link,
          sort_order: slide.sort_order ?? 0,
          is_active: slide.is_active ?? true,
        })
        .select("id")
        .single();

      if (error || !inserted) return actionError(error?.message || "Failed to create slide");
      slideId = inserted.id;
      await recordAudit(supabase, user.id, "create", "hero_slide", inserted.id, slide);
    }

    if (!slideId) {
      return actionError("Failed to resolve slide id");
    }

    revalidateTag("hero_slides", "max");
    return actionOk({ id: slideId });
  } catch (err) {
    return actionError(err instanceof Error ? err.message : "Error saving hero slide");
  }
}

export async function deleteHeroSlideAction(id: string): Promise<ActionResult> {
  try {
    const { supabase, user } = await requireRole(["admin"]);
    const { error } = await supabase.from("hero_slides").delete().eq("id", id);
    if (error) return actionError(error.message);

    await recordAudit(supabase, user.id, "delete", "hero_slide", id);
    revalidateTag("hero_slides", "max");
    return actionOk(undefined);
  } catch (err) {
    return actionError(err instanceof Error ? err.message : "Error deleting hero slide");
  }
}

// 10. NAVIGATION ITEMS
export async function saveNavigationItemAction(
  item: Partial<import("@/types").NavigationItem> & { location: "header" | "footer"; label: string; href: string },
): Promise<ActionResult<{ id: string }>> {
  try {
    const { supabase, user } = await requireRole(["admin"]);
    let itemId = item.id;

    if (itemId) {
      const { error } = await supabase
        .from("navigation_items")
        .update({
          location: item.location,
          label: item.label,
          href: item.href,
          sort_order: item.sort_order ?? 0,
          is_active: item.is_active ?? true,
        })
        .eq("id", itemId);

      if (error) return actionError(error.message);
      await recordAudit(supabase, user.id, "update", "navigation_item", itemId, item);
    } else {
      const { data: inserted, error } = await supabase
        .from("navigation_items")
        .insert({
          location: item.location,
          label: item.label,
          href: item.href,
          sort_order: item.sort_order ?? 0,
          is_active: item.is_active ?? true,
        })
        .select("id")
        .single();

      if (error || !inserted) return actionError(error?.message || "Failed to create nav item");
      itemId = inserted.id;
      await recordAudit(supabase, user.id, "create", "navigation_item", inserted.id, item);
    }

    if (!itemId) {
      return actionError("Failed to resolve item id");
    }

    revalidateTag("navigation", "max");
    return actionOk({ id: itemId });
  } catch (err) {
    return actionError(err instanceof Error ? err.message : "Error saving nav item");
  }
}

export async function deleteNavigationItemAction(id: string): Promise<ActionResult> {
  try {
    const { supabase, user } = await requireRole(["admin"]);
    const { error } = await supabase.from("navigation_items").delete().eq("id", id);
    if (error) return actionError(error.message);

    await recordAudit(supabase, user.id, "delete", "navigation_item", id);
    revalidateTag("navigation", "max");
    return actionOk(undefined);
  } catch (err) {
    return actionError(err instanceof Error ? err.message : "Error deleting nav item");
  }
}

// 11. PROMOTIONAL POPUP
export async function savePromotionalPopupAction(
  popup: Partial<import("@/types").PromotionalPopup> & {
    title: string;
    description: string;
    image_url: string;
    button_text: string;
    destination_link: string;
  },
): Promise<ActionResult> {
  try {
    const { supabase, user } = await requireRole(["admin", "editor"]);

    const payload: import("@/types").PromotionalPopup = {
      id: popup.id || `promo-${Date.now()}`,
      is_active: popup.is_active ?? true,
      title: popup.title.trim(),
      description: popup.description.trim(),
      badge_text: popup.badge_text?.trim() || undefined,
      discount_code: popup.discount_code?.trim() || undefined,
      image_url: popup.image_url.trim(),
      button_text: popup.button_text.trim() || "Shop Now",
      destination_link: popup.destination_link.trim() || "/shop",
      start_date: popup.start_date || null,
      expiry_date: popup.expiry_date || null,
      delay_seconds: popup.delay_seconds ?? 3,
      frequency: popup.frequency || "once_per_session",
      updated_at: new Date().toISOString(),
    };

    const { error } = await supabase.from("site_settings").upsert({
      key: "promotional_popup",
      value: JSON.stringify(payload),
      updated_at: new Date().toISOString(),
    });

    if (error) return actionError(error.message);

    await recordAudit(
      supabase,
      user.id,
      "update",
      "promotional_popup",
      payload.id,
      payload as unknown as Record<string, unknown>,
    );
    revalidateTag("settings", "max");
    revalidateTag("promotional_popup", "max");

    return actionOk(undefined);
  } catch (err) {
    return actionError(err instanceof Error ? err.message : "Error saving promotional popup");
  }
}

export async function deletePromotionalPopupAction(): Promise<ActionResult> {
  try {
    const { supabase, user } = await requireRole(["admin"]);

    // Disable the popup rather than leaving broken state
    const { error } = await supabase.from("site_settings").upsert({
      key: "promotional_popup",
      value: JSON.stringify({ is_active: false, updated_at: new Date().toISOString() }),
      updated_at: new Date().toISOString(),
    });

    if (error) return actionError(error.message);

    await recordAudit(supabase, user.id, "delete", "promotional_popup", "single");
    revalidateTag("settings", "max");
    revalidateTag("promotional_popup", "max");

    return actionOk(undefined);
  } catch (err) {
    return actionError(err instanceof Error ? err.message : "Error deleting promotional popup");
  }
}



