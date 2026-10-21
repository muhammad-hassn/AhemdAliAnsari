import React from "react";
import { cn } from "@/lib/utils";

interface FormSectionProps {
  title: string;
  description?: string;
  children: React.ReactNode;
  className?: string;
  action?: React.ReactNode;
}

export function FormSection({
  title,
  description,
  children,
  className,
  action,
}: FormSectionProps) {
  return (
    <div
      className={cn(
        "bg-white border border-stone-200 p-6 shadow-sm",
        className,
      )}
    >
      <div className="flex items-start justify-between border-b border-stone-100 pb-4 mb-6">
        <div>
          <h2 className="font-serif text-lg font-medium text-stone-900 tracking-wide">
            {title}
          </h2>
          {description && (
            <p className="text-xs text-stone-500 font-sans mt-0.5">
              {description}
            </p>
          )}
        </div>
        {action && <div>{action}</div>}
      </div>
      <div className="space-y-4">{children}</div>
    </div>
  );
}
