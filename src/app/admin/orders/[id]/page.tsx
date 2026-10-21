import { notFound } from "next/navigation";
import { getAdminOrderById } from "@/server/queries/admin";
import { AdminOrderDetail } from "@/components/admin/AdminOrderDetail";

interface AdminOrderDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function AdminOrderDetailPage({
  params,
}: AdminOrderDetailPageProps) {
  const { id } = await params;
  const order = await getAdminOrderById(id);

  if (!order) notFound();

  return (
    <div className="space-y-6">
      <AdminOrderDetail order={order} />
    </div>
  );
}
