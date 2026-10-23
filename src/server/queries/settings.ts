import "server-only";

import { unstable_cache } from "next/cache";
import { createPublicClient } from "@/lib/supabase/server";
import type { SiteSetting } from "@/types";

const FALLBACK_SETTINGS: Record<string, string> = {
  brand_name: "Ahmed Ali Ansari",
  tagline: "Premium embroidered fabrics crafted with elegance and delivered with trust.",
  announcement_text: "Complimentary delivery on orders above PKR 15,000 within Pakistan",
  whatsapp_number: "+923092045906",
  contact_email: "aahmedaliansariofficial@gmail.com",
  contact_phone: "+92 309 2045906",
  contact_address: "Lahore, Punjab, Pakistan",
  instagram_url: "https://instagram.com/ahmedaliansari.official",
  facebook_url: "https://www.facebook.com/share/1M1kjqDWHj/",
  bank_name: "Meezan Bank Limited",
  bank_account_title: "Ahmed Ali Ansari",
  bank_account_number: "0101-0105849301",
  bank_iban: "PK36MEZN0001010105849301",
  bank_branch: "Main Branch, Lahore",
  bank_transfer_instructions:
    "Please transfer the payable amount to our official bank account. Submit your transaction reference ID and upload the transfer receipt screenshot to confirm your order.",
};

async function fetchSiteSettings(): Promise<Record<string, string>> {
  try {
    const supabase = createPublicClient();
    const { data, error } = await supabase.from("site_settings").select("*");

    if (error || !data || data.length === 0) {
      return FALLBACK_SETTINGS;
    }

    const map: Record<string, string> = { ...FALLBACK_SETTINGS };
    for (const item of data as SiteSetting[]) {
      map[item.key] = item.value;
    }
    return map;
  } catch {
    return FALLBACK_SETTINGS;
  }
}

export const getSiteSettings = unstable_cache(fetchSiteSettings, ["settings"], {
  tags: ["settings"],
  revalidate: 3600,
});

export async function getSiteSetting(key: string): Promise<string> {
  const all = await getSiteSettings();
  return all[key] ?? FALLBACK_SETTINGS[key] ?? "";
}

export async function getPromotionalPopup(): Promise<import("@/types").PromotionalPopup | null> {
  try {
    const raw = await getSiteSetting("promotional_popup");
    if (!raw) return null;
    const parsed = JSON.parse(raw) as import("@/types").PromotionalPopup;
    if (!parsed || !parsed.is_active) return null;

    const now = Date.now();
    if (parsed.start_date) {
      const start = new Date(parsed.start_date).getTime();
      if (!isNaN(start) && start > now) return null;
    }
    if (parsed.expiry_date) {
      const expiry = new Date(parsed.expiry_date).getTime();
      if (!isNaN(expiry) && expiry < now) return null;
    }

    return parsed;
  } catch {
    return null;
  }
}

export async function getAdminPromotionalPopup(): Promise<import("@/types").PromotionalPopup | null> {
  try {
    const raw = await getSiteSetting("promotional_popup");
    if (!raw) return null;
    return JSON.parse(raw) as import("@/types").PromotionalPopup;
  } catch {
    return null;
  }
}

