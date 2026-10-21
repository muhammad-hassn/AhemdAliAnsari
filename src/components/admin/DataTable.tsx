"use client";

import React, { useState, useMemo } from "react";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { ChevronLeft, ChevronRight, ArrowUpDown, Search } from "lucide-react";
import { EmptyState } from "./EmptyState";

export interface Column<T> {
  header: string;
  accessorKey?: keyof T;
  cell?: (row: T) => React.ReactNode;
  sortable?: boolean;
  className?: string;
}

interface DataTableProps<T> {
  data: T[];
  columns: Column<T>[];
  searchKey?: keyof T;
  searchPlaceholder?: string;
  pageSize?: number;
  bulkActions?: (selectedRows: T[]) => React.ReactNode;
  getItemId?: (item: T) => string;
}

export function DataTable<T extends Record<string, unknown>>({
  data,
  columns,
  searchKey,
  searchPlaceholder = "Search...",
  pageSize = 10,
  bulkActions,
  getItemId = (item) => String(item.id || Math.random()),
}: DataTableProps<T>) {
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [sortField, setSortField] = useState<keyof T | null>(null);
  const [sortAsc, setSortAsc] = useState(true);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  // Filter
  const filteredData = useMemo(() => {
    if (!searchKey || !searchTerm.trim()) return data;
    const term = searchTerm.toLowerCase();
    return data.filter((item) => {
      const val = item[searchKey];
      return val ? String(val).toLowerCase().includes(term) : false;
    });
  }, [data, searchKey, searchTerm]);

  // Sort
  const sortedData = useMemo(() => {
    if (!sortField) return filteredData;
    return [...filteredData].sort((a, b) => {
      const aVal = a[sortField];
      const bVal = b[sortField];
      if (aVal === bVal) return 0;
      if (aVal === undefined || aVal === null) return 1;
      if (bVal === undefined || bVal === null) return -1;
      const comp = aVal < bVal ? -1 : 1;
      return sortAsc ? comp : -comp;
    });
  }, [filteredData, sortField, sortAsc]);

  // Paginate
  const totalPages = Math.max(1, Math.ceil(sortedData.length / pageSize));
  const paginatedData = useMemo(() => {
    const from = (currentPage - 1) * pageSize;
    return sortedData.slice(from, from + pageSize);
  }, [sortedData, currentPage, pageSize]);

  const handleSort = (key: keyof T) => {
    if (sortField === key) {
      setSortAsc(!sortAsc);
    } else {
      setSortField(key);
      setSortAsc(true);
    }
  };

  const toggleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedIds(paginatedData.map(getItemId));
    } else {
      setSelectedIds([]);
    }
  };

  const toggleSelectRow = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id],
    );
  };

  const selectedRows = useMemo(() => {
    return data.filter((item) => selectedIds.includes(getItemId(item)));
  }, [data, selectedIds, getItemId]);

  return (
    <div className="space-y-4">
      {/* Top Search & Bulk Actions Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        {searchKey && (
          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
            <Input
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              placeholder={searchPlaceholder}
              className="pl-9 h-9 text-xs"
            />
          </div>
        )}
        {bulkActions && selectedIds.length > 0 && (
          <div className="flex items-center gap-2">
            <span className="text-xs text-stone-500 font-sans">
              {selectedIds.length} selected
            </span>
            {bulkActions(selectedRows)}
          </div>
        )}
      </div>

      {/* Desktop Table View */}
      <div className="hidden md:block overflow-x-auto border border-stone-200 bg-white">
        <table className="w-full text-left text-xs font-sans">
          <thead className="bg-stone-50 border-b border-stone-200 text-stone-600 uppercase tracking-wider font-medium">
            <tr>
              {bulkActions && (
                <th className="p-3 w-10 text-center">
                  <input
                    type="checkbox"
                    checked={
                      paginatedData.length > 0 &&
                      paginatedData.every((item) =>
                        selectedIds.includes(getItemId(item)),
                      )
                    }
                    onChange={(e) => toggleSelectAll(e.target.checked)}
                    className="rounded border-stone-300"
                  />
                </th>
              )}
              {columns.map((col, idx) => (
                <th
                  key={idx}
                  className={`p-3 ${col.className || ""}`}
                  onClick={() =>
                    col.sortable && col.accessorKey && handleSort(col.accessorKey)
                  }
                >
                  <div className="flex items-center gap-1.5 cursor-pointer select-none">
                    <span>{col.header}</span>
                    {col.sortable && (
                      <ArrowUpDown className="w-3 h-3 text-stone-400" />
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-stone-100 text-stone-800">
            {paginatedData.length === 0 ? (
              <tr>
                <td
                  colSpan={columns.length + (bulkActions ? 1 : 0)}
                  className="p-4"
                >
                  <EmptyState
                    icon={Search}
                    title="No records found"
                    description="No entries matched your current filters or search query."
                  />
                </td>
              </tr>
            ) : (
              paginatedData.map((item) => {
                const id = getItemId(item);
                const isSelected = selectedIds.includes(id);
                return (
                  <tr
                    key={id}
                    className={`hover:bg-stone-50/80 transition-colors ${
                      isSelected ? "bg-stone-50" : ""
                    }`}
                  >
                    {bulkActions && (
                      <td className="p-3 w-10 text-center">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => toggleSelectRow(id)}
                          className="rounded border-stone-300"
                        />
                      </td>
                    )}
                    {columns.map((col, idx) => (
                      <td key={idx} className={`p-3 ${col.className || ""}`}>
                        {col.cell
                          ? col.cell(item)
                          : col.accessorKey
                            ? String(item[col.accessorKey] ?? "-")
                            : null}
                      </td>
                    ))}
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Mobile Stacked Card View */}
      <div className="block md:hidden space-y-3">
        {paginatedData.length === 0 ? (
          <EmptyState
            icon={Search}
            title="No records found"
            description="No entries matched your current filters or search query."
          />
        ) : (
          paginatedData.map((item) => {
            const id = getItemId(item);
            const isSelected = selectedIds.includes(id);
            return (
              <div
                key={id}
                className={`p-4 border border-stone-200 bg-white space-y-2 text-xs font-sans ${
                  isSelected ? "border-stone-900 bg-stone-50/50" : ""
                }`}
              >
                {bulkActions && (
                  <div className="flex items-center justify-between pb-2 border-b border-stone-100">
                    <span className="text-stone-400 font-mono text-[10px]">
                      ID: {id.slice(0, 8)}
                    </span>
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => toggleSelectRow(id)}
                      className="rounded border-stone-300"
                    />
                  </div>
                )}
                {columns.map((col, idx) => (
                  <div key={idx} className="flex items-start justify-between gap-2">
                    <span className="text-stone-500 font-medium">{col.header}:</span>
                    <span className="text-right text-stone-900">
                      {col.cell
                        ? col.cell(item)
                        : col.accessorKey
                          ? String(item[col.accessorKey] ?? "-")
                          : null}
                    </span>
                  </div>
                ))}
              </div>
            );
          })
        )}
      </div>

      {/* Pagination Bar */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between text-xs text-stone-600 font-sans pt-2">
          <span>
            Page {currentPage} of {totalPages} ({sortedData.length} items)
          </span>
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={currentPage <= 1}
              onClick={() => setCurrentPage((p) => p - 1)}
              className="h-8 px-2"
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={currentPage >= totalPages}
              onClick={() => setCurrentPage((p) => p + 1)}
              className="h-8 px-2"
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
