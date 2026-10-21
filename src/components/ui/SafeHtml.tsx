import { cn } from "@/lib/utils";

interface SafeHtmlProps {
  html: string;
  className?: string;
}

export function SafeHtml({ html, className }: SafeHtmlProps) {
  // Strip any script tags or inline event handlers as an extra guard
  const sanitized = html
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "")
    .replace(/on\w+="[^"]*"/g, "")
    .replace(/on\w+='[^']*'/g, "");

  return (
    <div
      className={cn("prose prose-stone max-w-none text-stone leading-relaxed", className)}
      dangerouslySetInnerHTML={{ __html: sanitized }}
    />
  );
}
