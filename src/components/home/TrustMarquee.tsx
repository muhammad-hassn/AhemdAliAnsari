"use client";

import { TRUST_SIGNALS } from "@/lib/constants";
import { useReducedMotion } from "@/hooks/use-reduced-motion";

export function TrustMarquee() {
  const prefersReducedMotion = useReducedMotion();

  return (
    <div className="w-full border-y border-hairline bg-[#FAF7F2] py-4 overflow-hidden relative select-none">
      <div
        className={`flex whitespace-nowrap items-center gap-12 text-xs font-sans uppercase tracking-[0.18em] text-stone font-medium ${
          prefersReducedMotion ? "justify-center flex-wrap" : "animate-marquee"
        }`}
      >
        {TRUST_SIGNALS.concat(TRUST_SIGNALS).map((signal, index) => (
          <div key={`${signal}-${index}`} className="flex items-center gap-12 shrink-0">
            <span>{signal}</span>
            <span className="h-1 w-1 bg-gold rotate-45 shrink-0" />
          </div>
        ))}
      </div>

      <style jsx>{`
        @keyframes marquee {
          0% {
            transform: translateX(0%);
          }
          100% {
            transform: translateX(-50%);
          }
        }
        .animate-marquee {
          display: flex;
          width: max-content;
          animation: marquee 35s linear infinite;
        }
        .animate-marquee:hover {
          animation-play-state: paused;
        }
      `}</style>
    </div>
  );
}
