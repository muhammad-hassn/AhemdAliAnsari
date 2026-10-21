import { createClient } from "@/lib/supabase/server";
import { safeRedirect } from "@/lib/safe-redirect";
import { NextResponse, type NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next");

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      const redirectPath = safeRedirect(next, "/account");
      return NextResponse.redirect(`${origin}${redirectPath}`);
    }
  }

  // If code exchange failed or wasn't provided, redirect to login with error
  return NextResponse.redirect(`${origin}/login?error=auth_callback_failed`);
}
