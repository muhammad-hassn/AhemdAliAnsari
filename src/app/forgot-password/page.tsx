"use client";

import { useState } from "react";
import Link from "next/link";
import { forgotPasswordAction } from "@/server/actions/auth";
import { Container } from "@/components/ui/Container";
import { Section } from "@/components/ui/Section";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await forgotPasswordAction({ email });
      if (res.ok) {
        setSuccess(true);
      } else {
        setError(res.error || "Failed to send reset link");
      }
    } catch {
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-[75vh] flex items-center justify-center bg-ivory">
      <Section className="w-full">
        <Container>
          <div className="w-full max-w-md mx-auto p-8 bg-cream border border-stone-light/60 shadow-xs">
            <div className="text-center mb-8">
              <h1 className="font-serif text-3xl font-normal text-ink mb-2">
                Reset Password
              </h1>
              <p className="font-sans text-xs uppercase tracking-widest text-stone">
                Enter your email address to receive reset instructions
              </p>
            </div>

            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-800 text-sm">
                {error}
              </div>
            )}

            {success ? (
              <div className="space-y-4">
                <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm">
                  If an account exists with that email, a password reset link has been sent. Please check your inbox.
                </div>
                <Link
                  href="/login"
                  className="block text-center text-xs text-ink underline uppercase tracking-wider font-medium hover:text-gold transition-colors pt-4"
                >
                  Return to Sign In
                </Link>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
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

                <Button type="submit" disabled={loading} className="w-full py-3 mt-4">
                  {loading ? "Sending..." : "Send Reset Link"}
                </Button>

                <div className="text-center pt-4">
                  <Link
                    href="/login"
                    className="text-xs text-stone hover:text-ink underline transition-colors"
                  >
                    Back to Sign In
                  </Link>
                </div>
              </form>
            )}
          </div>
        </Container>
      </Section>
    </main>
  );
}
