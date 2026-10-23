import { cn } from "@/lib/utils";

interface StatusBadgeProps {
  status: string;
  className?: string;
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const normalized = status.toLowerCase();

  const getStyle = () => {
    switch (normalized) {
      case "delivered":
      case "paid":
      case "published":
      case "confirmed":
        return "bg-emerald-50 text-emerald-800 border-emerald-300";
      case "shipped":
      case "scheduled":
      case "deposit_received":
        return "bg-amber-50 text-amber-800 border-amber-300";
      case "proof_submitted":
        return "bg-sky-50 text-sky-800 border-sky-300";
      case "pending":
      case "draft":
        return "bg-stone-100 text-stone-700 border-stone-300";
      case "cancelled":
      case "refunded":
      case "rejected":
        return "bg-red-50 text-red-800 border-red-300";
      default:
        return "bg-stone-50 text-stone-700 border-stone-200";
    }
  };

  return (
    <span
      className={cn(
        "inline-flex items-center px-2 py-0.5 text-xs font-medium tracking-wide uppercase border",
        getStyle(),
        className,
      )}
    >
      {status.replace(/_/g, " ")}
    </span>
  );
}
