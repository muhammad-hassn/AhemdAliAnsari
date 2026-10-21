"use client";

import React, { useState } from "react";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { AdminHeader } from "@/components/admin/AdminHeader";

interface AdminLayoutClientProps {
  userEmail: string;
  role: "admin" | "editor";
  children: React.ReactNode;
}

export function AdminLayoutClient({
  userEmail,
  role,
  children,
}: AdminLayoutClientProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-stone-100/60 flex text-stone-900 font-sans overflow-hidden" style={{ height: '100dvh' }}>
      <AdminSidebar
        role={role}
        mobileOpen={mobileMenuOpen}
        onMobileClose={() => setMobileMenuOpen(false)}
      />
      <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
        <AdminHeader
          userEmail={userEmail}
          role={role}
          onOpenMobileMenu={() => setMobileMenuOpen(true)}
        />
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          <div className="max-w-7xl w-full mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
