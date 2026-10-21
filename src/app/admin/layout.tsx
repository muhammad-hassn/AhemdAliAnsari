import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { AdminLayoutClient } from "@/components/admin/AdminLayoutClient";

export const metadata = {
  title: "Admin CMS — Ahmed Ali Ansari",
  robots: {
    index: false,
    follow: false,
  },
};

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login?next=/admin");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  const isConfiguredAdmin = user.email?.toLowerCase().trim() === "aahmedaliansariofficial@gmail.com";
  const role = (profile?.role as "admin" | "editor") || (isConfiguredAdmin ? "admin" : "customer");

  if (!["admin", "editor"].includes(role)) {
    redirect("/");
  }

  return (
    <AdminLayoutClient
      userEmail={user.email || "aahmedaliansariofficial@gmail.com"}
      role={role}
    >
      {children}
    </AdminLayoutClient>
  );
}
