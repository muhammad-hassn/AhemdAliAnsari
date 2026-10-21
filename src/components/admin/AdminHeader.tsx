"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Search, Menu, LogOut, Shield } from "lucide-react";
import { CommandPalette } from "@/components/admin/CommandPalette";
import { signOutAction } from "@/server/actions/auth";

interface AdminHeaderProps {
  userEmail: string;
  role: "admin" | "editor";
  onOpenMobileMenu: () => void;
}

export function AdminHeader({
  userEmail,
  role,
  onOpenMobileMenu,
}: AdminHeaderProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [paletteOpen, setPaletteOpen] = useState(false);

  // Generate breadcrumb links
  const pathSegments = pathname.split("/").filter(Boolean);
  const breadcrumbs = pathSegments.map((segment, idx) => {
    const href = "/" + pathSegments.slice(0, idx + 1).join("/");
    const label = segment.charAt(0).toUpperCase() + segment.slice(1).replace(/-/g, " ");
    return { href, label };
  });

  return (
    <>
      <header className="sticky top-0 z-30 flex items-center justify-between h-14 px-4 sm:px-6 bg-white border-b border-stone-200">
        {/* Left: Mobile Menu & Breadcrumbs */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onOpenMobileMenu}
            className="md:hidden p-1.5 text-stone-600 hover:text-stone-900"
            aria-label="Open sidebar"
          >
            <Menu className="w-5 h-5" />
          </button>

          <nav className="hidden sm:flex items-center gap-2 text-xs font-sans text-stone-500">
            {breadcrumbs.map((crumb, idx) => {
              const isLast = idx === breadcrumbs.length - 1;
              return (
                <React.Fragment key={crumb.href}>
                  {idx > 0 && <span>/</span>}
                  {isLast ? (
                    <span className="font-medium text-stone-900">{crumb.label}</span>
                  ) : (
                    <Link href={crumb.href} className="hover:text-stone-900 transition-colors">
                      {crumb.label}
                    </Link>
                  )}
                </React.Fragment>
              );
            })}
          </nav>
        </div>

        {/* Center/Right: Cmd+K Global Search & User Pill */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setPaletteOpen(true)}
            className="flex items-center gap-2 px-3 py-1.5 text-xs text-stone-500 bg-stone-100 hover:bg-stone-200/80 rounded border border-stone-200 transition-colors"
          >
            <Search className="w-3.5 h-3.5 text-stone-400" />
            <span className="hidden sm:inline">Search admin...</span>
            <kbd className="hidden sm:inline-block px-1.5 py-0.5 text-[10px] font-mono bg-white text-stone-500 border border-stone-200 rounded">
              ⌘K
            </kbd>
          </button>

          {/* User & Role */}
          <div className="flex items-center gap-2 pl-3 border-l border-stone-200">
            <div className="hidden lg:flex flex-col text-right">
              <span className="text-xs font-medium text-stone-800 font-sans truncate max-w-[150px]">
                {userEmail}
              </span>
              <span className="text-[10px] uppercase font-mono tracking-wider text-amber-700 flex items-center justify-end gap-1">
                <Shield className="w-2.5 h-2.5" />
                {role}
              </span>
            </div>

            <button
              type="button"
              onClick={async () => {
                await signOutAction();
                router.push("/login");
                router.refresh();
              }}
              className="p-1.5 text-stone-500 hover:text-stone-900 transition-colors cursor-pointer"
              title="Sign out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      <CommandPalette open={paletteOpen} onOpenChange={setPaletteOpen} />
    </>
  );
}
