import Link from "next/link";
import { LucideIcon } from "lucide-react";
import { Button } from "@/components/ui/Button";

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  actionHref?: string;
  actionLabel?: string;
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  actionHref,
  actionLabel,
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center p-12 text-center border border-dashed border-stone-200 bg-stone-50/50">
      <div className="flex items-center justify-center w-12 h-12 mb-4 rounded-full bg-stone-100 text-stone-500">
        <Icon className="w-6 h-6 stroke-[1.5]" />
      </div>
      <h3 className="font-serif text-lg font-medium text-stone-900 tracking-wide mb-1">
        {title}
      </h3>
      <p className="text-sm text-stone-600 max-w-sm mb-6 font-sans">
        {description}
      </p>
      {actionHref && actionLabel && (
        <Button asChild variant="solid" size="sm">
          <Link href={actionHref}>{actionLabel}</Link>
        </Button>
      )}
    </div>
  );
}
