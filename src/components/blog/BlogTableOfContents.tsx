"use client";

import { useMemo } from "react";

interface TocItem {
  id: string;
  text: string;
  level: number;
}

interface BlogTableOfContentsProps {
  contentHtml: string;
}

export function BlogTableOfContents({ contentHtml }: BlogTableOfContentsProps) {
  const headings = useMemo(() => {
    if (!contentHtml) return [];

    // Parse H2 and H3 tags using regex to extract titles
    const regex = /<h([2-3])[^>]*>(.*?)<\/h\1>/gi;
    const items: TocItem[] = [];
    let match;

    while ((match = regex.exec(contentHtml)) !== null) {
      const level = parseInt(match[1], 10);
      const rawText = match[2].replace(/<[^>]*>/g, "").trim();
      if (rawText) {
        const id = rawText
          .toLowerCase()
          .replace(/[^\w\s-]/g, "")
          .replace(/\s+/g, "-");
        items.push({ id, text: rawText, level });
      }
    }

    return items;
  }, [contentHtml]);

  if (headings.length === 0) return null;

  return (
    <div className="bg-white border border-stone-200 p-5">
      <h3 className="text-xs uppercase tracking-[0.2em] font-medium text-stone-900 mb-3 pb-2 border-b border-stone-100">
        Table of Contents
      </h3>
      <nav className="space-y-2 text-xs">
        {headings.map((h, i) => (
          <a
            key={i}
            href={`#${h.id}`}
            className={`block text-stone-600 hover:text-[#C5A059] transition-colors leading-normal ${
              h.level === 3 ? "pl-3 text-[11px] text-stone-500" : "font-medium"
            }`}
          >
            {h.text}
          </a>
        ))}
      </nav>
    </div>
  );
}
