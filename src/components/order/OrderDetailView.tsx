"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { MessageSquare, UploadCloud, CheckCircle2 } from "lucide-react";
import { submitPaymentProofAction } from "@/server/actions/payment";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { formatDate, formatOrderStatus } from "@/lib/format";
import type { Order, PaymentMethod } from "@/types";

interface OrderDetailViewProps {
  order: Order;
  paymentMethod?: PaymentMethod;
  whatsappNumber: string;
  accessToken: string;
}

export function OrderDetailView({
  order,
  paymentMethod,
  whatsappNumber,
  accessToken,
}: OrderDetailViewProps) {
  const [proofUrl, setProofUrl] = useState("");
  const [proofNotes, setProofNotes] = useState("");
  const [submittingProof, setSubmittingProof] = useState(false);
  const [proofSuccess, setProofSuccess] = useState(
    order.payment_status === "proof_submitted",
  );
  const [proofError, setProofError] = useState<string | null>(null);

  const cleanWhatsApp = whatsappNumber.replace(/[^0-9]/g, "");
  const waMessage = encodeURIComponent(
    `Hello Zahra Luxe, I am inquiring about my Order #${order.order_number}.`,
  );
  const waLink = `https://wa.me/${cleanWhatsApp}?text=${waMessage}`;

  const handleProofSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!proofUrl) {
      setProofError("Please enter a receipt image link or transaction reference.");
      return;
    }

    setSubmittingProof(true);
    setProofError(null);

    const res = await submitPaymentProofAction({
      orderNumber: order.order_number,
      accessToken,
      fileUrl: proofUrl,
      notes: proofNotes || undefined,
    });

    setSubmittingProof(false);
    if (res.ok) {
      setProofSuccess(true);
    } else {
      setProofError(res.error || "Failed to submit payment proof.");
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header Banner */}
      <div className="bg-cream border border-stone-light/60 p-6 sm:p-8 flex flex-wrap justify-between items-start gap-4">
        <div>
          <span className="text-xs uppercase tracking-widest text-stone block mb-1">
            Order Confirmation
          </span>
          <h1 className="font-serif text-3xl sm:text-4xl text-ink font-normal">
            #{order.order_number}
          </h1>
          <p className="text-xs text-stone mt-1">
            Placed on {formatDate(order.created_at)}
          </p>
        </div>

        <div className="flex flex-col items-end gap-2">
          <Badge variant="default" className="text-xs py-1 px-3">
            Status: {formatOrderStatus(order.status)}
          </Badge>
          <span className="text-xs text-stone">
            Payment:{" "}
            <strong className="text-ink uppercase">{order.payment_status.replace(/_/g, " ")}</strong>
          </span>
        </div>
      </div>

      {/* WhatsApp Concierge Banner */}
      <div className="p-4 bg-emerald-50/60 border border-emerald-200/80 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <MessageSquare className="h-5 w-5 text-emerald-800 shrink-0" />
          <div>
            <p className="text-xs font-medium text-emerald-950">
              Personal WhatsApp Concierge Assistance
            </p>
            <p className="text-[11px] text-emerald-800">
              Need custom sizing adjustments or payment assistance? Connect with our Karachi atelier.
            </p>
          </div>
        </div>
        <a
          href={waLink}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 bg-emerald-800 text-white px-4 py-2 text-xs font-sans uppercase tracking-wider hover:bg-emerald-900 transition-colors"
        >
          Chat on WhatsApp
        </a>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
        {/* Left 8 Cols: Order items and timeline */}
        <div className="md:col-span-8 space-y-8">
          {/* Order Items */}
          <div className="bg-cream border border-stone-light/60 p-6 space-y-4">
            <h2 className="font-serif text-2xl text-ink border-b border-stone-light/40 pb-3">
              Ensemble Details
            </h2>
            <div className="divide-y divide-stone-light/40">
              {(order.items ?? []).map((item) => (
                <div key={item.id} className="py-4 first:pt-0 last:pb-0 flex gap-4">
                  <div className="relative w-16 h-24 bg-stone-light/20 shrink-0">
                    <Image
                      src={item.product_image_url}
                      alt={item.product_name}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-serif text-base text-ink">{item.product_name}</h3>
                    <p className="text-xs text-stone mt-1">
                      Size: <span className="text-ink font-medium">{item.size}</span>
                    </p>
                    <p className="text-xs text-stone">Quantity: {item.quantity}</p>
                    <p className="text-xs font-medium text-ink mt-2">
                      Rs. {(item.unit_price_pkr * item.quantity).toLocaleString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Payment Proof Upload (if method requires proof and not yet confirmed) */}
          {paymentMethod?.requires_proof && (
            <div className="bg-cream border border-stone-light/60 p-6 space-y-4">
              <div className="flex items-center gap-2">
                <UploadCloud className="h-5 w-5 text-ink" />
                <h2 className="font-serif text-2xl text-ink">Payment Verification</h2>
              </div>

              {proofSuccess ? (
                <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-700 shrink-0" />
                  <span>
                    Your proof of payment has been submitted and is currently being verified by our accounts desk.
                  </span>
                </div>
              ) : (
                <form onSubmit={handleProofSubmit} className="space-y-4">
                  <p className="text-xs text-stone leading-relaxed">
                    Please submit your wire transfer screenshot or transaction reference ID to accelerate atelier dispatch.
                  </p>

                  {proofError && (
                    <div className="p-3 bg-red-50 text-red-800 text-xs border border-red-200">
                      {proofError}
                    </div>
                  )}

                  <div>
                    <label className="block text-xs uppercase tracking-wider text-ink mb-1">
                      Payment Screenshot URL or Transaction ID
                    </label>
                    <input
                      type="text"
                      required
                      value={proofUrl}
                      onChange={(e) => setProofUrl(e.target.value)}
                      placeholder="e.g. TXN-9823482 or https://..."
                      className="w-full h-10 px-3 border border-stone-light bg-ivory text-sm text-ink focus:outline-hidden"
                    />
                  </div>

                  <div>
                    <label className="block text-xs uppercase tracking-wider text-ink mb-1">
                      Notes (Optional)
                    </label>
                    <input
                      type="text"
                      value={proofNotes}
                      onChange={(e) => setProofNotes(e.target.value)}
                      placeholder="e.g. Sent from Meezan Bank account of Muhammad Khan"
                      className="w-full h-10 px-3 border border-stone-light bg-ivory text-sm text-ink focus:outline-hidden"
                    />
                  </div>

                  <Button type="submit" disabled={submittingProof} size="sm">
                    {submittingProof ? "Submitting..." : "Submit Payment Verification"}
                  </Button>
                </form>
              )}
            </div>
          )}

          {/* Timeline / Events */}
          {(order.events ?? []).length > 0 && (
            <div className="bg-cream border border-stone-light/60 p-6 space-y-4">
              <h2 className="font-serif text-2xl text-ink border-b border-stone-light/40 pb-3">
                Order Timeline
              </h2>
              <div className="space-y-4">
                {order.events?.map((ev) => (
                  <div key={ev.id} className="flex items-start gap-4 text-xs">
                    <span className="w-2 h-2 rounded-full bg-ink mt-1.5 shrink-0" />
                    <div className="flex-1">
                      <p className="font-medium text-ink uppercase tracking-wider">
                        {formatOrderStatus(ev.status)}
                      </p>
                      {ev.note && <p className="text-stone mt-0.5">{ev.note}</p>}
                    </div>
                    <span className="text-stone text-[11px]">
                      {formatDate(ev.created_at)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right 4 Cols: Totals and Shipping Details */}
        <div className="md:col-span-4 space-y-6">
          {/* Financial Breakdown */}
          <div className="bg-cream border border-stone-light/60 p-6 space-y-3 text-xs">
            <h3 className="font-serif text-xl text-ink border-b border-stone-light/40 pb-2">
              Financial Summary
            </h3>
            <div className="flex justify-between text-stone">
              <span>Subtotal:</span>
              <span className="text-ink font-medium">Rs. {order.subtotal_pkr.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-stone">
              <span>Delivery Courier:</span>
              <span className="text-ink font-medium">
                {order.shipping_pkr === 0 ? "Complimentary" : `Rs. ${order.shipping_pkr.toLocaleString()}`}
              </span>
            </div>
            <div className="flex justify-between text-sm font-medium text-ink pt-2 border-t border-stone-light/40">
              <span>Total Value:</span>
              <span>Rs. {order.total_pkr.toLocaleString()}</span>
            </div>

            {order.payment_option === "deposit" && (
              <div className="mt-3 p-3 bg-amber-50/80 border border-amber-200/80 space-y-1 text-amber-950">
                <div className="flex justify-between font-semibold">
                  <span>Advance Deposit:</span>
                  <span>Rs. {order.deposit_amount_pkr.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-stone">
                  <span>Balance Due:</span>
                  <span>Rs. {order.balance_amount_pkr.toLocaleString()}</span>
                </div>
              </div>
            )}
          </div>

          {/* Delivery Address Details */}
          <div className="bg-cream border border-stone-light/60 p-6 space-y-2 text-xs">
            <h3 className="font-serif text-xl text-ink border-b border-stone-light/40 pb-2">
              Destination
            </h3>
            <p className="font-medium text-ink">{order.shipping_address.full_name}</p>
            <p className="text-stone">{order.shipping_address.line1}</p>
            {order.shipping_address.line2 && <p className="text-stone">{order.shipping_address.line2}</p>}
            <p className="text-stone">
              {order.shipping_address.city}, {order.shipping_address.state} {order.shipping_address.postal_code}
            </p>
            <p className="text-stone">{order.shipping_address.country_code}</p>
            <p className="text-stone mt-2">Phone: {order.shipping_address.phone}</p>
          </div>

          {/* Payment Method Instructions */}
          {paymentMethod && (
            <div className="bg-cream border border-stone-light/60 p-6 space-y-2 text-xs">
              <h3 className="font-serif text-xl text-ink border-b border-stone-light/40 pb-2">
                Payment Details
              </h3>
              <p className="font-medium text-ink">{paymentMethod.name}</p>
              <p className="text-stone whitespace-pre-line leading-relaxed mt-1">
                {paymentMethod.instructions}
              </p>
            </div>
          )}

          <div className="pt-2 text-center">
            <Link href="/shop" className="text-xs uppercase tracking-wider text-stone hover:text-ink underline">
              Return to Collection
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
