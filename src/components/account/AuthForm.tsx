"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { signInWithPasswordAction, signUpAction, sendMagicLinkAction } from "@/server/actions/auth";
import { syncWishlistAction } from "@/server/actions/wishlist";
import { useWishlistStore } from "@/store/use-wishlist-store";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { safeRedirect } from "@/lib/safe-redirect";

interface AuthFormProps {
  mode: "login" | "register";
}

export function AuthForm({ mode }: AuthFormProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = searchParams.get("next");

  const [isMagicLink, setIsMagicLink] = useState(false);
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMessage(null);
    setLoading(true);

    try {
      if (mode === "login" && isMagicLink) {
        const res = await sendMagicLinkAction(email);
        if (res.ok) {
          setSuccessMessage("Magic link sent! Check your email to sign in.");
        } else {
          setError(res.error || "Failed to send magic link");
        }
      } else if (mode === "login") {
        const res = await signInWithPasswordAction({ email, password });
        if (res.ok) {
          const items = useWishlistStore.getState().items;
          if (items.length > 0) {
            void syncWishlistAction(items.map((i) => i.id));
          }
          const role = (res.data as { role?: string } | undefined)?.role;
          if (role === "admin" || role === "editor") {
            router.push("/admin");
          } else if (next && !next.startsWith("/admin")) {
            router.push(safeRedirect(next, "/"));
          } else {
            router.push("/");
          }
          router.refresh();
        } else {
          setError(res.error || "Failed to sign in");
        }
      } else {
        const res = await signUpAction({ email, password, full_name: fullName });
        if (res.ok) {
          // Auto-login happened — redirect directly to home page
          const items = useWishlistStore.getState().items;
          if (items.length > 0) {
            void syncWishlistAction(items.map((i) => i.id));
          }
          router.push("/");
          router.refresh();
        } else {
          setError(res.error || "Failed to create account");
        }
      }
    } catch {
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto p-8 bg-cream border border-stone-light/60 shadow-xs">
      <div className="text-center mb-8">
        <h1 className="font-serif text-3xl font-normal text-ink mb-2">
          {mode === "login" ? "Welcome Back" : "Create Account"}
        </h1>
        <p className="font-sans text-xs uppercase tracking-widest text-stone">
          {mode === "login"
            ? "Sign in to access your orders and wishlist"
            : "Join Zahra Luxe for bespoke privileges"}
        </p>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-800 text-sm">
          {error}
        </div>
      )}

      {successMessage && (
        <div className="mb-6 p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm">
          {successMessage}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {mode === "register" && (
          <div>
            <label className="block text-xs uppercase tracking-wider text-ink mb-1">
              Full Name
            </label>
            <Input
              type="text"
              required
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="e.g. Ayesha Khan"
              className="w-full"
            />
          </div>
        )}

        <div>
          <label className="block text-xs uppercase tracking-wider text-ink mb-1">
            Email Address
          </label>
          <Input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="ayesha@example.com"
            className="w-full"
          />
        </div>

        {(!isMagicLink || mode === "register") && (
          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="block text-xs uppercase tracking-wider text-ink">
                Password
              </label>
              {mode === "login" && (
                <Link
                  href="/forgot-password"
                  className="text-xs text-stone hover:text-ink underline transition-colors"
                >
                  Forgot password?
                </Link>
              )}
            </div>
            <Input
              type="password"
              required
              minLength={8}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full"
            />
          </div>
        )}

        <Button
          type="submit"
          disabled={loading}
          className="w-full py-3 mt-4"
        >
          {loading
            ? "Processing..."
            : mode === "login"
              ? isMagicLink
                ? "Send Magic Link"
                : "Sign In"
              : "Create Account"}
        </Button>

        {mode === "login" && (
          <button
            type="button"
            onClick={() => setIsMagicLink(!isMagicLink)}
            className="w-full text-center text-xs text-stone hover:text-ink transition-colors mt-2"
          >
            {isMagicLink
              ? "Or sign in with password instead"
              : "Or sign in with passwordless Magic Link"}
          </button>
        )}
      </form>

      <div className="mt-8 pt-6 border-t border-stone-light/60 text-center text-xs text-stone">
        {mode === "login" ? (
          <p>
            Don&apos;t have an account?{" "}
            <Link
              href={next ? `/register?next=${encodeURIComponent(next)}` : "/register"}
              className="text-ink underline hover:text-gold transition-colors ml-1 font-medium"
            >
              Register here
            </Link>
          </p>
        ) : (
          <p>
            Already have an account?{" "}
            <Link
              href={next ? `/login?next=${encodeURIComponent(next)}` : "/login"}
              className="text-ink underline hover:text-gold transition-colors ml-1 font-medium"
            >
              Sign in
            </Link>
          </p>
        )}
      </div>
    </div>
  );
}
