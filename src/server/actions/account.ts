"use server";

import { createClient } from "@/lib/supabase/server";
import { safeAction, actionOk, actionError } from "@/lib/action";
import { updateProfileSchema } from "@/lib/validation/account";
import { addressSchema } from "@/lib/validation/checkout";
import { revalidatePath } from "next/cache";

export async function updateProfileAction(formData: unknown) {
  return safeAction(updateProfileSchema, formData, async ({ full_name, phone }) => {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return actionError("Not authenticated");
    }

    const { error } = await supabase
      .from("profiles")
      .update({
        full_name,
        phone: phone ?? null,
      })
      .eq("id", user.id);

    if (error) {
      return actionError(error.message);
    }

    revalidatePath("/account");
    return actionOk({ success: true });
  });
}

export async function addAddressAction(formData: unknown) {
  return safeAction(addressSchema, formData, async (data) => {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return actionError("Not authenticated");
    }

    const { error } = await supabase.from("addresses").insert({
      user_id: user.id,
      label: data.label,
      full_name: data.full_name,
      phone: data.phone,
      line1: data.line1,
      line2: data.line2 ?? null,
      city: data.city,
      state: data.state,
      postal_code: data.postal_code,
      country_code: data.country_code,
    });

    if (error) {
      return actionError(error.message);
    }

    revalidatePath("/account");
    return actionOk({ success: true });
  });
}

export async function deleteAddressAction(addressId: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return actionError("Not authenticated");
  }

  const { error } = await supabase
    .from("addresses")
    .delete()
    .eq("id", addressId)
    .eq("user_id", user.id);

  if (error) {
    return actionError(error.message);
  }

  revalidatePath("/account");
  return actionOk({ success: true });
}

export async function setDefaultAddressAction(addressId: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return actionError("Not authenticated");
  }

  // Clear previous default
  await supabase
    .from("addresses")
    .update({ is_default: false })
    .eq("user_id", user.id);

  // Set new default
  const { error } = await supabase
    .from("addresses")
    .update({ is_default: true })
    .eq("id", addressId)
    .eq("user_id", user.id);

  if (error) {
    return actionError(error.message);
  }

  revalidatePath("/account");
  return actionOk({ success: true });
}
