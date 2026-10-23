"use client";

import React from "react";
import { DataTable, type Column } from "@/components/admin/DataTable";
import { formatPkr, formatDate } from "@/lib/format";
import type { AdminCustomer } from "@/types";

interface CustomerListTableProps {
  customers: AdminCustomer[];
}

export function CustomerListTable({ customers }: CustomerListTableProps) {
  const columns: Column<AdminCustomer>[] = [
    {
      header: "Customer",
      cell: (row) => (
        <div className="text-xs">
          <span className="font-medium text-stone-900 font-serif block">
            {row.fullName || "Unnamed Client"}
          </span>
          {row.phone && (
            <span className="text-stone-400 font-mono text-[10px] block">
              {row.phone}
            </span>
          )}
        </div>
      ),
      sortable: true,
      accessorKey: "fullName",
    },
    {
      header: "Orders",
      cell: (row) => (
        <span className="font-mono text-xs text-stone-700">{row.ordersCount}</span>
      ),
      sortable: true,
      accessorKey: "ordersCount",
    },
    {
      header: "Lifetime Value",
      cell: (row) => (
        <span className="font-mono text-xs font-medium text-stone-900">
          {formatPkr(row.totalSpentPkr)}
        </span>
      ),
      sortable: true,
      accessorKey: "totalSpentPkr",
    },
    {
      header: "Joined",
      cell: (row) => (
        <span className="text-xs text-stone-500 font-sans">
          {formatDate(row.createdAt)}
        </span>
      ),
      sortable: true,
      accessorKey: "createdAt",
    },
  ];

  return (
    <DataTable
      data={customers as unknown as Record<string, unknown>[]}
      columns={columns as unknown as Column<Record<string, unknown>>[]}
      searchKey="fullName"
      searchPlaceholder="Search clients by name..."
      pageSize={15}
      getItemId={(item) => String(item.id)}
    />
  );
}
