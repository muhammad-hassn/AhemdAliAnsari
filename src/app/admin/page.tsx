import Link from "next/link";
import { getAdminDashboardStats } from "@/server/queries/admin";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { formatPkr } from "@/lib/format";
import {
  TrendingUp,
  ShoppingBag,
  Clock,
  AlertTriangle,
  ArrowRight,
  Shirt,
} from "lucide-react";

export default async function AdminDashboardPage() {
  const stats = await getAdminDashboardStats();

  return (
    <div className="space-y-8">
      {/* Page Title */}
      <div>
        <h1 className="font-serif text-2xl sm:text-3xl font-normal text-stone-900 tracking-wide">
          Executive Dashboard
        </h1>
        <p className="text-xs text-stone-500 font-sans mt-1">
          Store overview, sales performance and inventory alerts.
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Revenue */}
        <div className="p-5 border border-stone-200 bg-white">
          <div className="flex items-center justify-between text-stone-500 mb-2">
            <span className="text-xs uppercase tracking-wider font-sans font-medium">
              Gross Revenue
            </span>
            <TrendingUp className="w-4 h-4 text-amber-600" />
          </div>
          <div className="font-serif text-2xl font-normal text-stone-900">
            {formatPkr(stats.totalRevenuePkr)}
          </div>
          <p className="text-[10px] text-stone-400 font-sans mt-1">
            Confirmed & active orders
          </p>
        </div>

        {/* Total Orders */}
        <div className="p-5 border border-stone-200 bg-white">
          <div className="flex items-center justify-between text-stone-500 mb-2">
            <span className="text-xs uppercase tracking-wider font-sans font-medium">
              Total Orders
            </span>
            <ShoppingBag className="w-4 h-4 text-stone-600" />
          </div>
          <div className="font-serif text-2xl font-normal text-stone-900">
            {stats.ordersCount}
          </div>
          <p className="text-[10px] text-stone-400 font-sans mt-1">
            All-time placed orders
          </p>
        </div>

        {/* Pending Orders */}
        <div className="p-5 border border-stone-200 bg-white">
          <div className="flex items-center justify-between text-stone-500 mb-2">
            <span className="text-xs uppercase tracking-wider font-sans font-medium">
              Pending Orders
            </span>
            <Clock className="w-4 h-4 text-amber-600" />
          </div>
          <div className="font-serif text-2xl font-normal text-amber-700">
            {stats.pendingOrdersCount}
          </div>
          <p className="text-[10px] text-stone-400 font-sans mt-1">
            Awaiting proof or confirmation
          </p>
        </div>

        {/* Low Stock Alerts */}
        <div className="p-5 border border-stone-200 bg-white">
          <div className="flex items-center justify-between text-stone-500 mb-2">
            <span className="text-xs uppercase tracking-wider font-sans font-medium">
              Low Stock Items
            </span>
            <AlertTriangle className="w-4 h-4 text-red-600" />
          </div>
          <div className="font-serif text-2xl font-normal text-stone-900">
            {stats.lowStockCount}
          </div>
          <p className="text-[10px] text-stone-400 font-sans mt-1">
            Variants with &le; 5 units remaining
          </p>
        </div>
      </div>

      {/* Grid: Recent Orders & Low Stock List */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Orders (2 Columns) */}
        <div className="lg:col-span-2 border border-stone-200 bg-white p-6">
          <div className="flex items-center justify-between pb-4 mb-4 border-b border-stone-100">
            <div>
              <h2 className="font-serif text-lg font-medium text-stone-900">
                Recent Orders
              </h2>
              <p className="text-xs text-stone-500 font-sans">
                Latest client orders and statuses.
              </p>
            </div>
            <Link
              href="/admin/orders"
              className="text-xs font-sans text-stone-700 hover:text-stone-900 flex items-center gap-1 font-medium"
            >
              View all orders
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {stats.recentOrders.length === 0 ? (
            <div className="py-12 text-center text-xs text-stone-400 font-sans">
              No orders placed yet.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-sans">
                <thead className="bg-stone-50 text-stone-500 uppercase tracking-wider text-[10px]">
                  <tr>
                    <th className="p-2.5">Order</th>
                    <th className="p-2.5">Customer</th>
                    <th className="p-2.5">Total</th>
                    <th className="p-2.5">Status</th>
                    <th className="p-2.5 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100 text-stone-800">
                  {stats.recentOrders.map((order) => (
                    <tr key={order.id} className="hover:bg-stone-50/50">
                      <td className="p-2.5 font-mono font-medium text-stone-900">
                        {order.order_number}
                      </td>
                      <td className="p-2.5 truncate max-w-[140px]">
                        {order.shipping_address?.full_name || order.guest_email || "Client"}
                      </td>
                      <td className="p-2.5 font-mono">
                        {formatPkr(order.total_pkr)}
                      </td>
                      <td className="p-2.5">
                        <StatusBadge status={order.status} />
                      </td>
                      <td className="p-2.5 text-right">
                        <Link
                          href={`/admin/orders/${order.id}`}
                          className="text-stone-900 hover:text-amber-700 font-medium underline"
                        >
                          Details
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Low Stock Watchlist (1 Column) */}
        <div className="border border-stone-200 bg-white p-6">
          <div className="flex items-center justify-between pb-4 mb-4 border-b border-stone-100">
            <div>
              <h2 className="font-serif text-lg font-medium text-stone-900">
                Low Stock Alert
              </h2>
              <p className="text-xs text-stone-500 font-sans">
                Replenishment required
              </p>
            </div>
            <Link
              href="/admin/products"
              className="text-xs font-sans text-stone-700 hover:text-stone-900 font-medium"
            >
              Inventory
            </Link>
          </div>

          {stats.lowStockProducts.length === 0 ? (
            <div className="py-12 text-center text-xs text-stone-400 font-sans">
              All variants are sufficiently stocked.
            </div>
          ) : (
            <div className="space-y-3">
              {stats.lowStockProducts.map((item, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between p-2.5 bg-stone-50 border border-stone-100 text-xs font-sans"
                >
                  <div className="flex items-center gap-2 truncate pr-2">
                    <Shirt className="w-3.5 h-3.5 text-stone-400 shrink-0" />
                    <span className="font-medium text-stone-900 truncate">
                      {item.name}
                    </span>
                    <span className="px-1 py-0.5 bg-white text-stone-600 border border-stone-200 text-[10px] font-mono">
                      {item.size}
                    </span>
                  </div>
                  <span className="text-red-700 font-mono font-medium shrink-0">
                    {item.quantity} left
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Top Performing Products */}
      {stats.topProducts.length > 0 && (
        <div className="border border-stone-200 bg-white p-6">
          <h2 className="font-serif text-lg font-medium text-stone-900 mb-4 pb-2 border-b border-stone-100">
            Top Performing Designs
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            {stats.topProducts.map((prod, idx) => (
              <div
                key={prod.id}
                className="p-4 border border-stone-100 bg-stone-50/50 flex flex-col justify-between"
              >
                <div>
                  <span className="text-[10px] font-mono text-stone-400 block mb-1">
                    Rank #{idx + 1}
                  </span>
                  <h3 className="font-serif text-sm font-medium text-stone-900 line-clamp-1 mb-1">
                    {prod.name}
                  </h3>
                  <p className="text-xs text-stone-600 font-mono">
                    {formatPkr(prod.pricePkr)}
                  </p>
                </div>
                <div className="mt-4 pt-2 border-t border-stone-200/60 flex items-center justify-between text-xs font-sans">
                  <span className="text-stone-500">{prod.salesCount} sold</span>
                  <span className="font-mono font-medium text-stone-800">
                    {formatPkr(prod.revenuePkr)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
