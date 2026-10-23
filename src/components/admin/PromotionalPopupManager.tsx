"use client";

import React, { useState } from "react";
import Image from "next/image";
import {
  Sparkles,
  CheckCircle2,
  XCircle,
  Eye,
  Trash2,
  Calendar,
  Clock,
  Link as LinkIcon,
  Tag,
  Save,
  Copy,
  X,
  Layers,
} from "lucide-react";
import type { PromotionalPopup } from "@/types";
import { SingleImageUploader } from "./SingleImageUploader";
import {
  savePromotionalPopupAction,
  deletePromotionalPopupAction,
} from "@/server/actions/admin";

interface PromotionalPopupManagerProps {
  initialPopup: PromotionalPopup | null;
}

export function PromotionalPopupManager({
  initialPopup,
}: PromotionalPopupManagerProps) {
  const [popup, setPopup] = useState<PromotionalPopup>(
    initialPopup || {
      id: "promo-welcome",
      is_active: false,
      title: "Exclusive Welcome Privileges",
      description:
        "Enjoy complimentary white-glove shipping on your first luxury ensemble across Pakistan.",
      badge_text: "SPECIAL OFFER",
      discount_code: "AAA-ELEGANCE",
      image_url: "/images/hero/hero-1.jpg",
      button_text: "Explore Collection",
      destination_link: "/shop",
      start_date: null,
      expiry_date: null,
      delay_seconds: 3,
      frequency: "once_per_session",
    },
  );

  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(
    null,
  );
  const [previewOpen, setPreviewOpen] = useState(false);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!popup.title.trim()) {
      setMessage({ type: "error", text: "Offer title is required." });
      return;
    }
    if (!popup.image_url.trim()) {
      setMessage({
        type: "error",
        text: "Please upload a promotional image from your computer.",
      });
      return;
    }

    setSaving(true);
    setMessage(null);

    const res = await savePromotionalPopupAction(popup);
    setSaving(false);

    if (res.success) {
      setMessage({
        type: "success",
        text: "Promotional popup settings saved successfully.",
      });
      setTimeout(() => setMessage(null), 4000);
    } else {
      setMessage({
        type: "error",
        text: res.error || "Failed to save promotional popup.",
      });
    }
  };

  const handleToggleActive = async () => {
    const updated = { ...popup, is_active: !popup.is_active };
    setPopup(updated);
    const res = await savePromotionalPopupAction(updated);
    if (!res.success) {
      setMessage({ type: "error", text: "Failed to update status." });
    } else {
      setMessage({
        type: "success",
        text: updated.is_active ? "Promotional popup activated." : "Promotional popup deactivated.",
      });
      setTimeout(() => setMessage(null), 3000);
    }
  };

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to disable and reset the active offer popup?")) {
      return;
    }
    setSaving(true);
    const res = await deletePromotionalPopupAction();
    setSaving(false);
    if (res.success) {
      setPopup((prev) => ({ ...prev, is_active: false }));
      setMessage({ type: "success", text: "Promotional popup disabled." });
    } else {
      setMessage({ type: "error", text: res.error || "Failed to delete popup." });
    }
  };

  return (
    <div className="space-y-6">
      {message && (
        <div
          className={`p-3 text-xs border rounded ${
            message.type === "success"
              ? "bg-emerald-50 text-emerald-800 border-emerald-200"
              : "bg-red-50 text-red-800 border-red-200"
          }`}
        >
          {message.text}
        </div>
      )}

      {/* Header bar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 bg-white border border-stone-200 p-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-sm font-medium text-stone-900 uppercase tracking-wider flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-amber-600" />
              Promotional Offers & Homepage Popup
            </h2>
            {popup.is_active ? (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-emerald-50 text-emerald-700 text-[10px] uppercase font-medium tracking-wider border border-emerald-200 rounded">
                <CheckCircle2 className="w-3 h-3" /> Live & Enabled
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-stone-100 text-stone-600 text-[10px] uppercase font-medium tracking-wider border border-stone-200 rounded">
                <XCircle className="w-3 h-3" /> Disabled
              </span>
            )}
          </div>
          <p className="text-xs text-stone-500 mt-0.5">
            Manage promotional modal popups, discounts, and banner offers displayed to visitors.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setPreviewOpen(true)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 border border-stone-300 text-stone-700 hover:bg-stone-50 text-xs uppercase tracking-wider font-medium transition-colors cursor-pointer"
          >
            <Eye className="w-3.5 h-3.5" />
            Live Preview
          </button>
          <button
            type="button"
            onClick={handleToggleActive}
            className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs uppercase tracking-wider font-medium transition-colors cursor-pointer text-white ${
              popup.is_active
                ? "bg-stone-700 hover:bg-stone-800"
                : "bg-emerald-700 hover:bg-emerald-800"
            }`}
          >
            {popup.is_active ? "Disable Popup" : "Enable Popup"}
          </button>
        </div>
      </div>

      {/* Main configuration form */}
      <form onSubmit={handleSave} className="bg-white border border-stone-200 p-6 space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Column: Offer Details */}
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-stone-700 uppercase tracking-wider mb-1">
                Offer Title *
              </label>
              <input
                type="text"
                required
                value={popup.title}
                onChange={(e) => setPopup((prev) => ({ ...prev, title: e.target.value }))}
                placeholder="e.g. Festive Eid Luxe Privileges"
                className="w-full text-xs px-3 py-2 border border-stone-200 bg-white focus:outline-none focus:border-stone-900"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-stone-700 uppercase tracking-wider mb-1">
                Description / Offer Text
              </label>
              <textarea
                rows={3}
                value={popup.description}
                onChange={(e) => setPopup((prev) => ({ ...prev, description: e.target.value }))}
                placeholder="e.g. Receive complimentary delivery on all handcrafted orders above PKR 15,000."
                className="w-full text-xs p-3 border border-stone-200 bg-white focus:outline-none focus:border-stone-900 resize-none"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-stone-700 uppercase tracking-wider mb-1 flex items-center gap-1">
                  <Tag className="w-3 h-3 text-stone-400" />
                  Badge / Offer Highlight
                </label>
                <input
                  type="text"
                  value={popup.badge_text || ""}
                  onChange={(e) =>
                    setPopup((prev) => ({ ...prev, badge_text: e.target.value }))
                  }
                  placeholder="e.g. COMPLIMENTARY DELIVERY"
                  className="w-full text-xs px-3 py-2 border border-stone-200 bg-white focus:outline-none focus:border-stone-900"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-stone-700 uppercase tracking-wider mb-1 flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-stone-400" />
                  Promo / Coupon Code (Optional)
                </label>
                <input
                  type="text"
                  value={popup.discount_code || ""}
                  onChange={(e) =>
                    setPopup((prev) => ({ ...prev, discount_code: e.target.value.toUpperCase() }))
                  }
                  placeholder="e.g. AAA-FESTIVE"
                  className="w-full text-xs px-3 py-2 border border-stone-200 bg-white focus:outline-none focus:border-stone-900 font-mono"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-stone-700 uppercase tracking-wider mb-1">
                  Button Text *
                </label>
                <input
                  type="text"
                  required
                  value={popup.button_text}
                  onChange={(e) =>
                    setPopup((prev) => ({ ...prev, button_text: e.target.value }))
                  }
                  placeholder="Shop Collection"
                  className="w-full text-xs px-3 py-2 border border-stone-200 bg-white focus:outline-none focus:border-stone-900"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-stone-700 uppercase tracking-wider mb-1 flex items-center gap-1">
                  <LinkIcon className="w-3 h-3 text-stone-400" />
                  Destination Link *
                </label>
                <input
                  type="text"
                  required
                  value={popup.destination_link}
                  onChange={(e) =>
                    setPopup((prev) => ({ ...prev, destination_link: e.target.value }))
                  }
                  placeholder="/shop or /collections/formals"
                  className="w-full text-xs px-3 py-2 border border-stone-200 bg-white focus:outline-none focus:border-stone-900"
                />
              </div>
            </div>
          </div>

          {/* Right Column: Image Upload & Scheduling */}
          <div className="space-y-4">
            {/* Direct Local Computer Image Upload */}
            <SingleImageUploader
              value={popup.image_url}
              onChange={(url) => setPopup((prev) => ({ ...prev, image_url: url }))}
              bucket="promotions"
              label="Promotional Image (Direct Upload from Computer) *"
              helperText="Upload promotional visual directly from local files. Aspect ratio ~1:1 or 4:5 recommended."
              aspectRatioClass="aspect-[4/3] sm:aspect-[16/10]"
            />

            {/* Timing & Frequency */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div>
                <label className="block text-xs font-medium text-stone-700 uppercase tracking-wider mb-1 flex items-center gap-1">
                  <Clock className="w-3 h-3 text-stone-400" />
                  Appearance Delay
                </label>
                <select
                  value={popup.delay_seconds}
                  onChange={(e) =>
                    setPopup((prev) => ({ ...prev, delay_seconds: Number(e.target.value) }))
                  }
                  className="w-full text-xs px-3 py-2 border border-stone-200 bg-white focus:outline-none focus:border-stone-900"
                >
                  <option value={1}>1 second after load</option>
                  <option value={3}>3 seconds after load (Recommended)</option>
                  <option value={5}>5 seconds after load</option>
                  <option value={10}>10 seconds after load</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-stone-700 uppercase tracking-wider mb-1 flex items-center gap-1">
                  <Layers className="w-3 h-3 text-stone-400" />
                  Frequency
                </label>
                <select
                  value={popup.frequency}
                  onChange={(e) =>
                    setPopup((prev) => ({
                      ...prev,
                      frequency: e.target.value as PromotionalPopup["frequency"],
                    }))
                  }
                  className="w-full text-xs px-3 py-2 border border-stone-200 bg-white focus:outline-none focus:border-stone-900"
                >
                  <option value="once_per_session">Once Per Session (Recommended)</option>
                  <option value="always">Always on every homepage visit</option>
                  <option value="once_ever">Once per visitor device</option>
                </select>
              </div>
            </div>

            {/* Start and Expiry Dates */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
              <div>
                <label className="block text-xs font-medium text-stone-700 uppercase tracking-wider mb-1 flex items-center gap-1">
                  <Calendar className="w-3 h-3 text-stone-400" />
                  Start Date (Optional)
                </label>
                <input
                  type="date"
                  value={popup.start_date ? popup.start_date.split("T")[0] : ""}
                  onChange={(e) =>
                    setPopup((prev) => ({
                      ...prev,
                      start_date: e.target.value ? new Date(e.target.value).toISOString() : null,
                    }))
                  }
                  className="w-full text-xs px-3 py-2 border border-stone-200 bg-white focus:outline-none focus:border-stone-900"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-stone-700 uppercase tracking-wider mb-1 flex items-center gap-1">
                  <Calendar className="w-3 h-3 text-stone-400" />
                  Expiry Date (Optional)
                </label>
                <input
                  type="date"
                  value={popup.expiry_date ? popup.expiry_date.split("T")[0] : ""}
                  onChange={(e) =>
                    setPopup((prev) => ({
                      ...prev,
                      expiry_date: e.target.value
                        ? new Date(e.target.value + "T23:59:59").toISOString()
                        : null,
                    }))
                  }
                  className="w-full text-xs px-3 py-2 border border-stone-200 bg-white focus:outline-none focus:border-stone-900"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Footer actions */}
        <div className="flex flex-col sm:flex-row justify-between items-center gap-3 pt-4 border-t border-stone-100">
          <button
            type="button"
            onClick={handleDelete}
            className="text-xs text-red-600 hover:text-red-700 flex items-center gap-1 cursor-pointer"
          >
            <Trash2 className="w-3.5 h-3.5" />
            Reset / Remove Offer
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setPreviewOpen(true)}
              className="px-4 py-2 border border-stone-200 text-stone-700 text-xs uppercase tracking-wider hover:bg-stone-50 font-medium"
            >
              Preview Popup
            </button>
            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center gap-1.5 px-6 py-2 bg-stone-900 text-white text-xs uppercase tracking-wider font-medium hover:bg-stone-800 disabled:opacity-50 transition-colors cursor-pointer shadow-sm"
            >
              <Save className="w-3.5 h-3.5" />
              {saving ? "Saving Changes..." : "Save Popup Settings"}
            </button>
          </div>
        </div>
      </form>

      {/* Live Interactive Preview Modal */}
      {previewOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="relative w-full max-w-xl bg-ivory text-ink border border-gold/30 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            {/* Close button */}
            <button
              type="button"
              onClick={() => setPreviewOpen(false)}
              className="absolute top-3 right-3 z-20 p-1.5 rounded-full bg-ivory/80 text-ink/80 hover:text-ink hover:bg-ivory transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="grid grid-cols-1 sm:grid-cols-2">
              {/* Image side */}
              <div className="relative aspect-[4/3] sm:aspect-auto sm:h-full min-h-[220px] bg-stone-100">
                {popup.image_url ? (
                  <Image
                    src={popup.image_url}
                    alt={popup.title}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-xs text-stone-400">
                    No image uploaded
                  </div>
                )}
                {popup.badge_text && (
                  <span className="absolute top-3 left-3 bg-ink/90 text-gold text-[9px] uppercase tracking-[0.2em] font-sans font-medium px-2 py-0.5 backdrop-blur-xs">
                    {popup.badge_text}
                  </span>
                )}
              </div>

              {/* Text & Action side */}
              <div className="p-6 sm:p-7 flex flex-col justify-between space-y-4">
                <div className="space-y-2">
                  <span className="text-[10px] uppercase tracking-[0.24em] text-gold font-sans font-medium block">
                    Ahmed Ali Ansari
                  </span>
                  <h3 className="font-heading text-xl sm:text-2xl font-light text-ink leading-snug">
                    {popup.title}
                  </h3>
                  <p className="text-xs text-stone-600 font-sans font-light leading-relaxed">
                    {popup.description}
                  </p>

                  {popup.discount_code && (
                    <div className="pt-2">
                      <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-cream border border-gold/40 text-ink text-xs font-mono">
                        <span className="text-[10px] text-stone-500 font-sans uppercase">Code:</span>
                        <span className="font-medium tracking-wider">{popup.discount_code}</span>
                      </div>
                    </div>
                  )}
                </div>

                <div className="pt-2">
                  <div className="w-full py-2.5 px-4 bg-ink text-ivory text-xs uppercase tracking-[0.18em] font-medium text-center hover:bg-gold transition-colors block shadow-xs">
                    {popup.button_text}
                  </div>
                  <p className="text-[9px] text-center text-stone-400 font-sans mt-2">
                    [Live Preview Mode — Closes on click]
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
