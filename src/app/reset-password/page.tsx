"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { resetPasswordAction } from "@/server/actions/auth";
import { Container } from "@/components/ui/Container";
import { Section } from "@/components/ui/Section";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

export default function ResetPasswordPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setLoading(true);

    try {
      const res = await resetPasswordAction({ password, confirmPassword });
      if (res.ok) {
        router.push("/account");
        router.refresh();
      } else {
        setError(res.error || "Failed to reset password");
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
                New Password
              </h1>
              <p className="font-sans text-xs uppercase tracking-widest text-stone">
                Enter your new account password
              </p>
            </div>

            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-800 text-sm">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs uppercase tracking-wider text-ink mb-1">
                  New Password
                </label>
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

              <div>
                <label className="block text-xs uppercase tracking-wider text-ink mb-1">
                  Confirm New Password
                </label>
                <Input
                  type="password"
                  required
                  minLength={8}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full"
                />
              </div>

              <Button type="submit" disabled={loading} className="w-full py-3 mt-4">
                {loading ? "Updating..." : "Update Password"}
              </Button>

              <div className="text-center pt-4">
                <Link
                  href="/login"
                  className="text-xs text-stone hover:text-ink underline transition-colors"
                >
                  Cancel
                </Link>
              </div>
            </form>
          </div>
        </Container>
      </Section>
    </main>
  );
}
