import { getAdminOrders } from "@/server/queries/admin";
import { OrderListTable } from "@/components/admin/OrderListTable";

export default async function AdminOrdersPage() {
  const orders = await getAdminOrders();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif text-2xl font-normal text-stone-900 tracking-wide">
          Order Management
        </h1>
        <p className="text-xs text-stone-500 font-sans mt-0.5">
          Track, manage and fulfil client orders across all statuses.
        </p>
      </div>

      <OrderListTable orders={orders} />
    </div>
  );
}
