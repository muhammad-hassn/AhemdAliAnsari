import { getAdminCustomers } from "@/server/queries/admin";
import { DataTable, type Column } from "@/components/admin/DataTable";
import { formatPkr, formatDate } from "@/lib/format";
import type { AdminCustomer } from "@/types";

export default async function AdminCustomersPage() {
  const customers = await getAdminCustomers();

  const columns: Column<AdminCustomer>[] = [
    {
      header: "Customer",
      cell: (row) => (
        <div className="text-xs">
          <span className="font-medium text-stone-900 font-serif block">{row.fullName}</span>
          {row.phone && (
            <span className="text-stone-400 font-mono text-[10px] block">{row.phone}</span>
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
        <span className="text-xs text-stone-500 font-sans">{formatDate(row.createdAt)}</span>
      ),
      sortable: true,
      accessorKey: "createdAt",
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif text-2xl font-normal text-stone-900 tracking-wide">
          Client Database
        </h1>
        <p className="text-xs text-stone-500 font-sans mt-0.5">
          Registered clients, order frequency, and lifetime spend.
        </p>
      </div>

      <DataTable
        data={customers as unknown as Record<string, unknown>[]}
        columns={columns as unknown as Column<Record<string, unknown>>[]}
        searchKey="fullName"
        searchPlaceholder="Search clients by name..."
        pageSize={15}
        getItemId={(item) => String(item.id)}
      />
    </div>
  );
}
