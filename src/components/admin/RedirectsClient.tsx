"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { DataTable, type Column } from "@/components/admin/DataTable";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { FormSection } from "@/components/admin/FormSection";
import { ConfirmDialog } from "@/components/admin/ConfirmDialog";
import { saveRedirectAction, deleteRedirectAction } from "@/server/actions/admin";
import { formatDate } from "@/lib/format";
import { Plus, Trash2, Edit2, X } from "lucide-react";
import type { Redirect } from "@/types";

interface RedirectsClientProps {
  redirects: Redirect[];
}

const EMPTY_FORM = { id: undefined as string | undefined, from_path: "", to_path: "", status_code: 301, is_active: true };

export function RedirectsClient({ redirects }: RedirectsClientProps) {
  const router = useRouter();
  const [form, setForm] = useState<typeof EMPTY_FORM | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form) return;
    setSaving(true);
    setError(null);

    const res = await saveRedirectAction({
      id: form.id,
      from_path: form.from_path,
      to_path: form.to_path,
      status_code: form.status_code as 301 | 302,
      is_active: form.is_active,
    });

    setSaving(false);

    if (!res.success) {
      setError(res.error || "Failed to save redirect");
      return;
    }

    setForm(null);
    router.refresh();
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    await deleteRedirectAction(deleteId);
    setDeleteId(null);
    router.refresh();
  };

  const columns: Column<Redirect>[] = [
    {
      header: "From Path",
      cell: (row) => (
        <span className="font-mono text-xs text-stone-900">{row.from_path}</span>
      ),
      sortable: true,
      accessorKey: "from_path",
    },
    {
      header: "To Path",
      cell: (row) => (
        <span className="font-mono text-xs text-stone-600">{row.to_path}</span>
      ),
    },
    {
      header: "Type",
      cell: (row) => (
        <span className="font-mono text-xs font-medium text-stone-900">
          {row.status_code}
        </span>
      ),
    },
    {
      header: "Active",
      cell: (row) => (
        <span className={`text-[10px] font-mono uppercase px-1.5 py-0.5 border ${
          row.is_active
            ? "bg-emerald-50 text-emerald-800 border-emerald-300"
            : "bg-stone-100 text-stone-500 border-stone-200"
        }`}>
          {row.is_active ? "On" : "Off"}
        </span>
      ),
    },
    {
      header: "Added",
      cell: (row) => (
        <span className="text-xs text-stone-500">{formatDate(row.created_at)}</span>
      ),
      sortable: true,
      accessorKey: "created_at",
    },
    {
      header: "",
      cell: (row) => (
        <div className="flex items-center justify-end gap-1">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => setForm({
              id: row.id,
              from_path: row.from_path,
              to_path: row.to_path,
              status_code: row.status_code,
              is_active: row.is_active,
            })}
            className="h-7 w-7 p-0 text-stone-600"
          >
            <Edit2 className="w-3.5 h-3.5" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => setDeleteId(row.id)}
            className="h-7 w-7 p-0 text-red-600"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </Button>
        </div>
      ),
      className: "text-right",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Add / Edit Form */}
      {form ? (
        <FormSection
          title={form.id ? "Edit Redirect" : "Add New Redirect"}
          action={
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setForm(null)}
              className="h-7 w-7 p-0 text-stone-500"
            >
              <X className="w-4 h-4" />
            </Button>
          }
        >
          <form onSubmit={handleSave} className="space-y-4">
            {error && (
              <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs font-sans">
                {error}
              </div>
            )}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs uppercase tracking-wider text-stone-700 font-medium font-sans mb-1">
                  From Path *
                </label>
                <Input
                  required
                  value={form.from_path}
                  onChange={(e) => setForm({ ...form, from_path: e.target.value })}
                  placeholder="/old-garment-name"
                />
              </div>
              <div>
                <label className="block text-xs uppercase tracking-wider text-stone-700 font-medium font-sans mb-1">
                  To Path *
                </label>
                <Input
                  required
                  value={form.to_path}
                  onChange={(e) => setForm({ ...form, to_path: e.target.value })}
                  placeholder="/product/new-garment-name"
                />
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs uppercase tracking-wider text-stone-700 font-medium font-sans mb-1">
                  Status Code
                </label>
                <select
                  value={form.status_code}
                  onChange={(e) => setForm({ ...form, status_code: Number(e.target.value) })}
                  className="w-full h-10 px-3 border border-stone-300 bg-white text-sm text-stone-900 font-sans focus:outline-none focus:border-stone-900"
                >
                  <option value="301">301 — Permanent</option>
                  <option value="302">302 — Temporary</option>
                </select>
              </div>
              <div className="flex items-center gap-2 mt-6">
                <input
                  type="checkbox"
                  id="redirect-active"
                  checked={form.is_active}
                  onChange={(e) => setForm({ ...form, is_active: e.target.checked })}
                  className="w-4 h-4 rounded border-stone-300"
                />
                <label htmlFor="redirect-active" className="text-xs font-sans text-stone-800 cursor-pointer">
                  Active
                </label>
              </div>
            </div>
            <div className="flex justify-end gap-3">
              <Button type="button" variant="ghost" size="sm" onClick={() => setForm(null)}>
                Cancel
              </Button>
              <Button type="submit" variant="solid" size="sm" disabled={saving}>
                {saving ? "Saving..." : form.id ? "Update" : "Add Redirect"}
              </Button>
            </div>
          </form>
        </FormSection>
      ) : (
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => setForm(EMPTY_FORM)}
        >
          <Plus className="w-4 h-4 mr-1.5" />
          Add Redirect
        </Button>
      )}

      <DataTable
        data={redirects as unknown as Record<string, unknown>[]}
        columns={columns as unknown as Column<Record<string, unknown>>[]}
        searchKey="from_path"
        searchPlaceholder="Search by path..."
        pageSize={15}
      />

      <ConfirmDialog
        open={Boolean(deleteId)}
        onOpenChange={(open) => !open && setDeleteId(null)}
        title="Delete Redirect"
        description="This redirect rule will be permanently removed."
        confirmLabel="Delete"
        onConfirm={handleDelete}
      />
    </div>
  );
}
