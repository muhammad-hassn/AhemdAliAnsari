"use client";

import { useState } from "react";
import { X } from "lucide-react";
import { ANNOUNCEMENT_TEXT } from "@/lib/constants";

interface AnnouncementBarProps {
  text?: string;
}

export function AnnouncementBar({ text = ANNOUNCEMENT_TEXT }: AnnouncementBarProps) {
  const [isVisible, setIsVisible] = useState(true);

  if (!isVisible) return null;

  return (
    <div className="relative bg-ink text-ivory py-2.5 px-4 text-center text-[11px] sm:text-xs font-sans tracking-[0.12em] uppercase font-light border-b border-hairline/20 z-40">
      <div className="max-w-[1440px] mx-auto pr-6 sm:pr-0">
        <span>{text}</span>
      </div>
      <button
        type="button"
        onClick={() => setIsVisible(false)}
        aria-label="Dismiss announcement"
        className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-ivory/60 hover:text-ivory transition-colors cursor-pointer"
      >
        <X className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}
