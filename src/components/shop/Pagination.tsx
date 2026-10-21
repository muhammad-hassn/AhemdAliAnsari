import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  searchParams: Record<string, string | undefined>;
}

export function Pagination({
  currentPage,
  totalPages,
  searchParams,
}: PaginationProps) {
  if (totalPages <= 1) return null;

  const createPageUrl = (page: number) => {
    const params = new URLSearchParams();
    Object.entries(searchParams).forEach(([key, val]) => {
      if (val !== undefined && key !== "page") {
        params.set(key, val);
      }
    });
    params.set("page", page.toString());
    return `/shop?${params.toString()}`;
  };

  const pages = Array.from({ length: totalPages }, (_, i) => i + 1);

  return (
    <nav
      aria-label="Pagination"
      className="flex items-center justify-center gap-2 pt-16 border-t border-hairline mt-12"
    >
      {/* Previous */}
      <Link
        href={createPageUrl(Math.max(1, currentPage - 1))}
        aria-disabled={currentPage <= 1}
        className={`h-10 w-10 border border-hairline flex items-center justify-center transition-colors ${
          currentPage <= 1
            ? "pointer-events-none opacity-40 text-stone"
            : "text-ink hover:bg-hairline/40"
        }`}
      >
        <ChevronLeft className="h-4 w-4" />
        <span className="sr-only">Previous page</span>
      </Link>

      {/* Page Numbers */}
      <div className="flex items-center gap-1">
        {pages.map((p) => {
          const isCurrent = p === currentPage;
          return (
            <Link
              key={p}
              href={createPageUrl(p)}
              className={`h-10 w-10 flex items-center justify-center text-xs font-sans font-medium transition-colors border ${
                isCurrent
                  ? "border-ink bg-ink text-ivory"
                  : "border-transparent text-ink hover:border-hairline"
              }`}
            >
              {p}
            </Link>
          );
        })}
      </div>

      {/* Next */}
      <Link
        href={createPageUrl(Math.min(totalPages, currentPage + 1))}
        aria-disabled={currentPage >= totalPages}
        className={`h-10 w-10 border border-hairline flex items-center justify-center transition-colors ${
          currentPage >= totalPages
            ? "pointer-events-none opacity-40 text-stone"
            : "text-ink hover:bg-hairline/40"
        }`}
      >
        <ChevronRight className="h-4 w-4" />
        <span className="sr-only">Next page</span>
      </Link>
    </nav>
  );
}
