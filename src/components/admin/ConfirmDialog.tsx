"use client";

import React, { useState } from "react";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/Dialog";
import { Button } from "@/components/ui/Button";

interface ConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: "danger" | "default";
  onConfirm: () => Promise<void> | void;
}

export function ConfirmDialog({
  open,
  onOpenChange,
  title,
  description,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  variant = "danger",
  onConfirm,
}: ConfirmDialogProps) {
  const [loading, setLoading] = useState(false);

  const handleConfirm = async () => {
    setLoading(true);
    try {
      await onConfirm();
      onOpenChange(false);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md p-6">
        <DialogTitle className="font-serif text-xl font-medium text-stone-900">
          {title}
        </DialogTitle>
        <DialogDescription className="text-sm text-stone-600 mt-2">
          {description}
        </DialogDescription>
        <div className="flex items-center justify-end gap-3 mt-6">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => onOpenChange(false)}
            disabled={loading}
          >
            {cancelLabel}
          </Button>
          <Button
            type="button"
            variant={variant === "danger" ? "solid" : "outline"}
            size="sm"
            onClick={handleConfirm}
            disabled={loading}
            className={variant === "danger" ? "bg-red-700 hover:bg-red-800 text-white" : ""}
          >
            {loading ? "Processing..." : confirmLabel}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
