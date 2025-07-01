import { orders } from "@/lib/data";
import { OrderTable } from "@/components/admin/OrderTable";

export default function AdminOrdersPage() {
  // In a real app, this data would be fetched from Firebase
  const allOrders = orders.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Manage Orders</h1>
      <OrderTable orders={allOrders} />
    </div>
  );
}
