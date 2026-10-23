"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { FormSection } from "@/components/admin/FormSection";
import { ConfirmDialog } from "@/components/admin/ConfirmDialog";
import {
  updateOrderStatusAction,
  updateOrderTrackingAction,
  updateOrderNotesAction,
  approvePaymentProofAction,
  rejectPaymentProofAction,
  markCodCollectedAction,
} from "@/server/actions/admin";
import { getReceiptSignedUrlAction } from "@/server/actions/payment";
import { formatPkr, formatDate, formatOrderStatus } from "@/lib/format";
import {
  Package,
  Truck,
  CheckCircle2,
  X,
  Edit2,
  Eye,
  AlertCircle,
  Banknote,
  ShieldCheck,
} from "lucide-react";
import type { Order, OrderStatus } from "@/types";

const ORDER_STATUS_TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
  pending: ["confirmed", "cancelled"],
  confirmed: ["shipped", "cancelled"],
  shipped: ["delivered", "cancelled"],
  delivered: [],
  cancelled: [],
};

interface AdminOrderDetailProps {
  order: Order;
}

export function AdminOrderDetail({ order }: AdminOrderDetailProps) {
  const router = useRouter();

  const [confirmStatus, setConfirmStatus] = useState<OrderStatus | null>(null);
  const [trackingInput, setTrackingInput] = useState(order.tracking_number || "");
  const [notesInput, setNotesInput] = useState(order.notes || "");
  const [savingTracking, setSavingTracking] = useState(false);
  const [savingNotes, setSavingNotes] = useState(false);

  // Payment management states
  const [approvingProofId, setApprovingProofId] = useState<string | null>(null);
  const [rejectModalProofId, setRejectModalProofId] = useState<string | null>(null);
  const [rejectionReason, setRejectionReason] = useState("");
  const [rejectingProof, setRejectingProof] = useState(false);
  const [collectingCod, setCollectingCod] = useState(false);
  const [confirmCollectCod, setConfirmCollectCod] = useState(false);
  const [loadingReceiptId, setLoadingReceiptId] = useState<string | null>(null);

  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const nextStatuses = ORDER_STATUS_TRANSITIONS[order.status] || [];

  const showMsg = (msg: string, isError = false) => {
    if (isError) setErrorMsg(msg);
    else setSuccessMsg(msg);
    setTimeout(() => {
      setSuccessMsg(null);
      setErrorMsg(null);
    }, 4000);
  };

  const handleStatusChange = async () => {
    if (!confirmStatus) return;
    const res = await updateOrderStatusAction(order.id, confirmStatus);
    if (!res.success) showMsg(res.error || "Failed to update status", true);
    else {
      showMsg(`Order moved to ${formatOrderStatus(confirmStatus)}`);
      router.refresh();
    }
    setConfirmStatus(null);
  };

  const handleSaveTracking = async () => {
    setSavingTracking(true);
    const res = await updateOrderTrackingAction(order.id, trackingInput);
    setSavingTracking(false);
    if (!res.success) showMsg(res.error || "Failed to save tracking", true);
    else {
      showMsg("Tracking number saved");
      router.refresh();
    }
  };

  const handleSaveNotes = async () => {
    setSavingNotes(true);
    const res = await updateOrderNotesAction(order.id, notesInput);
    setSavingNotes(false);
    if (!res.success) showMsg(res.error || "Failed to save notes", true);
    else {
      showMsg("Notes saved");
      router.refresh();
    }
  };

  // Payment Verification Handler
  const handleApprovePayment = async (proofId?: string) => {
    setApprovingProofId(proofId || "direct");
    const res = await approvePaymentProofAction(order.id, proofId);
    setApprovingProofId(null);

    if (!res.success) {
      showMsg(res.error || "Failed to approve payment verification.", true);
    } else {
      showMsg("Payment transaction successfully verified & recorded!");
      router.refresh();
    }
  };

  // Payment Rejection Handler
  const handleRejectPayment = async () => {
    if (!rejectModalProofId) return;
    if (!rejectionReason.trim()) {
      showMsg("Please provide a rejection reason for the client.", true);
      return;
    }

    setRejectingProof(true);
    const res = await rejectPaymentProofAction(order.id, rejectModalProofId, rejectionReason.trim());
    setRejectingProof(false);

    if (!res.success) {
      showMsg(res.error || "Failed to reject payment proof.", true);
    } else {
      showMsg("Payment proof rejected. Order payment status set to pending for re-submission.");
      setRejectModalProofId(null);
      setRejectionReason("");
      router.refresh();
    }
  };

  // Mark COD Balance as Collected Handler
  const handleMarkCodCollected = async () => {
    setCollectingCod(true);
    const res = await markCodCollectedAction(order.id);
    setCollectingCod(false);
    setConfirmCollectCod(false);

    if (!res.success) {
      showMsg(res.error || "Failed to record COD collection.", true);
    } else {
      showMsg("Cash on Delivery balance successfully recorded as collected. Order is now fully PAID!");
      router.refresh();
    }
  };

  // Secure Receipt Viewer (Generates short-lived signed URL)
  const handleViewReceipt = async (proofId: string) => {
    setLoadingReceiptId(proofId);
    try {
      const res = await getReceiptSignedUrlAction({ proofId });
      if (res.ok && res.data?.signedUrl) {
        window.open(res.data.signedUrl, "_blank", "noopener,noreferrer");
      } else {
        showMsg(res.error || "Unable to access receipt file.", true);
      }
    } catch {
      showMsg("Failed to generate secure receipt viewing URL.", true);
    } finally {
      setLoadingReceiptId(null);
    }
  };

  const isDeposit = order.payment_option === "deposit";
  const verifiedAmount =
    order.amount_paid_pkr ??
    (order.payment_status === "paid"
      ? order.total_pkr
      : order.payment_status === "deposit_received"
        ? order.deposit_amount_pkr
        : 0);

  const proofs = order.proofs || [];

  return (
    <div className="space-y-8 max-w-4xl">
      {/* Flash messages */}
      {successMsg && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-sans flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}
      {errorMsg && (
        <div className="p-3 bg-red-50 border border-red-200 text-red-800 text-xs font-sans flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Order Header */}
      <div className="flex flex-wrap items-start justify-between gap-4 border-b border-stone-200 pb-6">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <h1 className="font-serif text-2xl font-normal text-stone-900">
              Order {order.order_number}
            </h1>
            <StatusBadge status={order.status} />
            <StatusBadge status={order.payment_status} />
          </div>
          <p className="text-xs text-stone-500 font-sans">
            Placed on {formatDate(order.created_at)}
          </p>
        </div>

        {/* Status Workflow Actions */}
        {nextStatuses.length > 0 && (
          <div className="flex flex-wrap items-center gap-2">
            {nextStatuses.map((next) => (
              <Button
                key={next}
                type="button"
                variant={next === "cancelled" ? "outline" : "solid"}
                size="sm"
                onClick={() => setConfirmStatus(next)}
                className={next === "cancelled" ? "border-red-300 text-red-700 hover:bg-red-50" : ""}
              >
                {next === "confirmed" && <CheckCircle2 className="w-3.5 h-3.5 mr-1.5" />}
                {next === "shipped" && <Truck className="w-3.5 h-3.5 mr-1.5" />}
                {next === "delivered" && <Package className="w-3.5 h-3.5 mr-1.5" />}
                {next === "cancelled" && <X className="w-3.5 h-3.5 mr-1.5" />}
                Mark {formatOrderStatus(next)}
              </Button>
            ))}
          </div>
        )}
      </div>

      {/* 2-col grid: Customer Information + Comprehensive Financial Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <FormSection title="Customer Information">
          <div className="space-y-2 text-xs font-sans text-stone-800">
            <p>
              <strong>Name:</strong> {order.shipping_address?.full_name || order.guest_email || "Registered Client"}
            </p>
            {order.guest_email && <p><strong>Email:</strong> {order.guest_email}</p>}
            {order.guest_phone && <p><strong>Phone:</strong> {order.guest_phone}</p>}
            <p>
              <strong>Payment Option:</strong>{" "}
              {isDeposit ? "50% Advance Bank Transfer + 50% COD" : "Full Payment (100%)"}
            </p>
            <p>
              <strong>Payment Method:</strong>{" "}
              <span className="font-mono uppercase text-stone-700">
                {order.payment_method_id.replace(/_/g, " ")}
              </span>
            </p>
          </div>
        </FormSection>

        <FormSection title="Financial & Payment Summary">
          <div className="space-y-2 text-xs font-sans text-stone-800">
            <div className="flex justify-between">
              <span className="text-stone-500">Subtotal</span>
              <span>{formatPkr(order.subtotal_pkr)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-stone-500">Shipping</span>
              <span>{formatPkr(order.shipping_pkr)}</span>
            </div>
            <div className="flex justify-between font-medium text-stone-900 border-t border-stone-100 pt-1.5">
              <span>Total Value</span>
              <span>{formatPkr(order.total_pkr)}</span>
            </div>

            {isDeposit && (
              <div className="bg-amber-50/70 p-2 border border-amber-200/70 space-y-1 my-1">
                <div className="flex justify-between text-amber-950 font-medium">
                  <span>50% Advance Required:</span>
                  <span>{formatPkr(order.deposit_amount_pkr)}</span>
                </div>
                <div className="flex justify-between text-stone-600">
                  <span>Remaining COD Balance:</span>
                  <span>{formatPkr(order.balance_amount_pkr)}</span>
                </div>
              </div>
            )}

            <div className="flex justify-between text-emerald-700 font-medium pt-1">
              <span>Verified Amount Paid:</span>
              <span>{formatPkr(verifiedAmount)}</span>
            </div>

            <div className="flex justify-between text-stone-700 font-medium">
              <span>Outstanding COD Balance:</span>
              <span className={order.balance_amount_pkr > 0 ? "text-amber-800 font-bold" : "text-stone-500"}>
                {formatPkr(order.balance_amount_pkr)}
              </span>
            </div>

            <div className="flex justify-between pt-1 border-t border-stone-100">
              <span className="text-stone-500">Payment Status</span>
              <StatusBadge status={order.payment_status} />
            </div>
          </div>
        </FormSection>
      </div>

      {/* Manual Payment Verification Desk (For Bank Transfers & Payment Proofs) */}
      <FormSection
        title="Manual Payment Verification Desk"
        description="Verify bank transfers, review uploaded receipts, and record Cash on Delivery collections."
      >
        <div className="space-y-4">
          {/* Proof Submissions List */}
          {proofs.length > 0 ? (
            <div className="space-y-3">
              <span className="text-xs uppercase tracking-wider text-stone-500 font-medium block">
                Submitted Verification Records ({proofs.length})
              </span>

              {proofs.map((proof, idx) => (
                <div
                  key={proof.id || idx}
                  className="p-4 border border-stone-200 bg-stone-50/50 space-y-3 text-xs font-sans"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2 border-b border-stone-200 pb-2">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-stone-900">Submission #{idx + 1}</span>
                      <StatusBadge status={proof.status} />
                    </div>
                    <span className="text-stone-400 font-mono text-[11px]">
                      {formatDate(proof.created_at || proof.uploaded_at || "")}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-stone-800">
                    <div>
                      <span className="text-stone-500 block text-[11px]">Transaction Reference:</span>
                      <span className="font-mono font-medium text-sm text-stone-900">
                        {proof.transaction_reference || "None submitted"}
                      </span>
                    </div>
                    {proof.notes && (
                      <div>
                        <span className="text-stone-500 block text-[11px]">Client Notes:</span>
                        <span className="text-stone-700">{proof.notes}</span>
                      </div>
                    )}
                  </div>

                  {proof.status === "rejected" && (
                    <div className="p-2 bg-red-50 border border-red-200 text-red-800 text-[11px] rounded-none">
                      <strong>Rejection Reason:</strong> {proof.rejection_reason || "Unspecified"}
                      {proof.reviewed_at && (
                        <span className="block text-stone-400 text-[10px] mt-0.5">
                          Reviewed on {formatDate(proof.reviewed_at)}
                        </span>
                      )}
                    </div>
                  )}

                  {/* Actions for this proof */}
                  <div className="flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-stone-200/60">
                    <div>
                      {proof.storage_path || proof.file_url ? (
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => handleViewReceipt(proof.id)}
                          disabled={loadingReceiptId === proof.id}
                          className="h-8 text-xs"
                        >
                          <Eye className="w-3.5 h-3.5 mr-1.5" />
                          {loadingReceiptId === proof.id ? "Opening..." : "View Receipt File"}
                        </Button>
                      ) : (
                        <span className="text-[11px] text-stone-400 italic">No receipt file attached</span>
                      )}
                    </div>

                    {proof.status === "pending" && (
                      <div className="flex items-center gap-2">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setRejectModalProofId(proof.id);
                            setRejectionReason("");
                          }}
                          className="h-8 text-xs border-red-300 text-red-700 hover:bg-red-50"
                        >
                          <X className="w-3.5 h-3.5 mr-1" />
                          Reject Submission
                        </Button>

                        <Button
                          type="button"
                          variant="solid"
                          size="sm"
                          onClick={() => handleApprovePayment(proof.id)}
                          disabled={approvingProofId === proof.id}
                          className="h-8 text-xs bg-emerald-800 hover:bg-emerald-900 text-white"
                        >
                          <ShieldCheck className="w-3.5 h-3.5 mr-1.5" />
                          {approvingProofId === proof.id
                            ? "Verifying..."
                            : isDeposit
                              ? `Approve 50% Advance (${formatPkr(order.deposit_amount_pkr)})`
                              : `Approve Full Payment (${formatPkr(order.total_pkr)})`}
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-4 border border-stone-200 bg-stone-50 text-xs text-stone-600 space-y-3">
              <p>
                No payment receipts have been uploaded yet for this order. If the client has transferred funds directly to your bank account and you have independently confirmed it in your bank statement, you can verify payment directly below:
              </p>

              {order.payment_status === "pending" && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => handleApprovePayment()}
                  disabled={approvingProofId === "direct"}
                  className="text-xs bg-white text-emerald-800 border-emerald-300 hover:bg-emerald-50"
                >
                  <CheckCircle2 className="w-3.5 h-3.5 mr-1.5 text-emerald-600" />
                  {approvingProofId === "direct"
                    ? "Verifying..."
                    : isDeposit
                      ? `Approve 50% Advance Directly (${formatPkr(order.deposit_amount_pkr)})`
                      : `Approve Full Payment Directly (${formatPkr(order.total_pkr)})`}
                </Button>
              )}
            </div>
          )}

          {/* Outstanding COD Collection Action */}
          {order.balance_amount_pkr > 0 && order.payment_status !== "paid" && (
            <div className="p-4 border border-amber-300 bg-amber-50/70 space-y-2.5 mt-4">
              <div className="flex items-center gap-2">
                <Banknote className="w-4 h-4 text-amber-800 shrink-0" />
                <span className="font-medium text-xs text-amber-950 uppercase tracking-wide">
                  Outstanding Cash on Delivery Collection
                </span>
              </div>
              <p className="text-xs text-amber-900 leading-relaxed">
                A Cash on Delivery balance of <strong>{formatPkr(order.balance_amount_pkr)}</strong> is due upon courier delivery.
                Once the courier delivers the package and physical cash has actually been collected, click below to mark the order as fully settled.
              </p>
              <div className="pt-1">
                <Button
                  type="button"
                  size="sm"
                  variant="solid"
                  onClick={() => setConfirmCollectCod(true)}
                  disabled={collectingCod}
                  className="bg-amber-900 hover:bg-amber-950 text-white text-xs h-8"
                >
                  <CheckCircle2 className="w-3.5 h-3.5 mr-1.5" />
                  Mark COD Balance Collected ({formatPkr(order.balance_amount_pkr)})
                </Button>
              </div>
            </div>
          )}
        </div>
      </FormSection>

      {/* Shipping Address */}
      {order.shipping_address && (
        <FormSection title="Shipping Address">
          <div className="text-xs font-sans text-stone-800 space-y-1">
            <p className="font-medium">{order.shipping_address.full_name}</p>
            <p>{order.shipping_address.line1}</p>
            {order.shipping_address.line2 && <p>{order.shipping_address.line2}</p>}
            <p>
              {order.shipping_address.city}, {order.shipping_address.state}{" "}
              {order.shipping_address.postal_code}
            </p>
            <p className="uppercase tracking-wide text-stone-500">{order.shipping_address.country_code}</p>
          </div>
        </FormSection>
      )}

      {/* Order Items */}
      {order.items && order.items.length > 0 && (
        <FormSection title="Ordered Items">
          <table className="w-full text-xs font-sans">
            <thead className="bg-stone-50 text-stone-500 uppercase tracking-wider">
              <tr>
                <th className="p-2.5 text-left">Garment</th>
                <th className="p-2.5 text-center">Size</th>
                <th className="p-2.5 text-center">Qty</th>
                <th className="p-2.5 text-right">Unit Price</th>
                <th className="p-2.5 text-right">Subtotal</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100 text-stone-800">
              {order.items.map((item) => (
                <tr key={item.id}>
                  <td className="p-2.5 font-medium">{item.product_name}</td>
                  <td className="p-2.5 text-center font-mono">{item.size}</td>
                  <td className="p-2.5 text-center">{item.quantity}</td>
                  <td className="p-2.5 text-right font-mono">{formatPkr(item.unit_price_pkr)}</td>
                  <td className="p-2.5 text-right font-mono font-medium">
                    {formatPkr(item.unit_price_pkr * item.quantity)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </FormSection>
      )}

      {/* Tracking Number */}
      <FormSection
        title="Shipment Tracking"
        description="Enter the courier tracking number to be shared with the client."
      >
        <div className="flex items-center gap-3">
          <Input
            value={trackingInput}
            onChange={(e) => setTrackingInput(e.target.value)}
            placeholder="e.g. TCS-1234567890"
            className="flex-1"
          />
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleSaveTracking}
            disabled={savingTracking}
          >
            <Edit2 className="w-3.5 h-3.5 mr-1.5" />
            {savingTracking ? "Saving..." : "Save"}
          </Button>
        </div>
      </FormSection>

      {/* Internal Notes */}
      <FormSection
        title="Internal Notes"
        description="Private admin notes — not visible to the client."
      >
        <textarea
          value={notesInput}
          onChange={(e) => setNotesInput(e.target.value)}
          rows={3}
          className="w-full p-3 border border-stone-300 bg-white text-sm text-stone-900 font-sans focus:outline-none focus:border-stone-900"
          placeholder="Add internal notes for this order..."
        />
        <div className="flex justify-end mt-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleSaveNotes}
            disabled={savingNotes}
          >
            {savingNotes ? "Saving..." : "Save Notes"}
          </Button>
        </div>
      </FormSection>

      {/* Order Events Timeline */}
      {order.events && order.events.length > 0 && (
        <FormSection title="Order Timeline & Audit History">
          <div className="space-y-3">
            {order.events.map((event) => (
              <div key={event.id} className="flex items-start gap-3 text-xs font-sans">
                <div className="w-1.5 h-1.5 rounded-full bg-amber-600 mt-1.5 shrink-0" />
                <div>
                  <span className="font-medium text-stone-900">
                    {formatOrderStatus(event.status)}
                  </span>
                  {(event.note || (event as unknown as { notes?: string }).notes) && (
                    <span className="text-stone-600 block mt-0.5">
                      {event.note || (event as unknown as { notes?: string }).notes}
                    </span>
                  )}
                  <span className="text-stone-400 font-mono text-[10px] block mt-0.5">
                    {formatDate(event.created_at)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </FormSection>
      )}

      {/* Status Confirm Dialog */}
      {confirmStatus && (
        <ConfirmDialog
          open={Boolean(confirmStatus)}
          onOpenChange={(open) => !open && setConfirmStatus(null)}
          title={`Move Order to "${formatOrderStatus(confirmStatus)}"?`}
          description={
            confirmStatus === "cancelled"
              ? "Cancelling this order will restore stock. This action will be logged in the audit trail."
              : `Confirm that this order is now ${formatOrderStatus(confirmStatus)}. An audit event will be recorded.`
          }
          confirmLabel={`Confirm: ${formatOrderStatus(confirmStatus)}`}
          variant={confirmStatus === "cancelled" ? "danger" : "default"}
          onConfirm={handleStatusChange}
        />
      )}

      {/* Collect COD Confirm Dialog */}
      {confirmCollectCod && (
        <ConfirmDialog
          open={confirmCollectCod}
          onOpenChange={(open) => !open && setConfirmCollectCod(false)}
          title="Confirm Cash on Delivery Collection"
          description={`Confirm that the remaining balance of ${formatPkr(order.balance_amount_pkr)} has been collected in cash upon physical delivery. This will mark the order as fully PAID.`}
          confirmLabel={`Confirm Collection: ${formatPkr(order.balance_amount_pkr)}`}
          variant="default"
          onConfirm={handleMarkCodCollected}
        />
      )}

      {/* Reject Payment Submission Dialog */}
      {rejectModalProofId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white border border-stone-200 max-w-md w-full p-6 space-y-4 shadow-xl font-sans">
            <h3 className="font-serif text-lg font-medium text-stone-900">
              Reject Payment Submission
            </h3>
            <p className="text-xs text-stone-600">
              Please specify the reason for rejecting this payment submission. This reason will be displayed to the customer so they can resolve the issue and submit a new receipt.
            </p>

            <div>
              <label className="block text-xs uppercase tracking-wider text-stone-700 mb-1 font-medium">
                Rejection Reason *
              </label>
              <textarea
                rows={3}
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                placeholder="e.g. Funds not reflected in bank account / Invalid transaction reference / Incorrect transfer amount"
                className="w-full p-2.5 border border-stone-300 text-xs focus:outline-none focus:border-stone-900"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-stone-100">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setRejectModalProofId(null)}
              >
                Cancel
              </Button>
              <Button
                type="button"
                variant="solid"
                size="sm"
                onClick={handleRejectPayment}
                disabled={rejectingProof || !rejectionReason.trim()}
                className="bg-red-700 hover:bg-red-800 text-white"
              >
                {rejectingProof ? "Rejecting..." : "Confirm Rejection"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
