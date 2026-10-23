"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { X, Copy, Check, Sparkles } from "lucide-react";
import type { PromotionalPopup as PromotionalPopupType } from "@/types";

interface PromotionalPopupProps {
  popup: PromotionalPopupType | null;
}

export function PromotionalPopup({ popup }: PromotionalPopupProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!popup || !popup.is_active) return;

    // Check scheduling client-side as well
    const now = Date.now();
    if (popup.start_date) {
      const start = new Date(popup.start_date).getTime();
      if (!isNaN(start) && start > now) return;
    }
    if (popup.expiry_date) {
      const expiry = new Date(popup.expiry_date).getTime();
      if (!isNaN(expiry) && expiry < now) return;
    }

    // Check frequency dismissal records
    const storageKey = `aaa_promo_dismissed_${popup.id}`;
    if (popup.frequency === "once_per_session") {
      if (sessionStorage.getItem(storageKey)) return;
    } else if (popup.frequency === "once_ever") {
      if (localStorage.getItem(storageKey)) return;
    }

    // Delay popup presentation
    const delayMs = Math.max(500, (popup.delay_seconds ?? 3) * 1000);
    const timer = setTimeout(() => {
      setIsOpen(true);
    }, delayMs);

    return () => clearTimeout(timer);
  }, [popup]);

  if (!isOpen || !popup || !popup.is_active) {
    return null;
  }

  const handleClose = () => {
    setIsOpen(false);
    const storageKey = `aaa_promo_dismissed_${popup.id}`;
    if (popup.frequency === "once_per_session") {
      sessionStorage.setItem(storageKey, "true");
    } else if (popup.frequency === "once_ever") {
      localStorage.setItem(storageKey, "true");
    }
  };

  const handleCopyCode = () => {
    if (!popup.discount_code) return;
    navigator.clipboard.writeText(popup.discount_code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={popup.title}
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300"
    >
      {/* Backdrop click handler */}
      <div className="absolute inset-0" onClick={handleClose} />

      {/* Modal Box */}
      <div className="relative w-full max-w-lg sm:max-w-xl bg-ivory text-ink border border-gold/40 shadow-2xl overflow-hidden z-10 max-h-[90vh] flex flex-col sm:flex-row">
        {/* Close Button */}
        <button
          type="button"
          onClick={handleClose}
          aria-label="Close promotional offer"
          className="absolute top-2.5 right-2.5 z-30 p-1.5 rounded-full bg-ivory/80 text-ink/70 hover:text-ink hover:bg-ivory transition-colors cursor-pointer shadow-xs"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Visual / Image Side */}
        <div className="relative aspect-[16/10] sm:aspect-auto sm:w-5/12 min-h-[160px] sm:min-h-[280px] bg-stone-100 shrink-0">
          {popup.image_url && (
            <Image
              src={popup.image_url}
              alt={popup.title}
              fill
              sizes="(max-width: 640px) 100vw, 40vw"
              className="object-cover object-center"
            />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-ink/30 via-transparent to-transparent sm:hidden" />
          {popup.badge_text && (
            <span className="absolute top-3 left-3 bg-ink/90 text-gold text-[9px] uppercase tracking-[0.2em] font-sans font-medium px-2 py-0.5 backdrop-blur-xs">
              {popup.badge_text}
            </span>
          )}
        </div>

        {/* Content Side */}
        <div className="p-5 sm:p-7 sm:w-7/12 flex flex-col justify-between space-y-4 overflow-y-auto">
          <div className="space-y-2">
            <div className="flex items-center gap-1.5 text-gold text-[10px] uppercase tracking-[0.24em] font-sans font-medium">
              <Sparkles className="w-3 h-3" />
              <span>Ahmed Ali Ansari</span>
            </div>

            <h3 className="font-heading text-xl sm:text-2xl font-light text-ink leading-tight">
              {popup.title}
            </h3>

            {popup.description && (
              <p className="text-xs text-stone font-sans font-light leading-relaxed">
                {popup.description}
              </p>
            )}

            {popup.discount_code && (
              <div className="pt-2">
                <button
                  type="button"
                  onClick={handleCopyCode}
                  className="w-full flex items-center justify-between px-3 py-2 bg-cream border border-gold/40 text-ink text-xs font-mono hover:border-gold transition-colors cursor-pointer group"
                >
                  <span className="text-[10px] text-stone-500 font-sans uppercase tracking-wider">
                    Promo Code
                  </span>
                  <div className="flex items-center gap-1.5 font-medium">
                    <span className="tracking-widest">{popup.discount_code}</span>
                    {copied ? (
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                    ) : (
                      <Copy className="w-3.5 h-3.5 text-stone-400 group-hover:text-stone-700 transition-colors" />
                    )}
                  </div>
                </button>
                {copied && (
                  <p className="text-[10px] text-emerald-600 font-sans mt-1 text-center">
                    Copied to clipboard! Apply at checkout.
                  </p>
                )}
              </div>
            )}
          </div>

          <div className="pt-2 space-y-2">
            <Link
              href={popup.destination_link || "/shop"}
              onClick={handleClose}
              className="w-full py-2.5 px-4 bg-ink text-ivory text-xs uppercase tracking-[0.18em] font-medium text-center hover:bg-gold hover:text-ink transition-colors block shadow-xs"
            >
              {popup.button_text || "Shop Now"}
            </Link>
            <button
              type="button"
              onClick={handleClose}
              className="w-full text-center text-[10px] uppercase tracking-[0.14em] text-stone-400 hover:text-stone-700 font-sans transition-colors cursor-pointer"
            >
              Continue Browsing
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
