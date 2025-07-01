import { OrderTable } from "@/components/admin/OrderTable";
import { getOrders } from "@/lib/data";

export const revalidate = 0; // Revalidate on every request

export default async function AdminOrdersPage() {
  const allOrders = await getOrders();

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Manage Orders</h1>
      <OrderTable orders={allOrders} />
    </div>
  );
}
