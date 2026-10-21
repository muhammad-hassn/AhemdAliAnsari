"use client";

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/Sheet";

interface SizeGuideDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

const SIZE_CHART = [
  { size: "XXS", bust: "32", waist: "24", hip: "35", shirtLength: "44" },
  { size: "XS", bust: "34", waist: "26", hip: "37", shirtLength: "45" },
  { size: "S", bust: "36", waist: "28", hip: "39", shirtLength: "46" },
  { size: "M", bust: "38", waist: "30", hip: "41", shirtLength: "46" },
  { size: "ML", bust: "40", waist: "32", hip: "43", shirtLength: "47" },
  { size: "L", bust: "42", waist: "34", hip: "45", shirtLength: "47" },
  { size: "XL", bust: "45", waist: "37", hip: "48", shirtLength: "48" },
  { size: "XXL", bust: "48", waist: "40", hip: "51", shirtLength: "48" },
];

export function SizeGuideDrawer({ isOpen, onClose }: SizeGuideDrawerProps) {
  return (
    <Sheet open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <SheetContent side="right" className="w-full sm:max-w-lg p-6 overflow-y-auto">
        <SheetHeader className="pb-4">
          <SheetTitle>Standard Size Guide</SheetTitle>
          <SheetDescription>
            All measurements are garment dimensions in inches. For custom tailoring, please review our bespoke note.
          </SheetDescription>
        </SheetHeader>

        {/* Measurement Table */}
        <div className="py-6 overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs font-sans">
            <thead>
              <tr className="border-b border-hairline text-stone uppercase tracking-[0.1em]">
                <th className="py-3 px-2 font-medium">Size</th>
                <th className="py-3 px-2 font-medium">Bust</th>
                <th className="py-3 px-2 font-medium">Waist</th>
                <th className="py-3 px-2 font-medium">Hip</th>
                <th className="py-3 px-2 font-medium">Length</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-hairline">
              {SIZE_CHART.map((row) => (
                <tr key={row.size} className="hover:bg-hairline/20">
                  <td className="py-3 px-2 font-medium text-ink uppercase">
                    {row.size}
                  </td>
                  <td className="py-3 px-2 text-stone">{row.bust}&quot;</td>
                  <td className="py-3 px-2 text-stone">{row.waist}&quot;</td>
                  <td className="py-3 px-2 text-stone">{row.hip}&quot;</td>
                  <td className="py-3 px-2 text-stone">{row.shirtLength}&quot;</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Bespoke Note */}
        <div className="border border-hairline bg-[#FAF7F2] p-5 space-y-2 mt-4">
          <h4 className="font-heading text-lg font-light text-ink">
            Made-to-Measure Service
          </h4>
          <p className="text-xs text-stone font-sans leading-relaxed">
            Every bride and ensemble deserves a flawless silhouette. Our master karigars offer complimentary custom alterations. Following your order placement, our atelier concierge will connect with you via WhatsApp to record your exact measurements.
          </p>
        </div>
      </SheetContent>
    </Sheet>
  );
}
