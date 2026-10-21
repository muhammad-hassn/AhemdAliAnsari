"use server";

import { createClient } from "@/lib/supabase/server";
import { safeAction, actionOk, actionError } from "@/lib/action";
import {
  loginSchema,
  registerSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
} from "@/lib/validation/auth";
import { env } from "@/lib/env";
import { revalidatePath } from "next/cache";

export async function signInWithPasswordAction(formData: unknown) {
  return safeAction(loginSchema, formData, async ({ email, password }) => {
    const supabase = await createClient();
    const { data: authData, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      return actionError(error.message);
    }

    let role = "customer";
    if (authData?.user) {
      const normalizedEmail = (authData.user.email || email).toLowerCase().trim();
      if (normalizedEmail === "aahmedaliansariofficial@gmail.com") {
        role = "admin";
      } else {
        try {
          const { data: profile } = await supabase
            .from("profiles")
            .select("role")
            .eq("id", authData.user.id)
            .single();

          if (profile?.role) {
            role = profile.role;
          }
        } catch {
          // fallback to customer
        }
      }
    }

    revalidatePath("/", "layout");
    return actionOk({ success: true, role });
  });
}

export async function signUpAction(formData: unknown) {
  return safeAction(registerSchema, formData, async ({ email, password, full_name }) => {
    const supabase = await createClient();

    // Sign up
    const { error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name },
      },
    });

    if (signUpError) {
      return actionError(signUpError.message);
    }

    // Immediately sign in (no email confirmation wait)
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (signInError) {
      // Signup worked, just auto-login failed — user can login manually
      return actionOk({ success: true, autoLogin: false });
    }

    revalidatePath("/", "layout");
    return actionOk({ success: true, autoLogin: true });
  });
}

export async function sendMagicLinkAction(email: string) {
  const supabase = await createClient();
  const siteUrl = env.NEXT_PUBLIC_SITE_URL.replace(/\/$/, "");

  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: {
      emailRedirectTo: `${siteUrl}/auth/callback`,
    },
  });

  if (error) {
    return actionError(error.message);
  }

  return actionOk({ success: true });
}

export async function forgotPasswordAction(formData: unknown) {
  return safeAction(forgotPasswordSchema, formData, async ({ email }) => {
    const supabase = await createClient();
    const siteUrl = env.NEXT_PUBLIC_SITE_URL.replace(/\/$/, "");

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${siteUrl}/reset-password`,
    });

    if (error) {
      return actionError(error.message);
    }

    return actionOk({ success: true });
  });
}

export async function resetPasswordAction(formData: unknown) {
  return safeAction(resetPasswordSchema, formData, async ({ password }) => {
    const supabase = await createClient();
    const { error } = await supabase.auth.updateUser({
      password,
    });

    if (error) {
      return actionError(error.message);
    }

    revalidatePath("/", "layout");
    return actionOk({ success: true });
  });
}

export async function signOutAction() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  revalidatePath("/", "layout");
  return actionOk({ success: true });
}
