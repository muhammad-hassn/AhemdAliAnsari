"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { DataTable, type Column } from "@/components/admin/DataTable";
import { Button } from "@/components/ui/Button";
import { ConfirmDialog } from "@/components/admin/ConfirmDialog";
import { deleteCollectionAction } from "@/server/actions/admin";
import { Trash2, Edit2, Eye } from "lucide-react";
import type { Collection } from "@/types";

interface CollectionListTableProps {
  collections: Collection[];
}

export function CollectionListTable({ collections }: CollectionListTableProps) {
  const router = useRouter();
  const [items, setItems] = useState<Collection[]>(collections);
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    setItems(collections);
  }, [collections]);

  const handleDelete = async () => {
    if (!deleteTargetId) return;
    setIsDeleting(true);
    try {
      const res = await deleteCollectionAction(deleteTargetId);
      if (!res.success) {
        alert(res.error || "Failed to delete collection");
        setIsDeleting(false);
        return;
      }
      setItems((prev) => prev.filter((item) => item.id !== deleteTargetId));
      setDeleteTargetId(null);
      router.refresh();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Error deleting collection");
    } finally {
      setIsDeleting(false);
    }
  };

  const columns: Column<Collection>[] = [
    {
      header: "Collection",
      cell: (row) => (
        <div className="flex items-center gap-3">
          <div className="relative w-10 h-14 bg-stone-100 overflow-hidden shrink-0 border border-stone-200">
            {row.image_url ? (
              <Image
                src={row.image_url}
                alt={row.name}
                fill
                sizes="40px"
                className="object-cover"
              />
            ) : (
              <div className="w-full h-full bg-stone-200" />
            )}
          </div>
          <div>
            <Link
              href={`/admin/collections/${row.id}`}
              className="font-serif font-medium text-stone-900 hover:text-amber-800 text-sm line-clamp-1"
            >
              {row.name}
            </Link>
            <span className="text-[10px] text-stone-400 font-mono block">
              /{row.slug}
            </span>
          </div>
        </div>
      ),
      sortable: true,
      accessorKey: "name",
    },
    {
      header: "Description",
      cell: (row) => (
        <p className="text-xs text-stone-500 line-clamp-1 max-w-sm">
          {row.description}
        </p>
      ),
    },
    {
      header: "Order",
      cell: (row) => (
        <span className="font-mono text-xs text-stone-600">
          {row.sort_order ?? 0}
        </span>
      ),
      sortable: true,
      accessorKey: "sort_order",
    },
    {
      header: "Actions",
      cell: (row) => (
        <div className="flex items-center justify-end gap-1">
          <Button asChild variant="ghost" size="sm" className="h-7 w-7 p-0 text-stone-500">
            <Link href={`/shop?collection=${row.slug}`} target="_blank" title="View in Shop">
              <Eye className="w-3.5 h-3.5" />
            </Link>
          </Button>
          <Button asChild variant="ghost" size="sm" className="h-7 w-7 p-0 text-stone-700">
            <Link href={`/admin/collections/${row.id}`} title="Edit Collection">
              <Edit2 className="w-3.5 h-3.5" />
            </Link>
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => setDeleteTargetId(row.id)}
            className="h-7 w-7 p-0 text-red-600 hover:text-red-700"
            title="Delete Collection"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </Button>
        </div>
      ),
      className: "text-right",
    },
  ];

  return (
    <>
      <DataTable
        data={items as unknown as Record<string, unknown>[]}
        columns={columns as unknown as Column<Record<string, unknown>>[]}
        searchKey="name"
        searchPlaceholder="Search collections..."
        pageSize={10}
      />

      <ConfirmDialog
        open={Boolean(deleteTargetId)}
        onOpenChange={(open) => !open && setDeleteTargetId(null)}
        title="Delete Collection"
        description="Are you sure you want to delete this collection? Products assigned to it will remain in inventory as standalone garments."
        confirmLabel="Delete Collection"
        onConfirm={handleDelete}
      />
    </>
  );
}
