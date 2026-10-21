"use client";

import { useState } from "react";
import { subscribeNewsletterAction } from "@/server/actions/newsletter";
import { Input } from "@/components/ui/Input";

export function NewsletterForm() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setLoading(true);
    setMessage(null);

    const res = await subscribeNewsletterAction({ email });
    setLoading(false);

    if (res.ok && res.data) {
      setMessage(res.data.message);
      setEmail("");
    } else {
      setMessage(res.error || "Subscription failed. Please try again.");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-2 pt-1">
      <div className="flex border border-hairline bg-ivory">
        <Input
          type="email"
          required
          placeholder="Enter your email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          disabled={loading}
          className="border-none h-10 text-xs focus:ring-0"
        />
        <button
          type="submit"
          disabled={loading}
          className="px-4 text-xs font-sans uppercase tracking-[0.1em] bg-ink text-ivory hover:bg-gold transition-colors shrink-0 disabled:opacity-50 cursor-pointer"
        >
          {loading ? "..." : "Join"}
        </button>
      </div>
      {message && (
        <span className="text-[11px] text-stone font-sans mt-0.5 leading-tight">
          {message}
        </span>
      )}
    </form>
  );
}
