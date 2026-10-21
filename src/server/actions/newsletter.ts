"use server";

import { createClient } from "@/lib/supabase/server";
import { checkRateLimit } from "@/server/rate-limit";
import { safeAction, actionOk, actionError } from "@/lib/action";
import { newsletterSchema } from "@/lib/validation/newsletter";

export async function subscribeNewsletterAction(formData: unknown) {
  return safeAction(newsletterSchema, formData, async ({ email }) => {
    const allowed = await checkRateLimit(`newsletter:${email}`, 5, 300);
    if (!allowed) {
      return actionError("Too many subscription requests. Please try again later.");
    }

    const supabase = await createClient();
    const { error } = await supabase.from("subscribers").insert({
      email: email.toLowerCase().trim(),
    });

    if (error) {
      // Duplicate email code 23505 in postgres
      if (error.code === "23505") {
        return actionOk({
          message: "You are already subscribed to our private salon circulars.",
        });
      }
      return actionError("Unable to join newsletter. Please try again.");
    }

    return actionOk({
      message: "Thank you for subscribing to Zahra Luxe private previews.",
    });
  });
}
