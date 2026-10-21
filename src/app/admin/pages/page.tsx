import { createClient } from "@/lib/supabase/server";
import { PagesFormClient } from "@/components/admin/PagesFormClient";

const PAGE_KEYS = ["about", "privacy", "refund", "terms", "shipping"] as const;

export default async function AdminPagesPage() {
  const supabase = await createClient();
  const { data: pages } = await supabase
    .from("pages")
    .select("*")
    .in("key", [...PAGE_KEYS]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif text-2xl font-normal text-stone-900 tracking-wide">
          Pages & Policies
        </h1>
        <p className="text-xs text-stone-500 font-sans mt-0.5">
          Edit rich content pages — About, Privacy, Refund, Terms, and Shipping.
        </p>
      </div>

      <PagesFormClient pages={pages || []} />
    </div>
  );
}
