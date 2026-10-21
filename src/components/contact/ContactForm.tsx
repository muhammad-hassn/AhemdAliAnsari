"use client";

import { useState } from "react";
import { submitContactMessageAction } from "@/server/actions/contact";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

export function ContactForm() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [message, setMessage] = useState("");
  const [honeypot, setHoneypot] = useState("");
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setStatus(null);

    const res = await submitContactMessageAction({
      name,
      email,
      phone: phone || undefined,
      message,
      honeypot: honeypot || undefined,
    });

    setLoading(false);
    if (res.ok) {
      setStatus({
        type: "success",
        text: "Thank you for reaching out. A bespoke styling concierge will respond to your inquiry within 24 hours.",
      });
      setName("");
      setEmail("");
      setPhone("");
      setMessage("");
    } else {
      setStatus({
        type: "error",
        text: res.error || "Failed to send message.",
      });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {status && (
        <div
          className={`p-4 text-xs border ${
            status.type === "success"
              ? "bg-emerald-50 text-emerald-900 border-emerald-200"
              : "bg-red-50 text-red-900 border-red-200"
          }`}
        >
          {status.text}
        </div>
      )}

      {/* Honeypot field for bot spam prevention */}
      <div className="hidden" aria-hidden="true">
        <label htmlFor="website">Website</label>
        <input
          id="website"
          type="text"
          name="website"
          tabIndex={-1}
          autoComplete="off"
          value={honeypot}
          onChange={(e) => setHoneypot(e.target.value)}
        />
      </div>

      <div>
        <label className="block text-xs uppercase tracking-wider text-ink mb-1 font-medium">
          Full Name
        </label>
        <Input
          type="text"
          required
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Ayesha Khan"
          className="w-full"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs uppercase tracking-wider text-ink mb-1 font-medium">
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
        <div>
          <label className="block text-xs uppercase tracking-wider text-ink mb-1 font-medium">
            Phone Number (Optional)
          </label>
          <Input
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="+92 300 1234567"
            className="w-full"
          />
        </div>
      </div>

      <div>
        <label className="block text-xs uppercase tracking-wider text-ink mb-1 font-medium">
          Message & Tailoring Inquiry
        </label>
        <textarea
          required
          rows={5}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Please share details of your event date, required ensemble, or custom inquiries..."
          className="w-full p-3 border border-stone-light bg-ivory text-sm text-ink focus:outline-hidden leading-relaxed"
        />
      </div>

      <Button type="submit" disabled={loading} className="w-full py-4 uppercase tracking-[0.15em] text-xs font-medium">
        {loading ? "Transmitting..." : "Send Concierge Message"}
      </Button>
    </form>
  );
}
