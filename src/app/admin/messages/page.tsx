import { createClient } from "@/lib/supabase/server";
import { AdminMessagesClient } from "@/components/admin/AdminMessagesClient";

export default async function AdminMessagesPage() {
  const supabase = await createClient();

  const [{ data: messages }, { data: subscribers }] = await Promise.all([
    supabase
      .from("contact_messages")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(50),
    supabase
      .from("subscribers")
      .select("id, email, is_active, created_at")
      .order("created_at", { ascending: false }),
  ]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif text-2xl font-normal text-stone-900 tracking-wide">
          Messages & Newsletter
        </h1>
        <p className="text-xs text-stone-500 font-sans mt-0.5">
          Review client enquiries and newsletter subscriber list.
        </p>
      </div>

      <AdminMessagesClient
        messages={messages || []}
        subscribers={subscribers || []}
      />
    </div>
  );
}
