"use client";

import { useState } from "react";
import Link from "next/link";
import { Search, Package, Clock } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Badge } from "@/components/ui/Badge";
import { formatDate, formatOrderStatus } from "@/lib/format";
import type { Order } from "@/types";

export function TrackingView() {
  const [orderNumber, setOrderNumber] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [order, setOrder] = useState<Order | null>(null);

  const handleTrack = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setOrder(null);

    try {
      const res = await fetch("/api/track", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderNumber, email }),
      });
      const data = (await res.json()) as { ok: boolean; order?: Order; error?: string };

      if (data.ok && data.order) {
        setOrder(data.order);
      } else {
        setError(data.error ?? "No order found with the provided details.");
      }
    } catch {
      setError("An unexpected error occurred while searching for your order.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <div className="text-center">
        <h1 className="font-serif text-3xl md:text-4xl text-ink font-normal">
          Track Your Atelier Order
        </h1>
        <p className="text-xs uppercase tracking-widest text-stone mt-2">
          Monitor tailoring progress, embroidery milestones, and courier tracking
        </p>
      </div>

      <div className="bg-cream border border-stone-light/60 p-6 sm:p-8">
        <form onSubmit={handleTrack} className="space-y-4">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-800 text-xs">
              {error}
            </div>
          )}

          <div>
            <label className="block text-xs uppercase tracking-wider text-ink mb-1">
              Order Number
            </label>
            <Input
              type="text"
              required
              value={orderNumber}
              onChange={(e) => setOrderNumber(e.target.value)}
              placeholder="e.g. ZL-1234ABCD"
              className="w-full"
            />
          </div>

          <div>
            <label className="block text-xs uppercase tracking-wider text-ink mb-1">
              Patron Email Address
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

          <Button type="submit" disabled={loading} className="w-full py-3.5 mt-2">
            <Search className="h-4 w-4 mr-2" />
            {loading ? "Searching..." : "Track Order"}
          </Button>
        </form>
      </div>

      {order && (
        <div className="bg-cream border border-stone-light/60 p-6 sm:p-8 space-y-6">
          <div className="flex flex-wrap justify-between items-center border-b border-stone-light/40 pb-4 gap-4">
            <div>
              <span className="text-xs text-stone uppercase tracking-wider block">
                Found Order
              </span>
              <span className="font-serif text-2xl text-ink">#{order.order_number}</span>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="default" className="text-xs">
                {formatOrderStatus(order.status)}
              </Badge>
            </div>
          </div>

          {order.tracking_number && (
            <div className="p-4 bg-stone-light/30 border border-stone-light flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Package className="h-5 w-5 text-ink shrink-0" />
                <div>
                  <span className="text-[11px] uppercase tracking-wider text-stone block">
                    Courier Consignment Number
                  </span>
                  <span className="font-sans font-medium text-ink text-sm">
                    {order.tracking_number}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Timeline */}
          <div className="space-y-4 pt-2">
            <div className="flex items-center gap-2 text-ink">
              <Clock className="h-4 w-4" />
              <h3 className="font-serif text-xl">Milestone Timeline</h3>
            </div>

            <div className="space-y-3">
              {(order.events ?? []).map((ev) => (
                <div key={ev.id} className="flex items-start gap-4 text-xs border-l-2 border-stone-light pl-4 py-1">
                  <div className="flex-1">
                    <p className="font-medium text-ink uppercase tracking-wider">
                      {formatOrderStatus(ev.status)}
                    </p>
                    {ev.note && <p className="text-stone mt-0.5">{ev.note}</p>}
                  </div>
                  <span className="text-stone text-[11px] whitespace-nowrap">
                    {formatDate(ev.created_at)}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-4 border-t border-stone-light/40 text-center">
            <Link
              href={`/order/${order.order_number}?t=${order.access_token}`}
              className="text-xs font-sans uppercase tracking-widest text-ink hover:text-gold underline font-medium"
            >
              View Complete Invoice & Ensemble Breakdown →
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
