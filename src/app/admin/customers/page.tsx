import { getAdminCustomers } from "@/server/queries/admin";
import { CustomerListTable } from "@/components/admin/CustomerListTable";

export default async function AdminCustomersPage() {
  const customers = await getAdminCustomers();

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

      <CustomerListTable customers={customers} />
    </div>
  );
}
