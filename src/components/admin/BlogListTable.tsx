"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { DataTable, type Column } from "@/components/admin/DataTable";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { Button } from "@/components/ui/Button";
import { ConfirmDialog } from "@/components/admin/ConfirmDialog";
import { deleteBlogPostAction } from "@/server/actions/admin";
import { formatDate } from "@/lib/format";
import { Plus, Edit2, Trash2, Eye } from "lucide-react";
import type { BlogPost } from "@/types";

interface BlogListTableProps {
  posts: BlogPost[];
}

export function BlogListTable({ posts }: BlogListTableProps) {
  const router = useRouter();
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);

  const handleDelete = async () => {
    if (!deleteTargetId) return;
    await deleteBlogPostAction(deleteTargetId);
    setDeleteTargetId(null);
    router.refresh();
  };

  const columns: Column<BlogPost>[] = [
    {
      header: "Title",
      cell: (row) => (
        <div>
          <Link
            href={`/admin/blog/${row.id}`}
            className="font-serif font-medium text-stone-900 hover:text-amber-800 text-sm line-clamp-1"
          >
            {row.title}
          </Link>
          <span className="text-[10px] text-stone-400 font-mono block">/{row.slug}</span>
        </div>
      ),
      sortable: true,
      accessorKey: "title",
    },
    {
      header: "Category",
      cell: (row) => (
        <span className="text-xs text-stone-600">
          {row.category?.name || "Uncategorised"}
        </span>
      ),
    },
    {
      header: "Author",
      cell: (row) => (
        <span className="text-xs text-stone-600">
          {row.author?.name || "Ali Ahmed Ansari"}
        </span>
      ),
    },
    {
      header: "Read",
      cell: (row) => (
        <span className="text-xs font-mono text-stone-500">{row.reading_time}m</span>
      ),
    },
    {
      header: "Status",
      cell: (row) => <StatusBadge status={row.status} />,
    },
    {
      header: "Published",
      cell: (row) => (
        <span className="text-xs text-stone-500 font-sans">
          {row.published_at ? formatDate(row.published_at) : "—"}
        </span>
      ),
      sortable: true,
      accessorKey: "published_at",
    },
    {
      header: "Actions",
      cell: (row) => (
        <div className="flex items-center justify-end gap-1">
          {row.status === "published" && (
            <Button asChild variant="ghost" size="sm" className="h-7 w-7 p-0 text-stone-500">
              <Link href={`/blog/${row.slug}`} target="_blank" title="View Live">
                <Eye className="w-3.5 h-3.5" />
              </Link>
            </Button>
          )}
          <Button asChild variant="ghost" size="sm" className="h-7 w-7 p-0 text-stone-700">
            <Link href={`/admin/blog/${row.id}`} title="Edit Post">
              <Edit2 className="w-3.5 h-3.5" />
            </Link>
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => setDeleteTargetId(row.id)}
            className="h-7 w-7 p-0 text-red-600 hover:text-red-700"
            title="Delete Post"
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
        data={posts as unknown as Record<string, unknown>[]}
        columns={columns as unknown as Column<Record<string, unknown>>[]}
        searchKey="title"
        searchPlaceholder="Search posts by title..."
        pageSize={12}
      />

      <ConfirmDialog
        open={Boolean(deleteTargetId)}
        onOpenChange={(open) => !open && setDeleteTargetId(null)}
        title="Delete Blog Post"
        description="This will permanently remove the post and its tags. This action cannot be undone."
        confirmLabel="Delete Post"
        onConfirm={handleDelete}
      />
    </>
  );
}

export function BlogListHeader() {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <div>
        <h1 className="font-serif text-2xl font-normal text-stone-900 tracking-wide">
          Blog & Editorial
        </h1>
        <p className="text-xs text-stone-500 font-sans mt-0.5">
          Manage published stories, styling guides, and brand editorial.
        </p>
      </div>
      <Button asChild variant="solid" size="sm">
        <Link href="/admin/blog/new">
          <Plus className="w-4 h-4 mr-1.5" />
          New Post
        </Link>
      </Button>
    </div>
  );
}
