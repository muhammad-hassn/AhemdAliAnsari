"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { DataTable, type Column } from "@/components/admin/DataTable";
import { Button } from "@/components/ui/Button";
import { ConfirmDialog } from "@/components/admin/ConfirmDialog";
import {
  markContactMessageReadAction,
  deleteContactMessageAction,
} from "@/server/actions/admin";
import { formatDate } from "@/lib/format";
import { Trash2, MailOpen, Mail } from "lucide-react";

interface ContactMessage {
  id: string;
  name: string;
  email: string;
  phone?: string | null;
  message: string;
  is_read: boolean;
  created_at: string;
}

interface Subscriber {
  id: string;
  email: string;
  is_active: boolean;
  created_at: string;
}

interface AdminMessagesClientProps {
  messages: ContactMessage[];
  subscribers: Subscriber[];
}

export function AdminMessagesClient({ messages, subscribers }: AdminMessagesClientProps) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"messages" | "subscribers">("messages");
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const handleMarkRead = async (id: string) => {
    await markContactMessageReadAction(id);
    router.refresh();
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    await deleteContactMessageAction(deleteId);
    setDeleteId(null);
    router.refresh();
  };

  const msgColumns: Column<ContactMessage>[] = [
    {
      header: "Status",
      cell: (row) => (
        <span className={`text-[10px] font-mono uppercase tracking-wider px-1.5 py-0.5 border ${
          row.is_read
            ? "bg-stone-50 text-stone-400 border-stone-200"
            : "bg-amber-50 text-amber-800 border-amber-300"
        }`}>
          {row.is_read ? "Read" : "New"}
        </span>
      ),
    },
    {
      header: "From",
      cell: (row) => (
        <div className="text-xs">
          <span className="font-medium text-stone-900 block">{row.name}</span>
          <span className="text-stone-400 font-mono text-[10px]">{row.email}</span>
        </div>
      ),
      sortable: true,
      accessorKey: "name",
    },
    {
      header: "Message",
      cell: (row) => (
        <p className="text-xs text-stone-600 line-clamp-2 max-w-sm">{row.message}</p>
      ),
    },
    {
      header: "Date",
      cell: (row) => (
        <span className="text-xs text-stone-500 font-sans">{formatDate(row.created_at)}</span>
      ),
      sortable: true,
      accessorKey: "created_at",
    },
    {
      header: "",
      cell: (row) => (
        <div className="flex items-center justify-end gap-1">
          {!row.is_read && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => handleMarkRead(row.id)}
              className="h-7 w-7 p-0 text-stone-600"
              title="Mark as Read"
            >
              <MailOpen className="w-3.5 h-3.5" />
            </Button>
          )}
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => setDeleteId(row.id)}
            className="h-7 w-7 p-0 text-red-600"
            title="Delete"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </Button>
        </div>
      ),
      className: "text-right",
    },
  ];

  const subColumns: Column<Subscriber>[] = [
    {
      header: "Email",
      cell: (row) => (
        <span className="font-mono text-xs text-stone-900">{row.email}</span>
      ),
      sortable: true,
      accessorKey: "email",
    },
    {
      header: "Status",
      cell: (row) => (
        <span className={`text-[10px] font-mono uppercase tracking-wider px-1.5 py-0.5 border ${
          row.is_active
            ? "bg-emerald-50 text-emerald-800 border-emerald-300"
            : "bg-stone-100 text-stone-500 border-stone-200"
        }`}>
          {row.is_active ? "Active" : "Unsubscribed"}
        </span>
      ),
    },
    {
      header: "Joined",
      cell: (row) => (
        <span className="text-xs text-stone-500">{formatDate(row.created_at)}</span>
      ),
      sortable: true,
      accessorKey: "created_at",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Tab Switcher */}
      <div className="flex gap-3">
        <button
          type="button"
          onClick={() => setActiveTab("messages")}
          className={`flex items-center gap-2 px-4 py-2 text-xs font-sans uppercase tracking-wider border transition-colors ${
            activeTab === "messages"
              ? "bg-stone-900 text-white border-stone-900"
              : "bg-white text-stone-600 border-stone-200 hover:border-stone-900"
          }`}
        >
          <Mail className="w-3.5 h-3.5" />
          Messages ({messages.filter((m) => !m.is_read).length} unread)
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("subscribers")}
          className={`px-4 py-2 text-xs font-sans uppercase tracking-wider border transition-colors ${
            activeTab === "subscribers"
              ? "bg-stone-900 text-white border-stone-900"
              : "bg-white text-stone-600 border-stone-200 hover:border-stone-900"
          }`}
        >
          Newsletter ({subscribers.filter((s) => s.is_active).length} active)
        </button>
      </div>

      {activeTab === "messages" ? (
        <DataTable
          data={messages as unknown as Record<string, unknown>[]}
          columns={msgColumns as unknown as Column<Record<string, unknown>>[]}
          searchKey="name"
          searchPlaceholder="Search messages by name or email..."
          pageSize={10}
        />
      ) : (
        <DataTable
          data={subscribers as unknown as Record<string, unknown>[]}
          columns={subColumns as unknown as Column<Record<string, unknown>>[]}
          searchKey="email"
          searchPlaceholder="Search subscribers by email..."
          pageSize={15}
        />
      )}

      <ConfirmDialog
        open={Boolean(deleteId)}
        onOpenChange={(open) => !open && setDeleteId(null)}
        title="Delete Message"
        description="This will permanently remove this contact message."
        confirmLabel="Delete"
        onConfirm={handleDelete}
      />
    </div>
  );
}
