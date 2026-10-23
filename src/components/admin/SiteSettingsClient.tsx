"use client";

import { useState } from "react";
import { FormSection } from "./FormSection";
import { saveSiteSettingsAction } from "@/server/actions/admin";

interface SiteSettingsClientProps {
  initialSettings: Record<string, string>;
}

export function SiteSettingsClient({ initialSettings }: SiteSettingsClientProps) {
  const [settings, setSettings] = useState<Record<string, string>>(initialSettings);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<{ type: "success" | "error"; message: string } | null>(null);

  const handleChange = (key: string, value: string) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setStatus(null);

    const res = await saveSiteSettingsAction(settings);
    setLoading(false);

    if (res.success) {
      setStatus({ type: "success", message: "Settings saved successfully." });
    } else {
      setStatus({ type: "error", message: res.error || "Failed to save settings." });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-4xl">
      {status && (
        <div
          className={`p-3 text-xs border ${
            status.type === "success"
              ? "bg-emerald-50 text-emerald-800 border-emerald-200"
              : "bg-red-50 text-red-800 border-red-200"
          }`}
        >
          {status.message}
        </div>
      )}

      {/* Brand & Identity */}
      <FormSection
        title="Brand & Identity"
        description="General store identity displayed across headers, emails, and invoices."
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-stone-700 uppercase tracking-wider mb-1">
              Brand Name
            </label>
            <input
              type="text"
              value={settings.brand_name || ""}
              onChange={(e) => handleChange("brand_name", e.target.value)}
              className="w-full text-xs px-3 py-2 border border-stone-200 bg-white focus:outline-none focus:border-stone-900"
              placeholder="Zahra Luxe"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-stone-700 uppercase tracking-wider mb-1">
              Brand Tagline
            </label>
            <input
              type="text"
              value={settings.brand_tagline || ""}
              onChange={(e) => handleChange("brand_tagline", e.target.value)}
              className="w-full text-xs px-3 py-2 border border-stone-200 bg-white focus:outline-none focus:border-stone-900"
              placeholder="Pakistani Luxury Eastern Wear"
            />
          </div>
        </div>
      </FormSection>

      {/* Announcement Bar */}
      <FormSection
        title="Announcement Bar"
        description="Top announcement banner message displayed on all storefront pages."
      >
        <div>
          <label className="block text-xs font-medium text-stone-700 uppercase tracking-wider mb-1">
            Announcement Text
          </label>
          <input
            type="text"
            value={settings.announcement_text || ""}
            onChange={(e) => handleChange("announcement_text", e.target.value)}
            className="w-full text-xs px-3 py-2 border border-stone-200 bg-white focus:outline-none focus:border-stone-900"
            placeholder="Complimentary worldwide shipping on orders over PKR 50,000"
          />
        </div>
      </FormSection>

      {/* Contact & WhatsApp */}
      <FormSection
        title="Contact & Customer Care"
        description="Official contact details for customer inquiries, WhatsApp ordering, and footer."
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-stone-700 uppercase tracking-wider mb-1">
              WhatsApp Number
            </label>
            <input
              type="text"
              value={settings.whatsapp_number || ""}
              onChange={(e) => handleChange("whatsapp_number", e.target.value)}
              className="w-full text-xs px-3 py-2 border border-stone-200 bg-white focus:outline-none focus:border-stone-900"
              placeholder="+923001234567"
            />
            <p className="text-[10px] text-stone-500 mt-1">Include country code without spaces.</p>
          </div>

          <div>
            <label className="block text-xs font-medium text-stone-700 uppercase tracking-wider mb-1">
              Contact Phone
            </label>
            <input
              type="text"
              value={settings.contact_phone || ""}
              onChange={(e) => handleChange("contact_phone", e.target.value)}
              className="w-full text-xs px-3 py-2 border border-stone-200 bg-white focus:outline-none focus:border-stone-900"
              placeholder="+92 21 34567890"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-stone-700 uppercase tracking-wider mb-1">
              Support Email
            </label>
            <input
              type="email"
              value={settings.contact_email || ""}
              onChange={(e) => handleChange("contact_email", e.target.value)}
              className="w-full text-xs px-3 py-2 border border-stone-200 bg-white focus:outline-none focus:border-stone-900"
              placeholder="care@zahraluxe.com"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-stone-700 uppercase tracking-wider mb-1">
              Atelier / Boutique Address
            </label>
            <input
              type="text"
              value={settings.contact_address || ""}
              onChange={(e) => handleChange("contact_address", e.target.value)}
              className="w-full text-xs px-3 py-2 border border-stone-200 bg-white focus:outline-none focus:border-stone-900"
              placeholder="Block 4, Clifton, Karachi, Pakistan"
            />
          </div>
        </div>
      </FormSection>

      {/* Social Media */}
      <FormSection
        title="Social Profiles"
        description="Official social media links for brand presence and footer integration."
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-stone-700 uppercase tracking-wider mb-1">
              Instagram URL
            </label>
            <input
              type="url"
              value={settings.instagram_url || ""}
              onChange={(e) => handleChange("instagram_url", e.target.value)}
              className="w-full text-xs px-3 py-2 border border-stone-200 bg-white focus:outline-none focus:border-stone-900"
              placeholder="https://instagram.com/zahraluxe"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-stone-700 uppercase tracking-wider mb-1">
              Facebook URL
            </label>
            <input
              type="url"
              value={settings.facebook_url || ""}
              onChange={(e) => handleChange("facebook_url", e.target.value)}
              className="w-full text-xs px-3 py-2 border border-stone-200 bg-white focus:outline-none focus:border-stone-900"
              placeholder="https://facebook.com/zahraluxe"
            />
          </div>
        </div>
      </FormSection>

      {/* Bank Account & Manual Transfer */}
      <FormSection
        title="Bank Account & Manual Transfer"
        description="Official bank account details displayed to clients for manual bank transfers and 50% advance deposits."
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-stone-700 uppercase tracking-wider mb-1">
              Bank Name
            </label>
            <input
              type="text"
              value={settings.bank_name || ""}
              onChange={(e) => handleChange("bank_name", e.target.value)}
              className="w-full text-xs px-3 py-2 border border-stone-200 bg-white focus:outline-none focus:border-stone-900"
              placeholder="e.g. Meezan Bank Limited"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-stone-700 uppercase tracking-wider mb-1">
              Account Title
            </label>
            <input
              type="text"
              value={settings.bank_account_title || ""}
              onChange={(e) => handleChange("bank_account_title", e.target.value)}
              className="w-full text-xs px-3 py-2 border border-stone-200 bg-white focus:outline-none focus:border-stone-900"
              placeholder="e.g. Ahmed Ali Ansari"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-stone-700 uppercase tracking-wider mb-1">
              Account Number
            </label>
            <input
              type="text"
              value={settings.bank_account_number || ""}
              onChange={(e) => handleChange("bank_account_number", e.target.value)}
              className="w-full text-xs px-3 py-2 border border-stone-200 bg-white focus:outline-none focus:border-stone-900 font-mono"
              placeholder="e.g. 0101-0105849301"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-stone-700 uppercase tracking-wider mb-1">
              IBAN Number
            </label>
            <input
              type="text"
              value={settings.bank_iban || ""}
              onChange={(e) => handleChange("bank_iban", e.target.value)}
              className="w-full text-xs px-3 py-2 border border-stone-200 bg-white focus:outline-none focus:border-stone-900 font-mono"
              placeholder="e.g. PK36MEZN0001010105849301"
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-xs font-medium text-stone-700 uppercase tracking-wider mb-1">
              Branch & City (Optional)
            </label>
            <input
              type="text"
              value={settings.bank_branch || ""}
              onChange={(e) => handleChange("bank_branch", e.target.value)}
              className="w-full text-xs px-3 py-2 border border-stone-200 bg-white focus:outline-none focus:border-stone-900"
              placeholder="e.g. Main Gulberg Branch, Lahore"
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-xs font-medium text-stone-700 uppercase tracking-wider mb-1">
              Transfer Instructions for Customers
            </label>
            <textarea
              rows={3}
              value={settings.bank_transfer_instructions || ""}
              onChange={(e) => handleChange("bank_transfer_instructions", e.target.value)}
              className="w-full text-xs px-3 py-2 border border-stone-200 bg-white focus:outline-none focus:border-stone-900 leading-relaxed"
              placeholder="Instructions displayed to customers during checkout and on the order confirmation page..."
            />
          </div>
        </div>
      </FormSection>

      {/* Analytics & Tracking */}
      <FormSection
        title="Analytics & Tracking"
        description="Tracking identifiers for marketing and performance measurement."
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-stone-700 uppercase tracking-wider mb-1">
              Google Analytics 4 Measurement ID
            </label>
            <input
              type="text"
              value={settings.google_analytics_id || ""}
              onChange={(e) => handleChange("google_analytics_id", e.target.value)}
              className="w-full text-xs px-3 py-2 border border-stone-200 bg-white focus:outline-none focus:border-stone-900 font-mono text-xs"
              placeholder="G-XXXXXXXXXX"
            />
          </div>
        </div>
      </FormSection>

      <div className="flex justify-end pt-2">
        <button
          type="submit"
          disabled={loading}
          className="px-6 py-2.5 bg-stone-900 text-white text-xs uppercase tracking-wider font-medium hover:bg-stone-800 disabled:opacity-50 transition-colors"
        >
          {loading ? "Saving..." : "Save Settings"}
        </button>
      </div>
    </form>
  );
}
