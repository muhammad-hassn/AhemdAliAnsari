"use client";

import { LayoutGrid, Grid3X3, Grid2X2 } from "lucide-react";
import { cn } from "@/lib/utils";

export type GridColumns = 2 | 3 | 4;

interface GridToggleProps {
  columns: GridColumns;
  onChange: (columns: GridColumns) => void;
  className?: string;
}

export function GridToggle({ columns, onChange, className }: GridToggleProps) {
  return (
    <div className={cn("hidden md:flex items-center gap-1 border border-hairline p-1 bg-ivory", className)}>
      <button
        type="button"
        onClick={() => onChange(2)}
        aria-label="2 columns grid"
        className={cn(
          "p-1.5 transition-colors cursor-pointer",
          columns === 2 ? "bg-ink text-ivory" : "text-stone hover:text-ink",
        )}
      >
        <Grid2X2 className="h-4 w-4" />
      </button>

      <button
        type="button"
        onClick={() => onChange(3)}
        aria-label="3 columns grid"
        className={cn(
          "p-1.5 transition-colors cursor-pointer",
          columns === 3 ? "bg-ink text-ivory" : "text-stone hover:text-ink",
        )}
      >
        <Grid3X3 className="h-4 w-4" />
      </button>

      <button
        type="button"
        onClick={() => onChange(4)}
        aria-label="4 columns grid"
        className={cn(
          "p-1.5 transition-colors cursor-pointer",
          columns === 4 ? "bg-ink text-ivory" : "text-stone hover:text-ink",
        )}
      >
        <LayoutGrid className="h-4 w-4" />
      </button>
    </div>
  );
}
