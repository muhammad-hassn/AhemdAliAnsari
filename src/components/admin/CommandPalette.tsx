"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/Dialog";
import { Input } from "@/components/ui/Input";
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
  Search,
} from "lucide-react";

interface CommandItem {
  title: string;
  href: string;
  icon: React.ElementType;
  category: string;
}

const COMMAND_ITEMS: CommandItem[] = [
  { title: "Dashboard", href: "/admin", icon: LayoutDashboard, category: "Navigation" },
  { title: "Products CRUD", href: "/admin/products", icon: Shirt, category: "Commerce" },
  { title: "New Product", href: "/admin/products/new", icon: Shirt, category: "Commerce" },
  { title: "Collections", href: "/admin/collections", icon: Sparkles, category: "Commerce" },
  { title: "Orders Management", href: "/admin/orders", icon: ShoppingBag, category: "Commerce" },
  { title: "Customer Database", href: "/admin/customers", icon: Users, category: "Commerce" },
  { title: "Homepage Manager", href: "/admin/homepage", icon: Home, category: "Storefront" },
  { title: "Blog Posts", href: "/admin/blog", icon: BookOpen, category: "Content" },
  { title: "New Blog Post", href: "/admin/blog/new", icon: BookOpen, category: "Content" },
  { title: "Policy & Content Pages", href: "/admin/pages", icon: FileText, category: "Content" },
  { title: "Navigation Menu", href: "/admin/navigation", icon: Menu, category: "Storefront" },
  { title: "Media Library", href: "/admin/media", icon: ImageIcon, category: "Content" },
  { title: "Site Settings", href: "/admin/settings", icon: Settings, category: "System" },
  { title: "Messages & Subscribers", href: "/admin/messages", icon: Mail, category: "System" },
  { title: "Redirects (301/302)", href: "/admin/redirects", icon: ArrowRightLeft, category: "SEO" },
];

interface CommandPaletteProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CommandPalette({ open, onOpenChange }: CommandPaletteProps) {
  const router = useRouter();
  const [query, setQuery] = useState("");

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        onOpenChange(!open);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [open, onOpenChange]);

  const filtered = COMMAND_ITEMS.filter((item) =>
    item.title.toLowerCase().includes(query.toLowerCase()) ||
    item.category.toLowerCase().includes(query.toLowerCase()),
  );

  const handleSelect = (href: string) => {
    onOpenChange(false);
    setQuery("");
    router.push(href);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl p-0 overflow-hidden bg-white border border-stone-200">
        <DialogTitle className="sr-only">Admin Command Palette</DialogTitle>
        <DialogDescription className="sr-only">
          Search and jump to any admin module or setting.
        </DialogDescription>
        <div className="flex items-center border-b border-stone-200 px-4 py-3 bg-stone-50/50">
          <Search className="w-4 h-4 text-stone-400 mr-2 shrink-0" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Type a command or jump to page... (ESC to close)"
            className="border-none shadow-none focus-visible:ring-0 bg-transparent text-sm h-7 p-0"
            autoFocus
          />
        </div>
        <div className="max-h-80 overflow-y-auto p-2 divide-y divide-stone-100">
          {filtered.length === 0 ? (
            <div className="p-6 text-center text-xs text-stone-400 font-sans">
              No matching commands found.
            </div>
          ) : (
            filtered.map((item, idx) => {
              const Icon = item.icon;
              return (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleSelect(item.href)}
                  className="w-full flex items-center justify-between p-2.5 text-left text-xs font-sans hover:bg-stone-50 rounded transition-colors group"
                >
                  <div className="flex items-center gap-2.5">
                    <Icon className="w-4 h-4 text-stone-400 group-hover:text-stone-900" />
                    <span className="font-medium text-stone-800 group-hover:text-stone-900">
                      {item.title}
                    </span>
                  </div>
                  <span className="text-[10px] text-stone-400 uppercase tracking-wider">
                    {item.category}
                  </span>
                </button>
              );
            })
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
