import "server-only";

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
};

export async function getSiteSettings(): Promise<Record<string, string>> {
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

export async function getSiteSetting(key: string): Promise<string> {
  const all = await getSiteSettings();
  return all[key] ?? FALLBACK_SETTINGS[key] ?? "";
}
