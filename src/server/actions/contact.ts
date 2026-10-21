"use server";

import { createClient } from "@/lib/supabase/server";
import { checkRateLimit } from "@/server/rate-limit";
import { safeAction, actionOk, actionError } from "@/lib/action";
import { contactSchema } from "@/lib/validation/contact";

export async function submitContactMessageAction(formData: unknown) {
  return safeAction(contactSchema, formData, async ({ name, email, phone, message, honeypot }) => {
    // 1. Silent rejection if honeypot triggered by bots
    if (honeypot && honeypot.length > 0) {
      return actionOk({ success: true });
    }

    // 2. Rate limit: 5 inquiries per 10 minutes per email
    const allowed = await checkRateLimit(`contact:${email}`, 5, 600);
    if (!allowed) {
      return actionError("Too many inquiries sent. Please contact us via WhatsApp.");
    }

    const supabase = await createClient();
    const { error } = await supabase.from("contact_messages").insert({
      name,
      email,
      phone: phone || null,
      message,
    });

    if (error) {
      return actionError("Unable to transmit message at this moment. Please reach us on WhatsApp.");
    }

    return actionOk({ success: true });
  });
}
