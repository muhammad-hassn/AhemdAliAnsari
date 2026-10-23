"use client";

import { useState, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  MessageSquare,
  UploadCloud,
  CheckCircle2,
  AlertCircle,
  FileText,
  Clock,
  Eye,
  X,
  FileCheck,
} from "lucide-react";
import { getReceiptSignedUrlAction } from "@/server/actions/payment";
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
  const [file, setFile] = useState<File | null>(null);
  const [filePreview, setFilePreview] = useState<string | null>(null);
  const [txnRef, setTxnRef] = useState("");
  const [proofNotes, setProofNotes] = useState("");
  const [submittingProof, setSubmittingProof] = useState(false);
  const [proofSuccess, setProofSuccess] = useState(
    order.payment_status === "proof_submitted",
  );
  const [proofError, setProofError] = useState<string | null>(null);
  const [loadingReceipt, setLoadingReceipt] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const cleanWhatsApp = whatsappNumber.replace(/[^0-9]/g, "");
  const waMessage = encodeURIComponent(
    `Hello Ahmed Ali Ansari, I am inquiring about my Order #${order.order_number}.`,
  );
  const waLink = `https://wa.me/${cleanWhatsApp}?text=${waMessage}`;

  // Find rejected proof if any
  const latestProof = order.proofs && order.proofs.length > 0 ? order.proofs[order.proofs.length - 1] : null;
  const rejectedProof = order.proofs?.slice().reverse().find((p) => p.status === "rejected");

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (!selected) return;

    const allowedTypes = ["image/jpeg", "image/png", "image/webp", "application/pdf"];
    if (!allowedTypes.includes(selected.type.toLowerCase())) {
      setProofError("Please select a valid image (JPG, PNG, WebP) or PDF document.");
      return;
    }

    if (selected.size > 5 * 1024 * 1024) {
      setProofError("File size exceeds 5MB limit. Please upload a smaller file.");
      return;
    }

    setProofError(null);
    setFile(selected);

    if (selected.type.startsWith("image/")) {
      const url = URL.createObjectURL(selected);
      setFilePreview(url);
    } else {
      setFilePreview(null);
    }
  };

  const handleRemoveFile = () => {
    setFile(null);
    if (filePreview) {
      URL.revokeObjectURL(filePreview);
      setFilePreview(null);
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleProofSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!file && !txnRef.trim()) {
      setProofError("Please upload your transfer receipt file or provide a transaction reference ID.");
      return;
    }

    setSubmittingProof(true);
    setProofError(null);

    try {
      const formData = new FormData();
      if (file) {
        formData.append("file", file);
      }
      formData.append("orderNumber", order.order_number);
      formData.append("accessToken", accessToken);
      if (txnRef.trim()) {
        formData.append("transactionReference", txnRef.trim());
      }
      if (proofNotes.trim()) {
        formData.append("notes", proofNotes.trim());
      }

      const res = await fetch("/api/payment/upload-receipt", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (res.ok && data.success) {
        setProofSuccess(true);
        handleRemoveFile();
      } else {
        setProofError(data.error || "Failed to submit payment verification. Please try again.");
      }
    } catch {
      setProofError("Network error occurred while uploading receipt. Please try again.");
    } finally {
      setSubmittingProof(false);
    }
  };

  const handleViewReceipt = async (proofId?: string) => {
    if (!proofId) return;
    setLoadingReceipt(true);
    try {
      const res = await getReceiptSignedUrlAction({
        proofId,
        orderNumber: order.order_number,
        accessToken,
      });

      if (res.ok && res.data?.signedUrl) {
        window.open(res.data.signedUrl, "_blank", "noopener,noreferrer");
      } else {
        alert(res.error || "Unable to load receipt file.");
      }
    } catch {
      alert("Failed to load secure receipt preview.");
    } finally {
      setLoadingReceipt(false);
    }
  };

  const isBankTransfer = order.payment_method_id === "bank_transfer";
  const isDeposit = order.payment_option === "deposit";

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
              Need assistance with your bank transfer or order customisation? Connect directly with our atelier.
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
        {/* Left 8 Cols: Order items, payment verification, and timeline */}
        <div className="md:col-span-8 space-y-8">
          {/* Payment Status Alert Banners */}
          {order.payment_status === "paid" && (
            <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs flex items-center gap-3">
              <CheckCircle2 className="h-5 w-5 text-emerald-700 shrink-0" />
              <div>
                <p className="font-medium text-emerald-950">Payment Confirmed & Settled in Full</p>
                <p className="text-emerald-800 mt-0.5">
                  Your payment has been successfully verified. Your ensemble is now being prepared for delivery.
                </p>
              </div>
            </div>
          )}

          {order.payment_status === "deposit_received" && (
            <div className="p-4 bg-amber-50 border border-amber-200 text-amber-950 text-xs flex items-center gap-3">
              <FileCheck className="h-5 w-5 text-amber-700 shrink-0" />
              <div>
                <p className="font-medium text-amber-950">
                  50% Advance Payment Verified (Rs. {order.deposit_amount_pkr.toLocaleString()})
                </p>
                <p className="text-amber-800 mt-0.5">
                  Your advance deposit has been confirmed by our accounts desk. The remaining balance of{" "}
                  <strong>Rs. {order.balance_amount_pkr.toLocaleString()}</strong> will be collected in cash upon physical delivery (Cash on Delivery).
                </p>
              </div>
            </div>
          )}

          {/* Payment Verification / Proof Upload Section */}
          {(isBankTransfer || paymentMethod?.requires_proof) && order.payment_status !== "paid" && order.payment_status !== "deposit_received" && (
            <div className="bg-cream border border-stone-light/60 p-6 space-y-5">
              <div className="flex items-center justify-between border-b border-stone-light/40 pb-3">
                <div className="flex items-center gap-2">
                  <UploadCloud className="h-5 w-5 text-ink" />
                  <h2 className="font-serif text-2xl text-ink">Payment Verification</h2>
                </div>
                {isDeposit ? (
                  <span className="text-[11px] font-sans px-2.5 py-0.5 bg-amber-100 text-amber-900 border border-amber-200">
                    50% Advance Transfer
                  </span>
                ) : (
                  <span className="text-[11px] font-sans px-2.5 py-0.5 bg-emerald-100 text-emerald-900 border border-emerald-200">
                    Full Payment Transfer
                  </span>
                )}
              </div>

              {/* Amount due highlight */}
              <div className="p-3 bg-stone-light/20 border border-stone-light/60 flex items-center justify-between text-xs">
                <span className="text-stone font-sans">
                  {isDeposit ? "50% Advance Amount Due via Bank:" : "Total Amount Due via Bank:"}
                </span>
                <span className="font-mono font-medium text-ink text-sm">
                  Rs. {(isDeposit ? order.deposit_amount_pkr : order.total_pkr).toLocaleString()}
                </span>
              </div>

              {/* Rejection notice if previously rejected */}
              {rejectedProof && order.payment_status === "pending" && (
                <div className="p-3.5 bg-red-50 border border-red-200 text-red-900 text-xs space-y-1">
                  <div className="flex items-center gap-2 font-medium">
                    <AlertCircle className="w-4 h-4 text-red-700 shrink-0" />
                    <span>Previous Payment Verification Declined</span>
                  </div>
                  <p className="text-red-800 pl-6">
                    <strong>Reason:</strong> {rejectedProof.rejection_reason || "Transaction could not be verified in our bank account."}
                  </p>
                  <p className="text-[11px] text-red-700 pl-6">
                    Please double-check the transfer to our bank account and submit your updated receipt or correct transaction ID below.
                  </p>
                </div>
              )}

              {/* Verification awaiting review banner */}
              {proofSuccess && order.payment_status === "proof_submitted" ? (
                <div className="space-y-4">
                  <div className="p-4 bg-sky-50 border border-sky-200 text-sky-950 text-xs flex items-start gap-3">
                    <Clock className="h-5 w-5 text-sky-700 shrink-0 mt-0.5" />
                    <div className="space-y-1">
                      <p className="font-medium text-sky-950">
                        Payment Receipt Submitted — Awaiting Verification
                      </p>
                      <p className="text-sky-800 leading-relaxed">
                        Your payment receipt and details have been submitted and are currently being verified by our accounts desk.
                        Our team will verify the bank transaction and update your order status.
                      </p>
                      {latestProof?.transaction_reference && (
                        <p className="text-[11px] font-mono text-sky-900 pt-1">
                          Transaction Reference: {latestProof.transaction_reference}
                        </p>
                      )}
                    </div>
                  </div>

                  {latestProof && (
                    <div className="flex items-center justify-between p-3 border border-stone-light/60 bg-white text-xs">
                      <span className="text-stone">Submitted on {formatDate(latestProof.created_at)}</span>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => handleViewReceipt(latestProof.id)}
                        disabled={loadingReceipt}
                        className="text-xs h-8"
                      >
                        <Eye className="w-3.5 h-3.5 mr-1.5" />
                        {loadingReceipt ? "Loading..." : "View Submitted Receipt"}
                      </Button>
                    </div>
                  )}
                </div>
              ) : (
                <form onSubmit={handleProofSubmit} className="space-y-4">
                  <p className="text-xs text-stone leading-relaxed">
                    Please transfer the required amount to our official bank account (details on the right) and upload your wire transfer receipt or screenshot, along with your transaction reference.
                  </p>

                  {proofError && (
                    <div className="p-3 bg-red-50 text-red-800 text-xs border border-red-200 flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
                      <span>{proofError}</span>
                    </div>
                  )}

                  {/* Receipt File Picker */}
                  <div>
                    <label className="block text-xs uppercase tracking-wider text-ink mb-1.5 font-medium">
                      Payment Receipt File (Screenshot / PDF) *
                    </label>

                    {!file ? (
                      <div
                        onClick={() => fileInputRef.current?.click()}
                        className="border-2 border-dashed border-stone-300 hover:border-ink bg-white/60 hover:bg-white p-6 text-center cursor-pointer transition-colors"
                      >
                        <UploadCloud className="w-8 h-8 text-stone-400 mx-auto mb-2" />
                        <p className="text-xs font-medium text-ink">
                          Click to select or drag & drop receipt file
                        </p>
                        <p className="text-[11px] text-stone mt-1">
                          PNG, JPG, WebP image or PDF (Max 5MB)
                        </p>
                        <input
                          ref={fileInputRef}
                          type="file"
                          accept="image/jpeg,image/png,image/webp,application/pdf"
                          onChange={handleFileChange}
                          className="hidden"
                        />
                      </div>
                    ) : (
                      <div className="p-3 border border-stone-light bg-white flex items-center justify-between">
                        <div className="flex items-center gap-3 min-w-0">
                          {filePreview ? (
                            <div className="relative w-12 h-12 border border-stone-200 shrink-0 overflow-hidden bg-stone-50">
                              <Image
                                src={filePreview}
                                alt="Receipt Preview"
                                fill
                                className="object-cover"
                              />
                            </div>
                          ) : (
                            <FileText className="w-8 h-8 text-amber-700 shrink-0" />
                          )}
                          <div className="min-w-0">
                            <p className="text-xs font-medium text-ink truncate">{file.name}</p>
                            <p className="text-[11px] text-stone font-mono">
                              {(file.size / 1024).toFixed(0)} KB
                            </p>
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={handleRemoveFile}
                          className="p-1.5 text-stone hover:text-red-700 transition-colors"
                          title="Remove file"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Transaction Reference Input */}
                  <div>
                    <label className="block text-xs uppercase tracking-wider text-ink mb-1 font-medium">
                      Bank Transaction ID / Reference Number
                    </label>
                    <input
                      type="text"
                      value={txnRef}
                      onChange={(e) => setTxnRef(e.target.value)}
                      placeholder="e.g. TRX-9823482 or FT-20261024-001"
                      className="w-full h-10 px-3 border border-stone-light bg-ivory text-sm text-ink focus:outline-hidden font-mono"
                    />
                  </div>

                  {/* Optional Notes */}
                  <div>
                    <label className="block text-xs uppercase tracking-wider text-ink mb-1">
                      Patron Notes (Optional)
                    </label>
                    <input
                      type="text"
                      value={proofNotes}
                      onChange={(e) => setProofNotes(e.target.value)}
                      placeholder="e.g. Transferred from Meezan Bank account of Muhammad Ali"
                      className="w-full h-10 px-3 border border-stone-light bg-ivory text-sm text-ink focus:outline-hidden"
                    />
                  </div>

                  <Button
                    type="submit"
                    disabled={submittingProof || (!file && !txnRef.trim())}
                    className="w-full py-3 text-xs uppercase tracking-widest font-medium"
                  >
                    {submittingProof ? "Uploading & Submitting..." : "Submit Payment Verification"}
                  </Button>
                </form>
              )}
            </div>
          )}

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

        {/* Right 4 Cols: Totals, Bank Details, and Shipping Address */}
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

            {isDeposit && (
              <div className="mt-3 p-3 bg-amber-50/80 border border-amber-200/80 space-y-1.5 text-amber-950">
                <div className="flex justify-between font-semibold border-b border-amber-200/60 pb-1">
                  <span>50% Advance (Payable via Bank):</span>
                  <span>Rs. {order.deposit_amount_pkr.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-stone-700">
                  <span>Remaining 50% Balance (COD):</span>
                  <span>Rs. {order.balance_amount_pkr.toLocaleString()}</span>
                </div>
              </div>
            )}
          </div>

          {/* Configured Bank Transfer Instructions Card */}
          {paymentMethod && (
            <div className="bg-cream border border-stone-light/60 p-6 space-y-3 text-xs">
              <h3 className="font-serif text-xl text-ink border-b border-stone-light/40 pb-2">
                Bank Transfer Instructions
              </h3>
              <p className="font-medium text-ink text-sm">{paymentMethod.name}</p>
              <div className="p-3 bg-white border border-stone-light text-stone-800 whitespace-pre-line leading-relaxed font-sans text-xs">
                {paymentMethod.instructions}
              </div>
            </div>
          )}

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
            <p className="text-stone uppercase tracking-wide">{order.shipping_address.country_code}</p>
            <p className="text-stone mt-2">Phone: {order.shipping_address.phone}</p>
          </div>

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
