"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { DataTable, type Column } from "@/components/admin/DataTable";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { Button } from "@/components/ui/Button";
import { formatPkr, formatDate } from "@/lib/format";
import { Eye, Filter } from "lucide-react";
import type { Order } from "@/types";

const STATUS_OPTIONS = ["all", "pending", "confirmed", "shipped", "delivered", "cancelled"];

interface OrderListTableProps {
  orders: Order[];
}

export function OrderListTable({ orders }: OrderListTableProps) {
  const router = useRouter();
  const [statusFilter, setStatusFilter] = useState("all");

  const filtered = statusFilter === "all"
    ? orders
    : orders.filter((o) => o.status === statusFilter);

  const columns: Column<Order>[] = [
    {
      header: "Order",
      cell: (row) => (
        <Link
          href={`/admin/orders/${row.id}`}
          className="font-mono text-xs font-medium text-stone-900 hover:text-amber-800"
        >
          {row.order_number}
        </Link>
      ),
      sortable: true,
      accessorKey: "order_number",
    },
    {
      header: "Customer",
      cell: (row) => (
        <div className="text-xs">
          <span className="font-medium text-stone-900 block">
            {row.shipping_address?.full_name || row.guest_email || "Registered Client"}
          </span>
          {row.guest_email && (
            <span className="text-stone-400 font-mono text-[10px] block">
              {row.guest_email}
            </span>
          )}
        </div>
      ),
    },
    {
      header: "Amount",
      cell: (row) => (
        <span className="font-mono text-xs font-medium text-stone-900">
          {formatPkr(row.total_pkr)}
        </span>
      ),
      sortable: true,
      accessorKey: "total_pkr",
    },
    {
      header: "Payment",
      cell: (row) => <StatusBadge status={row.payment_status} />,
    },
    {
      header: "Status",
      cell: (row) => <StatusBadge status={row.status} />,
    },
    {
      header: "Date",
      cell: (row) => (
        <span className="text-xs text-stone-500 font-sans">
          {formatDate(row.created_at)}
        </span>
      ),
      sortable: true,
      accessorKey: "created_at",
    },
    {
      header: "",
      cell: (row) => (
        <Button asChild variant="ghost" size="sm" className="h-7 w-7 p-0 text-stone-600">
          <Link href={`/admin/orders/${row.id}`} title="View Details">
            <Eye className="w-3.5 h-3.5" />
          </Link>
        </Button>
      ),
      className: "text-right",
    },
  ];

  return (
    <div className="space-y-4">
      {/* Status Filter Tabs */}
      <div className="flex flex-wrap items-center gap-2">
        <Filter className="w-3.5 h-3.5 text-stone-400" />
        {STATUS_OPTIONS.map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => { setStatusFilter(s); router.refresh(); }}
            className={`px-3 py-1 text-xs font-sans uppercase tracking-wider transition-colors border ${
              statusFilter === s
                ? "bg-stone-900 text-white border-stone-900"
                : "bg-white text-stone-600 border-stone-200 hover:border-stone-900 hover:text-stone-900"
            }`}
          >
            {s}
          </button>
        ))}
      </div>

      <DataTable
        data={filtered as unknown as Record<string, unknown>[]}
        columns={columns as unknown as Column<Record<string, unknown>>[]}
        searchKey="order_number"
        searchPlaceholder="Search by order number..."
        pageSize={15}
        getItemId={(item) => String(item.id)}
      />
    </div>
  );
}
