"use server";

import { createClient } from "@/lib/supabase/server";
import { actionOk } from "@/lib/action";

export async function syncWishlistAction(productIds: string[]) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return actionOk({ synced: false, items: productIds });
  }

  // Get existing items in DB
  const { data: dbItems } = await supabase
    .from("wishlist_items")
    .select("product_id")
    .eq("user_id", user.id);

  const existingIds = (dbItems ?? []).map((i) => i.product_id);
  const toInsert = productIds.filter((id) => !existingIds.includes(id));

  if (toInsert.length > 0) {
    await supabase.from("wishlist_items").insert(
      toInsert.map((productId) => ({
        user_id: user.id,
        product_id: productId,
      })),
    );
  }

  // Return union of local and remote
  const combined = Array.from(new Set([...existingIds, ...productIds]));
  return actionOk({ synced: true, items: combined });
}

export async function toggleWishlistDbAction(productId: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return actionOk({ authenticated: false, wishlisted: false });
  }

  const { data: existing } = await supabase
    .from("wishlist_items")
    .select("id")
    .eq("user_id", user.id)
    .eq("product_id", productId)
    .maybeSingle();

  if (existing) {
    await supabase
      .from("wishlist_items")
      .delete()
      .eq("id", existing.id);
    return actionOk({ authenticated: true, wishlisted: false });
  } else {
    await supabase.from("wishlist_items").insert({
      user_id: user.id,
      product_id: productId,
    });
    return actionOk({ authenticated: true, wishlisted: true });
  }
}
