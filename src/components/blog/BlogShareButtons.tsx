"use client";

import { useState } from "react";
import { Share2, Check, Copy } from "lucide-react";

interface BlogShareButtonsProps {
  title: string;
  slug: string;
}

export function BlogShareButtons({ title, slug }: BlogShareButtonsProps) {
  const [copied, setCopied] = useState(false);

  const url = typeof window !== "undefined" ? window.location.href : `https://zahraluxe.com/blog/${slug}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const shareOnWhatsApp = () => {
    const text = encodeURIComponent(`${title} — Read on Zahra Luxe: ${url}`);
    window.open(`https://api.whatsapp.com/send?text=${text}`, "_blank");
  };

  const shareOnTwitter = () => {
    const text = encodeURIComponent(`${title} — via @ZahraLuxe`);
    window.open(`https://twitter.com/intent/tweet?text=${text}&url=${encodeURIComponent(url)}`, "_blank");
  };

  return (
    <div className="flex items-center gap-2">
      <span className="text-[11px] uppercase tracking-wider text-stone-400 font-mono mr-1 flex items-center gap-1">
        <Share2 className="w-3 h-3" /> Share:
      </span>

      <button
        onClick={shareOnWhatsApp}
        className="px-2.5 py-1 text-xs border border-stone-200 bg-white hover:bg-stone-50 text-stone-700 transition-colors"
      >
        WhatsApp
      </button>

      <button
        onClick={shareOnTwitter}
        className="px-2.5 py-1 text-xs border border-stone-200 bg-white hover:bg-stone-50 text-stone-700 transition-colors"
      >
        X (Twitter)
      </button>

      <button
        onClick={handleCopy}
        className="px-2.5 py-1 text-xs border border-stone-200 bg-white hover:bg-stone-50 text-stone-700 inline-flex items-center gap-1 transition-colors"
        title="Copy Link"
      >
        {copied ? (
          <>
            <Check className="w-3 h-3 text-emerald-600" />
            <span className="text-emerald-700">Copied</span>
          </>
        ) : (
          <>
            <Copy className="w-3 h-3" />
            <span>Copy</span>
          </>
        )}
      </button>
    </div>
  );
}
