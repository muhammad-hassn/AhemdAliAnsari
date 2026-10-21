"use client";

import React, { useState } from "react";
import {
  Bold,
  Italic,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  Quote,
  Code,
} from "lucide-react";
import { Button } from "@/components/ui/Button";

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  minHeight?: string;
}

export function RichTextEditor({
  value,
  onChange,
  placeholder = "Write content here...",
  minHeight = "240px",
}: RichTextEditorProps) {
  const [mode, setMode] = useState<"visual" | "html">("visual");

  const exec = (tag: string, prefix = "", suffix = "") => {
    // Format text
    const textarea = document.getElementById("admin-editor-area") as HTMLTextAreaElement | null;
    if (!textarea) return;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const text = textarea.value;
    const selected = text.substring(start, end);

    let replacement = "";
    if (tag === "b") replacement = `<strong>${selected || "bold text"}</strong>`;
    else if (tag === "i") replacement = `<em>${selected || "italic text"}</em>`;
    else if (tag === "h2") replacement = `\n<h2>${selected || "Heading 2"}</h2>\n`;
    else if (tag === "h3") replacement = `\n<h3>${selected || "Heading 3"}</h3>\n`;
    else if (tag === "ul") replacement = `\n<ul>\n  <li>${selected || "List item"}</li>\n</ul>\n`;
    else if (tag === "ol") replacement = `\n<ol>\n  <li>${selected || "First item"}</li>\n</ol>\n`;
    else if (tag === "blockquote") replacement = `\n<blockquote>${selected || "Quote text"}</blockquote>\n`;
    else replacement = `${prefix}${selected}${suffix}`;

    const newText = text.substring(0, start) + replacement + text.substring(end);
    onChange(newText);
  };

  return (
    <div className="border border-stone-200 bg-white">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center justify-between border-b border-stone-200 p-2 bg-stone-50 gap-1">
        <div className="flex flex-wrap items-center gap-1">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => exec("b")}
            className="h-8 w-8 p-0 text-stone-700"
            title="Bold"
          >
            <Bold className="w-4 h-4" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => exec("i")}
            className="h-8 w-8 p-0 text-stone-700"
            title="Italic"
          >
            <Italic className="w-4 h-4" />
          </Button>
          <div className="w-[1px] h-4 bg-stone-300 mx-1" />
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => exec("h2")}
            className="h-8 w-8 p-0 text-stone-700"
            title="Heading 2"
          >
            <Heading2 className="w-4 h-4" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => exec("h3")}
            className="h-8 w-8 p-0 text-stone-700"
            title="Heading 3"
          >
            <Heading3 className="w-4 h-4" />
          </Button>
          <div className="w-[1px] h-4 bg-stone-300 mx-1" />
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => exec("ul")}
            className="h-8 w-8 p-0 text-stone-700"
            title="Bullet List"
          >
            <List className="w-4 h-4" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => exec("ol")}
            className="h-8 w-8 p-0 text-stone-700"
            title="Numbered List"
          >
            <ListOrdered className="w-4 h-4" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => exec("blockquote")}
            className="h-8 w-8 p-0 text-stone-700"
            title="Blockquote"
          >
            <Quote className="w-4 h-4" />
          </Button>
        </div>

        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant={mode === "visual" ? "outline" : "ghost"}
            size="sm"
            onClick={() => setMode("visual")}
            className="h-7 text-xs px-2"
          >
            Visual Edit
          </Button>
          <Button
            type="button"
            variant={mode === "html" ? "outline" : "ghost"}
            size="sm"
            onClick={() => setMode("html")}
            className="h-7 text-xs px-2"
          >
            <Code className="w-3 h-3 mr-1" />
            HTML Preview
          </Button>
        </div>
      </div>

      {/* Editor Body */}
      {mode === "visual" ? (
        <textarea
          id="admin-editor-area"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          style={{ minHeight }}
          className="w-full p-4 text-sm font-sans focus:outline-none resize-y leading-relaxed text-stone-900 bg-white"
        />
      ) : (
        <div
          style={{ minHeight }}
          className="p-4 prose prose-stone max-w-none text-sm border-t border-stone-100 overflow-y-auto bg-stone-50/50"
          dangerouslySetInnerHTML={{ __html: value || "<p class='text-stone-400'>Preview area</p>" }}
        />
      )}
    </div>
  );
}
