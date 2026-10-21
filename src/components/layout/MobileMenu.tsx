"use client";

import Link from "next/link";
import { X } from "lucide-react";
import { NAV_LINKS, SITE_NAME, CONTACT_EMAIL, CONTACT_PHONE } from "@/lib/constants";
import { CurrencySwitcher } from "./CurrencySwitcher";
import type { CurrencyRate } from "@/types";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/Sheet";

interface MobileMenuProps {
  isOpen: boolean;
  onClose: () => void;
  rates?: CurrencyRate[];
}

export function MobileMenu({ isOpen, onClose, rates }: MobileMenuProps) {
  return (
    <Sheet open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <SheetContent side="left" className="w-[85%] max-w-sm flex flex-col justify-between p-6">
        <div>
          <SheetHeader className="flex flex-row items-center justify-between pb-6 border-b border-hairline">
            <SheetTitle className="text-left font-heading text-2xl font-light tracking-tight">
              {SITE_NAME}
            </SheetTitle>
            <button
              type="button"
              onClick={onClose}
              aria-label="Close menu"
              className="p-1 text-ink hover:text-gold transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </SheetHeader>

          {/* Navigation Links */}
          <nav className="flex flex-col py-8 divide-y divide-hairline">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={onClose}
                className="py-4 font-heading text-2xl font-light text-ink hover:text-gold transition-colors flex items-center justify-between"
              >
                <span>{link.label}</span>
                <span className="text-xs font-sans text-stone tracking-[0.1em] uppercase">
                  Explore
                </span>
              </Link>
            ))}
            <Link
              href="/account"
              onClick={onClose}
              className="py-4 font-heading text-2xl font-light text-ink hover:text-gold transition-colors flex items-center justify-between"
            >
              <span>My Account</span>
              <span className="text-xs font-sans text-stone tracking-[0.1em] uppercase">
                Orders & Profile
              </span>
            </Link>
          </nav>
        </div>

        {/* Bottom Section */}
        <div className="pt-6 border-t border-hairline flex flex-col gap-6">
          <div className="flex items-center justify-between">
            <span className="text-xs font-sans uppercase tracking-[0.12em] text-stone">
              Currency
            </span>
            <CurrencySwitcher rates={rates} />
          </div>

          <div className="flex flex-col gap-1 text-xs text-stone font-sans">
            <a href={`mailto:${CONTACT_EMAIL}`} className="hover:text-ink transition-colors">
              {CONTACT_EMAIL}
            </a>
            <a href={`tel:${CONTACT_PHONE.replace(/\s+/g, "")}`} className="hover:text-ink transition-colors">
              {CONTACT_PHONE}
            </a>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
