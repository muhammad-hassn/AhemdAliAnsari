"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { DataTable, type Column } from "@/components/admin/DataTable";
import { Button } from "@/components/ui/Button";
import { ConfirmDialog } from "@/components/admin/ConfirmDialog";
import { formatPkr } from "@/lib/format";
import { deleteProductAction, duplicateProductAction } from "@/server/actions/admin";
import { Copy, Trash2, Edit2, Eye } from "lucide-react";
import type { Product } from "@/types";

interface ProductListTableProps {
  products: Product[];
}

export function ProductListTable({ products }: ProductListTableProps) {
  const router = useRouter();
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);
  const [duplicatingId, setDuplicatingId] = useState<string | null>(null);

  const handleDelete = async () => {
    if (!deleteTargetId) return;
    await deleteProductAction(deleteTargetId);
    setDeleteTargetId(null);
    router.refresh();
  };

  const handleDuplicate = async (id: string) => {
    setDuplicatingId(id);
    const res = await duplicateProductAction(id);
    setDuplicatingId(null);
    if (res.success && res.data) {
      router.push(`/admin/products/${res.data.id}`);
      router.refresh();
    }
  };

  const columns: Column<Product>[] = [
    {
      header: "Garment",
      cell: (row) => (
        <div className="flex items-center gap-3">
          <div className="relative w-10 h-14 bg-stone-100 overflow-hidden shrink-0 border border-stone-200">
            {row.images?.[0] ? (
              <Image
                src={row.images[0]}
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
              href={`/admin/products/${row.id}`}
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
      header: "Collection",
      cell: (row) => (
        <span className="text-xs text-stone-600">
          {(row as Product & { collection?: { name: string } | null }).collection?.name || "Standalone"}
        </span>
      ),
    },
    {
      header: "Price",
      cell: (row) => (
        <span className="font-mono text-xs font-medium text-stone-900">
          {formatPkr(row.price_pkr)}
        </span>
      ),
      sortable: true,
      accessorKey: "price_pkr",
    },
    {
      header: "Stock",
      cell: (row) => {
        const total = row.stock
          ? Object.values(row.stock).reduce((a, b) => a + b, 0)
          : 0;
        return (
          <span
            className={`text-xs font-mono font-medium ${
              total === 0
                ? "text-red-600"
                : total <= 5
                  ? "text-amber-600"
                  : "text-stone-700"
            }`}
          >
            {total} units
          </span>
        );
      },
    },
    {
      header: "Status",
      cell: (row) => (
        <span
          className={`inline-flex items-center px-1.5 py-0.5 text-[10px] uppercase font-mono tracking-wider border ${
            row.is_active
              ? "bg-emerald-50 text-emerald-800 border-emerald-300"
              : "bg-stone-100 text-stone-600 border-stone-200"
          }`}
        >
          {row.is_active ? "Active" : "Draft"}
        </span>
      ),
    },
    {
      header: "Actions",
      cell: (row) => (
        <div className="flex items-center justify-end gap-1">
          <Button asChild variant="ghost" size="sm" className="h-7 w-7 p-0 text-stone-500">
            <Link href={`/product/${row.slug}`} target="_blank" title="Preview on Store">
              <Eye className="w-3.5 h-3.5" />
            </Link>
          </Button>
          <Button asChild variant="ghost" size="sm" className="h-7 w-7 p-0 text-stone-700">
            <Link href={`/admin/products/${row.id}`} title="Edit Garment">
              <Edit2 className="w-3.5 h-3.5" />
            </Link>
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => handleDuplicate(row.id)}
            disabled={duplicatingId === row.id}
            className="h-7 w-7 p-0 text-stone-500 hover:text-stone-900"
            title="Duplicate Product"
          >
            <Copy className="w-3.5 h-3.5" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => setDeleteTargetId(row.id)}
            className="h-7 w-7 p-0 text-red-600 hover:text-red-700"
            title="Delete Garment"
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
        data={products as unknown as Record<string, unknown>[]}
        columns={columns as unknown as Column<Record<string, unknown>>[]}
        searchKey="name"
        searchPlaceholder="Search garments by title..."
        pageSize={12}
      />

      <ConfirmDialog
        open={Boolean(deleteTargetId)}
        onOpenChange={(open) => !open && setDeleteTargetId(null)}
        title="Delete Garment"
        description="Are you sure you want to delete this product? This will remove its inventory and variant data permanently."
        confirmLabel="Delete Garment"
        onConfirm={handleDelete}
      />
    </>
  );
}
