import Link from "next/link";
import { SlidersHorizontal } from "lucide-react";
import { Button } from "@/components/ui/Button";

interface EmptyStateProps {
  title?: string;
  description?: string;
  resetHref?: string;
  actionText?: string;
}

export function EmptyState({
  title = "No ensembles found",
  description = "No pieces currently match your selected filters. Try broadening your criteria or view all creations.",
  resetHref = "/shop",
  actionText = "Clear Filters",
}: EmptyStateProps) {
  return (
    <div className="py-24 text-center flex flex-col items-center justify-center border border-hairline bg-[#FAF7F2] p-8 sm:p-12">
      <div className="h-12 w-12 border border-hairline flex items-center justify-center text-stone mb-4">
        <SlidersHorizontal className="h-5 w-5 stroke-[1.2]" />
      </div>
      <h3 className="font-heading text-2xl font-light text-ink mb-2">
        {title}
      </h3>
      <p className="text-xs text-stone font-sans max-w-sm mb-6 leading-relaxed">
        {description}
      </p>
      <Button variant="solid" size="default" asChild>
        <Link href={resetHref}>{actionText}</Link>
      </Button>
    </div>
  );
}
