"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Shirt,
  Sparkles,
  ShoppingBag,
  Users,
  Home,
  BookOpen,
  FileText,
  Menu,
  Image as ImageIcon,
  Settings,
  Mail,
  ArrowRightLeft,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  X,
} from "lucide-react";

interface NavGroup {
  label: string;
  role?: "admin" | "editor";
  items: Array<{
    title: string;
    href: string;
    icon: React.ElementType;
    role?: "admin" | "editor";
  }>;
}

const NAV_GROUPS: NavGroup[] = [
  {
    label: "Overview",
    items: [
      { title: "Dashboard", href: "/admin", icon: LayoutDashboard },
    ],
  },
  {
    label: "Commerce",
    role: "admin",
    items: [
      { title: "Products", href: "/admin/products", icon: Shirt, role: "admin" },
      { title: "Collections", href: "/admin/collections", icon: Sparkles, role: "admin" },
      { title: "Orders", href: "/admin/orders", icon: ShoppingBag, role: "admin" },
      { title: "Customers", href: "/admin/customers", icon: Users, role: "admin" },
    ],
  },
  {
    label: "Content & CMS",
    items: [
      { title: "Blog Posts", href: "/admin/blog", icon: BookOpen },
      { title: "Pages & Policies", href: "/admin/pages", icon: FileText },
      { title: "Media Library", href: "/admin/media", icon: ImageIcon },
      { title: "Homepage Layout", href: "/admin/homepage", icon: Home },
    ],
  },
  {
    label: "Store Configuration",
    role: "admin",
    items: [
      { title: "Navigation", href: "/admin/navigation", icon: Menu, role: "admin" },
      { title: "Messages", href: "/admin/messages", icon: Mail },
      { title: "Redirects", href: "/admin/redirects", icon: ArrowRightLeft, role: "admin" },
      { title: "Settings", href: "/admin/settings", icon: Settings, role: "admin" },
    ],
  },
];

interface AdminSidebarProps {
  role: "admin" | "editor";
  mobileOpen: boolean;
  onMobileClose: () => void;
}

export function AdminSidebar({
  role,
  mobileOpen,
  onMobileClose,
}: AdminSidebarProps) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);

  const filterNav = () => {
    return NAV_GROUPS.map((group) => {
      if (role === "editor" && group.role === "admin") {
        return null;
      }
      const filteredItems = group.items.filter((item) => {
        if (role === "editor" && item.role === "admin") return false;
        return true;
      });
      if (filteredItems.length === 0) return null;
      return { ...group, items: filteredItems };
    }).filter(Boolean) as NavGroup[];
  };

  const navGroups = filterNav();

  const sidebarContent = (
    <div className="flex flex-col h-full bg-stone-950 text-stone-300 border-r border-stone-800 overflow-hidden">
      {/* Brand Header */}
      <div className="flex items-center justify-between p-4 border-b border-stone-800/80 shrink-0">
        <Link href="/admin" className="flex items-center gap-2 min-w-0">
          {!collapsed && (
            <span className="font-serif text-sm tracking-wider font-normal text-stone-100 truncate">
              AHMED ALI ANSARI
            </span>
          )}
          {collapsed && (
            <span className="font-serif text-base tracking-wider font-normal text-stone-100">
              AA
            </span>
          )}
          <span className="text-[10px] uppercase tracking-widest text-amber-500/90 font-mono px-1 py-0.5 border border-amber-500/30 shrink-0">
            CMS
          </span>
        </Link>
        <button
          type="button"
          onClick={onMobileClose}
          className="md:hidden p-1 text-stone-400 hover:text-stone-100 shrink-0"
          aria-label="Close menu"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Navigation List */}
      <div className="flex-1 overflow-y-auto py-4 px-3 space-y-6 scrollbar-thin scrollbar-track-stone-900 scrollbar-thumb-stone-700">
        {navGroups.map((group, gIdx) => (
          <div key={gIdx} className="space-y-1">
            {!collapsed && (
              <p className="px-3 text-[10px] uppercase tracking-widest text-stone-500 font-mono mb-2 font-semibold">
                {group.label}
              </p>
            )}
            {group.items.map((item, iIdx) => {
              const Icon = item.icon;
              const isActive =
                item.href === "/admin"
                  ? pathname === "/admin"
                  : pathname.startsWith(item.href);

              return (
                <Link
                  key={iIdx}
                  href={item.href}
                  onClick={onMobileClose}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2 text-xs font-sans transition-colors rounded",
                    isActive
                      ? "bg-amber-950/40 text-amber-300 font-medium border border-amber-800/30"
                      : "text-stone-400 hover:text-stone-100 hover:bg-stone-900",
                  )}
                  title={collapsed ? item.title : undefined}
                >
                  <Icon className={cn("w-4 h-4 shrink-0", isActive ? "text-amber-400" : "")} />
                  {!collapsed && <span>{item.title}</span>}
                </Link>
              );
            })}
          </div>
        ))}
      </div>

      {/* Bottom Storefront Link & Collapse Toggle */}
      <div className="p-3 border-t border-stone-800/80 space-y-2">
        <Link
          href="/"
          target="_blank"
          className="flex items-center justify-between px-3 py-2 text-xs font-sans text-stone-400 hover:text-stone-100 hover:bg-stone-900 rounded transition-colors"
        >
          <span className="flex items-center gap-2">
            <ExternalLink className="w-3.5 h-3.5 text-stone-400" />
            {!collapsed && "View Storefront"}
          </span>
        </Link>

        <button
          type="button"
          onClick={() => setCollapsed(!collapsed)}
          className="hidden md:flex w-full items-center justify-between px-3 py-2 text-xs text-stone-500 hover:text-stone-300 hover:bg-stone-900 rounded transition-colors"
        >
          <span>{!collapsed && "Collapse"}</span>
          {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <aside
        className={cn(
          "hidden md:flex flex-col shrink-0 transition-all duration-300 sticky top-0 h-screen overflow-hidden",
          collapsed ? "w-16" : "w-64",
        )}
      >
        {sidebarContent}
      </aside>

      {/* Mobile Slide-Over Drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex">
          <div
            className="fixed inset-0 bg-stone-950/60 backdrop-blur-xs transition-opacity"
            onClick={onMobileClose}
          />
          <div className="relative w-72 max-w-[80vw] h-full z-10">
            {sidebarContent}
          </div>
        </div>
      )}
    </>
  );
}
