import { createClient } from "@/lib/supabase/server";
import { SiteSettingsClient } from "@/components/admin/SiteSettingsClient";

const SETTINGS_KEYS = [
  "brand_name",
  "announcement_text",
  "whatsapp_number",
  "contact_email",
  "contact_phone",
  "contact_address",
  "instagram_url",
  "facebook_url",
  "google_analytics_id",
  "bank_name",
  "bank_account_title",
  "bank_account_number",
  "bank_iban",
  "bank_branch",
  "bank_transfer_instructions",
];

export default async function AdminSettingsPage() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("site_settings")
    .select("key, value")
    .in("key", SETTINGS_KEYS);

  const settings: Record<string, string> = {};
  data?.forEach((row) => { settings[row.key] = row.value; });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif text-2xl font-normal text-stone-900 tracking-wide">
          Site Settings
        </h1>
        <p className="text-xs text-stone-500 font-sans mt-0.5">
          Global brand settings, contact details, and analytics integration.
        </p>
      </div>

      <SiteSettingsClient initialSettings={settings} />
    </div>
  );
}
