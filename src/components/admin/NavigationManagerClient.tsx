"use client";

import { useState } from "react";
import { Plus, Edit2, Trash2, CheckCircle2, XCircle } from "lucide-react";
import type { NavigationItem } from "@/types";
import { saveNavigationItemAction, deleteNavigationItemAction } from "@/server/actions/admin";
import { ConfirmDialog } from "./ConfirmDialog";

interface NavigationManagerClientProps {
  initialItems: NavigationItem[];
}

export function NavigationManagerClient({ initialItems }: NavigationManagerClientProps) {
  const [items, setItems] = useState<NavigationItem[]>(initialItems);
  const [selectedLocation, setSelectedLocation] = useState<"header" | "footer">("header");
  const [editingItem, setEditingItem] = useState<Partial<NavigationItem> | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const filteredItems = items.filter((i) => i.location === selectedLocation);

  const handleCreateNew = () => {
    setEditingItem({
      location: selectedLocation,
      label: "",
      href: "/",
      sort_order: filteredItems.length + 1,
      is_active: true,
    });
  };

  const handleEdit = (item: NavigationItem) => {
    setEditingItem({ ...item });
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingItem) return;
    if (!editingItem.label || !editingItem.href || !editingItem.location) {
      setError("Please fill in label, link URL, and location.");
      return;
    }

    setLoading(true);
    setError(null);

    const res = await saveNavigationItemAction(
      editingItem as Partial<NavigationItem> & { location: "header" | "footer"; label: string; href: string },
    );

    setLoading(false);

    if (!res.success) {
      setError(res.error || "Failed to save navigation item");
      return;
    }

    const savedId = res.data?.id;
    if (!savedId) {
      setError("Failed to save navigation item: missing ID");
      return;
    }

    setItems((prev) => {
      const idx = prev.findIndex((i) => i.id === savedId);
      if (idx >= 0) {
        const updated = [...prev];
        updated[idx] = { ...(editingItem as NavigationItem), id: savedId };
        return updated.sort((a, b) => a.sort_order - b.sort_order);
      } else {
        return [...prev, { ...(editingItem as NavigationItem), id: savedId }].sort((a, b) => a.sort_order - b.sort_order);
      }
    });
    setEditingItem(null);
  };

  const handleDelete = async () => {
    if (!deletingId) return;
    setLoading(true);
    const res = await deleteNavigationItemAction(deletingId);
    setLoading(false);

    if (res.success) {
      setItems((prev) => prev.filter((i) => i.id !== deletingId));
      setDeletingId(null);
    } else {
      setError(res.error || "Failed to delete navigation item");
    }
  };

  return (
    <div className="space-y-6">
      {error && (
        <div className="p-3 text-xs bg-red-50 text-red-800 border border-red-200">
          {error}
        </div>
      )}

      {/* Tabs & Controls */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white border border-stone-200 p-4">
        <div className="flex border border-stone-200 p-0.5 bg-stone-50">
          <button
            onClick={() => setSelectedLocation("header")}
            className={`px-4 py-1.5 text-xs font-medium uppercase tracking-wider transition-colors ${
              selectedLocation === "header"
                ? "bg-white text-stone-900 shadow-sm"
                : "text-stone-500 hover:text-stone-900"
            }`}
          >
            Header Menu ({items.filter((i) => i.location === "header").length})
          </button>
          <button
            onClick={() => setSelectedLocation("footer")}
            className={`px-4 py-1.5 text-xs font-medium uppercase tracking-wider transition-colors ${
              selectedLocation === "footer"
                ? "bg-white text-stone-900 shadow-sm"
                : "text-stone-500 hover:text-stone-900"
            }`}
          >
            Footer Links ({items.filter((i) => i.location === "footer").length})
          </button>
        </div>

        <button
          onClick={handleCreateNew}
          className="inline-flex items-center gap-1.5 px-4 py-2 bg-stone-900 text-white text-xs uppercase tracking-wider font-medium hover:bg-stone-800 transition-colors"
        >
          <Plus className="w-3.5 h-3.5" />
          Add Navigation Link
        </button>
      </div>

      {/* Items Table */}
      <div className="bg-white border border-stone-200 overflow-hidden">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="border-b border-stone-200 bg-stone-50 text-stone-500 uppercase tracking-wider font-mono text-[10px]">
              <th className="py-3 px-4 w-16">Order</th>
              <th className="py-3 px-4">Label</th>
              <th className="py-3 px-4">Link URL</th>
              <th className="py-3 px-4 w-28">Status</th>
              <th className="py-3 px-4 text-right w-28">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-stone-100">
            {filteredItems.length === 0 ? (
              <tr>
                <td colSpan={5} className="py-8 text-center text-stone-400">
                  No {selectedLocation} navigation items configured.
                </td>
              </tr>
            ) : (
              filteredItems.map((item) => (
                <tr key={item.id} className="hover:bg-stone-50/50 transition-colors">
                  <td className="py-3 px-4 font-mono text-stone-500">#{item.sort_order}</td>
                  <td className="py-3 px-4 font-medium text-stone-900">{item.label}</td>
                  <td className="py-3 px-4 font-mono text-stone-600">{item.href}</td>
                  <td className="py-3 px-4">
                    {item.is_active ? (
                      <span className="inline-flex items-center gap-1 text-emerald-700 bg-emerald-50 px-2 py-0.5 text-[10px] uppercase font-medium">
                        <CheckCircle2 className="w-3 h-3" /> Active
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-stone-500 bg-stone-100 px-2 py-0.5 text-[10px] uppercase font-medium">
                        <XCircle className="w-3 h-3" /> Inactive
                      </span>
                    )}
                  </td>
                  <td className="py-3 px-4 text-right">
                    <div className="inline-flex items-center gap-2">
                      <button
                        onClick={() => handleEdit(item)}
                        className="p-1 text-stone-600 hover:text-stone-900 transition-colors"
                        title="Edit"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => setDeletingId(item.id)}
                        className="p-1 text-stone-400 hover:text-red-600 transition-colors"
                        title="Delete"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Edit / Create Modal */}
      {editingItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white border border-stone-200 w-full max-w-md p-6 space-y-4">
            <h3 className="font-serif text-xl text-stone-900">
              {editingItem.id ? "Edit Navigation Link" : "New Navigation Link"}
            </h3>

            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-stone-700 uppercase tracking-wider mb-1">
                  Location *
                </label>
                <select
                  value={editingItem.location || "header"}
                  onChange={(e) =>
                    setEditingItem((prev) => ({
                      ...prev,
                      location: e.target.value as "header" | "footer",
                    }))
                  }
                  className="w-full text-xs px-3 py-2 border border-stone-200 bg-white focus:outline-none focus:border-stone-900"
                >
                  <option value="header">Header</option>
                  <option value="footer">Footer</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-stone-700 uppercase tracking-wider mb-1">
                  Label *
                </label>
                <input
                  type="text"
                  required
                  value={editingItem.label || ""}
                  onChange={(e) => setEditingItem((prev) => ({ ...prev, label: e.target.value }))}
                  className="w-full text-xs px-3 py-2 border border-stone-200 bg-white focus:outline-none focus:border-stone-900"
                  placeholder="e.g. Formal Wear"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-stone-700 uppercase tracking-wider mb-1">
                  Target Link (href) *
                </label>
                <input
                  type="text"
                  required
                  value={editingItem.href || ""}
                  onChange={(e) => setEditingItem((prev) => ({ ...prev, href: e.target.value }))}
                  className="w-full text-xs px-3 py-2 border border-stone-200 bg-white focus:outline-none focus:border-stone-900"
                  placeholder="/collections/formal or https://..."
                />
              </div>

              <div className="grid grid-cols-2 gap-4 items-center pt-2">
                <div>
                  <label className="block text-xs font-medium text-stone-700 uppercase tracking-wider mb-1">
                    Sort Order
                  </label>
                  <input
                    type="number"
                    value={editingItem.sort_order ?? 0}
                    onChange={(e) => setEditingItem((prev) => ({ ...prev, sort_order: Number(e.target.value) }))}
                    className="w-full text-xs px-3 py-2 border border-stone-200 bg-white focus:outline-none focus:border-stone-900"
                  />
                </div>

                <div className="flex items-center gap-2 pt-4">
                  <input
                    type="checkbox"
                    id="nav-is-active"
                    checked={editingItem.is_active ?? true}
                    onChange={(e) => setEditingItem((prev) => ({ ...prev, is_active: e.target.checked }))}
                    className="rounded border-stone-300 text-stone-900 focus:ring-stone-900"
                  />
                  <label htmlFor="nav-is-active" className="text-xs text-stone-700 font-medium">
                    Active
                  </label>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t border-stone-100">
                <button
                  type="button"
                  onClick={() => setEditingItem(null)}
                  className="px-4 py-2 border border-stone-200 text-stone-700 text-xs uppercase tracking-wider hover:bg-stone-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-5 py-2 bg-stone-900 text-white text-xs uppercase tracking-wider font-medium hover:bg-stone-800 disabled:opacity-50"
                >
                  {loading ? "Saving..." : "Save Link"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation */}
      <ConfirmDialog
        open={Boolean(deletingId)}
        onOpenChange={(open) => {
          if (!open) setDeletingId(null);
        }}
        title="Delete Navigation Item"
        description="Are you sure you want to delete this navigation link?"
        confirmLabel={loading ? "Deleting..." : "Delete"}
        variant="danger"
        onConfirm={handleDelete}
      />
    </div>
  );
}
