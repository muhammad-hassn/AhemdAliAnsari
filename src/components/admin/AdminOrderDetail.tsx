"use client";

import React, { useState } from "react";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { FormSection } from "@/components/admin/FormSection";
import { ConfirmDialog } from "@/components/admin/ConfirmDialog";
import {
  updateOrderStatusAction,
  updateOrderTrackingAction,
  updateOrderNotesAction,
} from "@/server/actions/admin";
import { formatPkr, formatDate, formatOrderStatus } from "@/lib/format";
import { Package, Truck, CheckCircle2, X, Edit2 } from "lucide-react";
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
  const [confirmStatus, setConfirmStatus] = useState<OrderStatus | null>(null);
  const [trackingInput, setTrackingInput] = useState(order.tracking_number || "");
  const [notesInput, setNotesInput] = useState(order.notes || "");
  const [savingTracking, setSavingTracking] = useState(false);
  const [savingNotes, setSavingNotes] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const nextStatuses = ORDER_STATUS_TRANSITIONS[order.status] || [];

  const showMsg = (msg: string, isError = false) => {
    if (isError) setErrorMsg(msg);
    else setSuccessMsg(msg);
    setTimeout(() => { setSuccessMsg(null); setErrorMsg(null); }, 3000);
  };

  const handleStatusChange = async () => {
    if (!confirmStatus) return;
    const res = await updateOrderStatusAction(order.id, confirmStatus);
    if (!res.success) showMsg(res.error || "Failed to update status", true);
    else showMsg(`Order moved to ${formatOrderStatus(confirmStatus)}`);
    setConfirmStatus(null);
  };

  const handleSaveTracking = async () => {
    setSavingTracking(true);
    const res = await updateOrderTrackingAction(order.id, trackingInput);
    setSavingTracking(false);
    if (!res.success) showMsg(res.error || "Failed to save tracking", true);
    else showMsg("Tracking number saved");
  };

  const handleSaveNotes = async () => {
    setSavingNotes(true);
    const res = await updateOrderNotesAction(order.id, notesInput);
    setSavingNotes(false);
    if (!res.success) showMsg(res.error || "Failed to save notes", true);
    else showMsg("Notes saved");
  };

  return (
    <div className="space-y-8 max-w-4xl">
      {/* Flash messages */}
      {successMsg && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-sans">
          {successMsg}
        </div>
      )}
      {errorMsg && (
        <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs font-sans">
          {errorMsg}
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

      {/* 2-col grid: Customer + Payment */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <FormSection title="Customer Information">
          <div className="space-y-2 text-xs font-sans text-stone-800">
            <p><strong>Name:</strong> {order.shipping_address?.full_name || order.guest_email || "Registered Client"}</p>
            {order.guest_email && <p><strong>Email:</strong> {order.guest_email}</p>}
            {order.guest_phone && <p><strong>Phone:</strong> {order.guest_phone}</p>}
          </div>
        </FormSection>

        <FormSection title="Payment Summary">
          <div className="space-y-2 text-xs font-sans text-stone-800">
            <div className="flex justify-between">
              <span className="text-stone-500">Subtotal</span>
              <span>{formatPkr(order.subtotal_pkr)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-stone-500">Shipping</span>
              <span>{formatPkr(order.shipping_pkr)}</span>
            </div>
            <div className="flex justify-between font-medium text-stone-900 border-t border-stone-100 pt-2 mt-2">
              <span>Total</span>
              <span>{formatPkr(order.total_pkr)}</span>
            </div>
            <div className="flex justify-between pt-1">
              <span className="text-stone-500">Payment Status</span>
              <StatusBadge status={order.payment_status} />
            </div>
          </div>
        </FormSection>
      </div>

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
        <FormSection title="Order Timeline">
          <div className="space-y-3">
            {order.events.map((event) => (
              <div key={event.id} className="flex items-start gap-3 text-xs font-sans">
                <div className="w-1.5 h-1.5 rounded-full bg-amber-600 mt-1.5 shrink-0" />
                <div>
                  <span className="font-medium text-stone-900">
                    {formatOrderStatus(event.status)}
                  </span>
                  {event.note && (
                    <span className="text-stone-500 block">{event.note}</span>
                  )}
                  <span className="text-stone-400 font-mono text-[10px] block">
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
    </div>
  );
}
